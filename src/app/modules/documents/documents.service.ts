import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FilterDocumentDto } from './dto/filter-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Document, DocumentEntityType } from 'src/app/entities/document.entity';
import { Repository } from 'typeorm';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';

@Injectable()
export class DocumentsService {
  constructor(@InjectRepository(Document) private documentRepository: Repository<Document>) {}
  private async validateEntity(entityId: string, entityType: DocumentEntityType): Promise<void> {
    const sql = `SELECT * FROM ${entityType}s WHERE id = $1`;
    const result = await this.documentRepository.query(sql, [entityId]);
    if (result.length === 0) {
      throw new BadRequestException(`${entityType} with ID ${entityId} not found`);
    }
  }

  async create(createDocumentDto: CreateDocumentDto, userId: string): Promise<Document> {
    const document = this.documentRepository.create({
      ...createDocumentDto,
      createdBy: userId,
    });
    await this.validateEntity(createDocumentDto.entityId, createDocumentDto.entityType);

    await this.documentRepository.save(document);
    return document;
  }

  async findAll(filters: FilterDocumentDto): Promise<PaginationResponse<Document>> {
    const { page, limit, name, entityId, entityType, createdBy } = filters;
    const query = this.documentRepository.createQueryBuilder('document');
    if (name) {
      query.andWhere('document.name ILIKE :name', { name: `%${name}%` });
    }
    if (entityId) {
      query.andWhere('document.entityId = :entityId', { entityId });
    }
    if (entityType) {
      query.andWhere('document.entityType = :entityType', { entityType });
    }
    if (createdBy) {
      query.andWhere('document.createdBy = :createdBy', { createdBy });
    }
    const [documents, total] = await query
      .orderBy('document.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      items: documents,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string) {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new BadRequestException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);
    return await this.documentRepository.save(document);
  }

  async remove(id: string) {
    await this.documentRepository.softDelete(id);
  }

  async findByInstructorCourses(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
    entityId?: string,
  ): Promise<PaginationResponse<Document>> {
    // Build the WHERE clause using subqueries to find documents linked to instructor's courses
    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .where(
        `(
          (document.entityType = 'course' AND document.entityId IN (
            SELECT id FROM courses WHERE created_by = :instructorId
          ))
          OR
          (document.entityType = 'chapter' AND document.entityId IN (
            SELECT id FROM chapters WHERE course_id IN (
              SELECT id FROM courses WHERE created_by = :instructorId
            )
          ))
          OR
          (document.entityType = 'lecture' AND document.entityId IN (
            SELECT id FROM lectures WHERE chapter_id IN (
              SELECT id FROM chapters WHERE course_id IN (
                SELECT id FROM courses WHERE created_by = :instructorId
              )
            )
          ))
        )`,
        { instructorId },
      )
      .orderBy('document.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (entityId) {
      queryBuilder.andWhere('document.entityId = :entityId', { entityId });
    }

    const [documents, total] = await queryBuilder.getManyAndCount();

    return {
      items: documents,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }
}

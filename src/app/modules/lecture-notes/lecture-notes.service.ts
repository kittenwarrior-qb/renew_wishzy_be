import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLectureNoteDto } from './dto/create-lecture-note.dto';
import { UpdateLectureNoteDto } from './dto/update-lecture-note.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LectureNote } from 'src/app/entities/lecture-note.entity';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { FilterLectureNoteDto } from './dto/filter-lecture-note.dto';

@Injectable()
export class LectureNotesService {
  constructor(
    @InjectRepository(LectureNote)
    private readonly lectureNoteRepository: Repository<LectureNote>,
  ) {}

  async create(createDto: CreateLectureNoteDto, userId: string): Promise<LectureNote> {
    const note = this.lectureNoteRepository.create({
      ...createDto,
      userId,
    });
    return await this.lectureNoteRepository.save(note);
  }

  async findAll(
    filter: FilterLectureNoteDto,
    userId: string,
  ): Promise<PaginationResponse<LectureNote>> {
    const { page = 1, limit = 10, lectureId } = filter;
    const queryBuilder = this.lectureNoteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.lecture', 'lecture')
      .leftJoinAndSelect('lecture.chapter', 'chapter')
      .leftJoinAndSelect('chapter.course', 'course')
      .where('note.userId = :userId', { userId })
      .orderBy('note.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (lectureId) {
      queryBuilder.andWhere('note.lectureId = :lectureId', { lectureId });
    }

    const [notes, total] = await queryBuilder.getManyAndCount();

    return {
      items: notes,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findByLecture(
    lectureId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginationResponse<LectureNote>> {
    const queryBuilder = this.lectureNoteRepository
      .createQueryBuilder('note')
      .where('note.lectureId = :lectureId', { lectureId })
      .andWhere('note.userId = :userId', { userId })
      .orderBy('note.timestampSeconds', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [notes, total] = await queryBuilder.getManyAndCount();

    return {
      items: notes,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(noteId: string, userId: string): Promise<LectureNote> {
    const note = await this.lectureNoteRepository.findOne({
      where: { id: noteId, userId },
    });
    if (!note) {
      throw new BadRequestException(`Note with ID ${noteId} not found`);
    }
    return note;
  }

  async update(
    noteId: string,
    updateDto: UpdateLectureNoteDto,
    userId: string,
  ): Promise<LectureNote> {
    const note = await this.findOne(noteId, userId);
    Object.assign(note, updateDto);
    return await this.lectureNoteRepository.save(note);
  }

  async remove(noteId: string, userId: string): Promise<void> {
    const note = await this.findOne(noteId, userId);
    await this.lectureNoteRepository.remove(note);
  }
}

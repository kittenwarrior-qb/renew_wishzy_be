import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryBlog } from 'src/app/entities/category-blog.entity';
import { CreateCategoryBlogDto, UpdateCategoryBlogDto, FilterCategoryBlogDto } from './dto/category-blog.dto';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';

@Injectable()
export class CategoryBlogService {
    constructor(
        @InjectRepository(CategoryBlog)
        private readonly categoryBlogRepository: Repository<CategoryBlog>,
    ) { }

    async create(createDto: CreateCategoryBlogDto): Promise<CategoryBlog> {
        const category = this.categoryBlogRepository.create(createDto);
        return await this.categoryBlogRepository.save(category);
    }

    async findAll(filter: FilterCategoryBlogDto): Promise<PaginationResponse<CategoryBlog>> {
        const { page = 1, limit = 10, search } = filter;

        const queryBuilder = this.categoryBlogRepository.createQueryBuilder('category')
            .orderBy('category.createdAt', 'DESC')
            .skip((Number(page) - 1) * Number(limit))
            .take(Number(limit));

        if (search) {
            queryBuilder.where('category.name ILIKE :search', { search: `%${search}%` });
        }

        const [items, total] = await queryBuilder.getManyAndCount();

        return {
            items,
            pagination: {
                totalPage: Math.ceil(total / Number(limit)),
                totalItems: total,
                currentPage: Number(page),
                itemsPerPage: Number(limit),
            },
        };
    }

    async findOne(id: string): Promise<CategoryBlog> {
        const category = await this.categoryBlogRepository.findOne({ where: { id } });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async update(id: string, updateDto: UpdateCategoryBlogDto): Promise<CategoryBlog> {
        const category = await this.findOne(id);
        Object.assign(category, updateDto);
        return await this.categoryBlogRepository.save(category);
    }

    async remove(id: string): Promise<void> {
        const category = await this.findOne(id);
        await this.categoryBlogRepository.softDelete(category.id);
    }
}

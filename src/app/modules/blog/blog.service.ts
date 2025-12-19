import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Blog } from 'src/app/entities/blog.entity';
import { CreateBlogDto, UpdateBlogDto, FilterBlogDto } from './dto/blog.dto';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(Blog)
        private readonly blogRepository: Repository<Blog>,
    ) { }

    async create(createDto: CreateBlogDto, authorId: string): Promise<Blog> {
        const blog = this.blogRepository.create({
            ...createDto,
            authorId,
        });
        return await this.blogRepository.save(blog);
    }

    async findAll(filter: FilterBlogDto): Promise<PaginationResponse<Blog>> {
        const { page = 1, limit = 10, search, category, isActive } = filter;

        const queryBuilder = this.blogRepository.createQueryBuilder('blog')
            .leftJoinAndSelect('blog.author', 'author')
            .leftJoinAndSelect('blog.category', 'category')
            .orderBy('blog.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (isActive !== undefined) {
            queryBuilder.andWhere('blog.isActive = :isActive', { isActive });
        }

        if (search) {
            queryBuilder.andWhere('(blog.title ILIKE :search OR blog.description ILIKE :search)', { search: `%${search}%` });
        }

        if (category) {
            queryBuilder.andWhere('blog.categoryId = :category', { category });
        }

        const [items, total] = await queryBuilder.getManyAndCount();

        return {
            items,
            pagination: {
                totalPage: Math.ceil(total / limit),
                totalItems: total,
                currentPage: Number(page),
                itemsPerPage: Number(limit),
            },
        };
    }

    async findOne(id: string): Promise<Blog> {
        const blog = await this.blogRepository.findOne({
            where: { id },
            relations: ['author', 'comments', 'comments.user', 'category'],
        });

        if (!blog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        // Increment views
        await this.blogRepository.increment({ id }, 'views', 1);

        return blog;
    }

    async update(id: string, updateDto: UpdateBlogDto): Promise<Blog> {
        const blog = await this.findOne(id); // Checks existence
        Object.assign(blog, updateDto);
        return await this.blogRepository.save(blog);
    }

    async remove(id: string): Promise<void> {
        const result = await this.blogRepository.softDelete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }
    }

    async getRelated(id: string, limit: number = 5): Promise<Blog[]> {
        const currentBlog = await this.blogRepository.findOne({ where: { id } });
        if (!currentBlog || !currentBlog.categoryId) return [];

        return await this.blogRepository.find({
            where: {
                categoryId: currentBlog.categoryId,
                isActive: true,
            },
            order: { createdAt: 'DESC' },
            take: limit + 1, // Fetch one extra to filter out self
        }).then(blogs => blogs.filter(b => b.id !== id).slice(0, limit));
    }
}

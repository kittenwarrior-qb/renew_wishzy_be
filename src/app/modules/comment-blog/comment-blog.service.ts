import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentBlog } from 'src/app/entities/comment-blog.entity';
import { CreateCommentBlogDto, UpdateCommentBlogDto, FilterCommentBlogDto } from './dto/comment-blog.dto';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';

@Injectable()
export class CommentBlogService {
    constructor(
        @InjectRepository(CommentBlog)
        private readonly commentBlogRepository: Repository<CommentBlog>,
    ) { }

    async create(createDto: CreateCommentBlogDto, userId: string): Promise<CommentBlog> {
        const comment = this.commentBlogRepository.create({
            ...createDto,
            userId,
        });
        return await this.commentBlogRepository.save(comment);
    }

    async findByBlog(blogId: string, filter: FilterCommentBlogDto): Promise<PaginationResponse<CommentBlog>> {
        const { page = 1, limit = 10 } = filter;

        // Fetch top-level comments
        const [comments, total] = await this.commentBlogRepository.findAndCount({
            where: { blogId, parentId: null },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        });

        // Fetch replies for each top-level comment (1 level deep for simplicity, or recursive if needed)
        // For this implementation, let's fetch immediate children.
        const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
            const replies = await this.commentBlogRepository.find({
                where: { parentId: comment.id },
                relations: ['user'],
                order: { createdAt: 'ASC' }
            });
            return { ...comment, replies };
            // Note: 'replies' is not on entity but useful for frontend. 
            // Ideally mapped to a response DTO. Here attaching dynamically.
        }));

        return {
            items: commentsWithReplies as any,
            pagination: {
                totalPage: Math.ceil(total / Number(limit)),
                totalItems: total,
                currentPage: Number(page),
                itemsPerPage: Number(limit),
            },
        };
    }

    async update(id: string, updateDto: UpdateCommentBlogDto, userId: string): Promise<CommentBlog> {
        const comment = await this.commentBlogRepository.findOne({ where: { id } });
        if (!comment) throw new NotFoundException('Comment not found');
        if (comment.userId !== userId) throw new ForbiddenException('Not authorized');

        comment.content = updateDto.content;
        return await this.commentBlogRepository.save(comment);
    }

    async remove(id: string, userId: string): Promise<void> {
        const comment = await this.commentBlogRepository.findOne({ where: { id } });
        if (!comment) throw new NotFoundException('Comment not found');
        if (comment.userId !== userId) throw new ForbiddenException('Not authorized');

        await this.commentBlogRepository.remove(comment);
    }

    async toggleLike(id: string): Promise<void> {
        // Simple like counter increment for now. 
        // Real implementation might track UserLikeBlogComment entity to prevent double likes.
        await this.commentBlogRepository.increment({ id }, 'likes', 1);
    }
}

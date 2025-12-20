import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import type { CommentBlog } from './comment-blog.entity';
import type { CategoryBlog } from './category-blog.entity';

@Entity('blogs')
export class Blog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    image: string;

    @Column({ type: 'uuid', name: 'category_id', nullable: true })
    categoryId: string;

    @ManyToOne('CategoryBlog', (category: any) => category.blogs)
    @JoinColumn({ name: 'category_id' })
    category: CategoryBlog;

    @Column({ type: 'integer', default: 0 })
    views: number;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ type: 'uuid', name: 'author_id' })
    authorId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'author_id' })
    author: User;

    @OneToMany('CommentBlog', (comment: any) => comment.blog)
    comments: CommentBlog[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}

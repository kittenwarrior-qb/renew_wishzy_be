import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Blog } from './blog.entity';

@Entity('comment_blogs')
export class CommentBlog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid', name: 'blog_id' })
    blogId: string;

    @ManyToOne(() => Blog, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'blog_id' })
    blog: Blog;

    @Column({ type: 'uuid', name: 'parent_id', nullable: true })
    parentId: string;

    @ManyToOne(() => CommentBlog, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_id' })
    parent: CommentBlog;

    @OneToMany(() => CommentBlog, (comment) => comment.parent)
    replies: CommentBlog[];

    @Column({ type: 'integer', default: 0 })
    likes: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

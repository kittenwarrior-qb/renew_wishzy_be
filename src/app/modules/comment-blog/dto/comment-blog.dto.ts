import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentBlogDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    blogId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    parentId?: string;
}

export class UpdateCommentBlogDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    content: string;
}

export class FilterCommentBlogDto {
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;
}

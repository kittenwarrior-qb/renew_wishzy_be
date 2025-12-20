import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { CategoryBlogService } from './category-blog.service';
import { CreateCategoryBlogDto, UpdateCategoryBlogDto, FilterCategoryBlogDto } from './dto/category-blog.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { Public } from '../../modules/auth/decorators/public.decorator';

@ApiTags('Blog Categories')
@Controller('category-blogs')
export class CategoryBlogController {
    constructor(private readonly categoryBlogService: CategoryBlogService) { }

    @Post()
    @ApiBearerAuth('bearer')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a blog category' })
    create(@Body() createDto: CreateCategoryBlogDto) {
        return this.categoryBlogService.create(createDto);
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get all blog categories' })
    findAll(@Query() filter: FilterCategoryBlogDto) {
        return this.categoryBlogService.findAll(filter);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get blog category by ID' })
    findOne(@Param('id') id: string) {
        return this.categoryBlogService.findOne(id);
    }

    @Put(':id')
    @ApiBearerAuth('bearer')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update blog category' })
    update(@Param('id') id: string, @Body() updateDto: UpdateCategoryBlogDto) {
        return this.categoryBlogService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiBearerAuth('bearer')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete blog category' })
    remove(@Param('id') id: string) {
        return this.categoryBlogService.remove(id);
    }
}

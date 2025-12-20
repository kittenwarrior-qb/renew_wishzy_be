import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto, FilterBlogDto } from './dto/blog.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { Public } from '../../modules/auth/decorators/public.decorator';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @Post()
    @ApiBearerAuth('bearer')
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Create a new blog post' })
    create(@Body() createDto: CreateBlogDto, @CurrentUser() user: User) {
        return this.blogService.create(createDto, user.id);
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get all blogs' })
    findAll(@Query() filterDto: FilterBlogDto) {
        return this.blogService.findAll(filterDto);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get blog by ID' })
    findOne(@Param('id') id: string) {
        return this.blogService.findOne(id);
    }

    @Put(':id')
    @ApiBearerAuth('bearer')
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Update blog' })
    update(@Param('id') id: string, @Body() updateDto: UpdateBlogDto) {
        return this.blogService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiBearerAuth('bearer')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete blog' })
    remove(@Param('id') id: string) {
        return this.blogService.remove(id);
    }

    @Get(':id/related')
    @Public()
    @ApiOperation({ summary: 'Get related blogs' })
    getRelated(@Param('id') id: string, @Query('limit') limit: number = 5) {
        return this.blogService.getRelated(id, limit);
    }
}

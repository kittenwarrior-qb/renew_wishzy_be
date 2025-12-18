import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FilterDocumentDto } from './dto/filter-document.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { DocumentOwnershipGuard } from './guards/document-ownership.guard';

@Controller('documents')
@ApiTags('Documents')
@ApiBearerAuth('bearer')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async create(@Body() createDocumentDto: CreateDocumentDto, @CurrentUser() user: User) {
    const document = await this.documentsService.create(createDocumentDto, user.id);
    return {
      message: 'Document created successfully',
      ...document,
    };
  }

  @Get()
  async findAll(@Query() filterDto: FilterDocumentDto) {
    const results = await this.documentsService.findAll(filterDto);

    return {
      message: 'Documents retrieved successfully',
      ...results,
    };
  }

  @Get('instructor/my-courses')
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Get all documents for instructor courses',
    description: 'Retrieve a paginated list of all documents from the instructor\'s courses.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'entityId',
    required: false,
    type: String,
    description: 'Filter by specific entity ID (course, chapter, or lecture)',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor documents retrieved successfully',
    schema: {
      example: {
        message: 'Instructor documents retrieved successfully',
        items: [
          {
            id: 'uuid',
            name: 'Course Material',
            descriptions: 'Important course material',
            fileUrl: 'https://example.com/document.pdf',
            entityId: 'uuid',
            entityType: 'course',
            createdBy: 'uuid',
            createdAt: '2025-11-14T10:00:00.000Z',
            updatedAt: '2025-11-14T10:00:00.000Z',
          },
        ],
        pagination: {
          totalPage: 10,
          totalItems: 100,
          currentPage: 1,
          itemsPerPage: 10,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an instructor' })
  async getInstructorDocuments(
    @CurrentUser() user: User,
    @Query() filterDto: FilterDocumentDto,
  ) {
    const result = await this.documentsService.findByInstructorCourses(
      user.id,
      filterDto.page,
      filterDto.limit,
      filterDto.entityId,
    );
    return {
      message: 'Instructor documents retrieved successfully',
      ...result,
    };
  }

  @Get('instructor/:id/download')
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Download document file for instructor',
    description: 'Download a document file that the instructor has uploaded to their courses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Document file download URL',
    schema: {
      example: {
        message: 'Document download URL retrieved successfully',
        downloadUrl: 'https://cloudinary.com/...',
        fileName: 'Course_Material.pdf',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not instructor\'s document' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async downloadInstructorDocument(
    @Param('id') documentId: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.documentsService.getInstructorDocumentDownloadUrl(
      documentId,
      user.id,
    );
    return {
      message: 'Document download URL retrieved successfully',
      ...result,
    };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const document = await this.documentsService.findOne(id);
    return {
      message: 'Document retrieved successfully',
      ...document,
    };
  }

  @Patch(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(DocumentOwnershipGuard)
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    const document = await this.documentsService.update(id, updateDocumentDto);
    return {
      message: 'Document updated successfully',
      ...document,
    };
  }

  @Delete(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(DocumentOwnershipGuard)
  async remove(@Param('id') id: string) {
    await this.documentsService.remove(id);
    return {
      message: 'Document deleted successfully',
    };
  }
}

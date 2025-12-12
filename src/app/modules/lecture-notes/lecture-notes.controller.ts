import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { LectureNotesService } from './lecture-notes.service';
import { CreateLectureNoteDto } from './dto/create-lecture-note.dto';
import { UpdateLectureNoteDto } from './dto/update-lecture-note.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FilterLectureNoteDto } from './dto/filter-lecture-note.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/app/entities/user.entity';

@Controller('lecture-notes')
@ApiBearerAuth('bearer')
@ApiTags('Lecture Notes')
export class LectureNotesController {
  constructor(private readonly lectureNotesService: LectureNotesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new lecture note',
    description: 'Create a personal note at a specific timestamp in a lecture.',
  })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  async create(@Body() createDto: CreateLectureNoteDto, @CurrentUser() user: User) {
    const note = await this.lectureNotesService.create(createDto, user.id);
    return {
      message: 'Note created successfully',
      data: note,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all my notes',
    description: 'Retrieve a paginated list of my notes with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Notes retrieved successfully',
  })
  async findAll(@Query() filterDto: FilterLectureNoteDto, @CurrentUser() user: User) {
    const notes = await this.lectureNotesService.findAll(filterDto, user.id);
    return {
      message: 'Notes retrieved successfully',
      ...notes,
    };
  }

  @Get('lecture/:lectureId')
  @ApiOperation({
    summary: 'Get all my notes for a lecture',
    description: 'Retrieve all my notes for a specific lecture.',
  })
  @ApiParam({
    name: 'lectureId',
    description: 'The unique identifier of the lecture',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lecture notes retrieved successfully',
  })
  async findByLecture(
    @Param('lectureId') lectureId: string,
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const result = await this.lectureNotesService.findByLecture(
      lectureId,
      user.id,
      Number(page),
      Number(limit),
    );
    return {
      message: 'Lecture notes retrieved successfully',
      ...result,
    };
  }

  @Get(':noteId')
  @ApiOperation({
    summary: 'Get a note by ID',
    description: 'Retrieve detailed information about a specific note',
  })
  @ApiParam({
    name: 'noteId',
    description: 'The unique identifier of the note',
  })
  @ApiResponse({
    status: 200,
    description: 'Note retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findOne(@Param('noteId') noteId: string, @CurrentUser() user: User) {
    const note = await this.lectureNotesService.findOne(noteId, user.id);
    return {
      message: 'Note retrieved successfully',
      data: note,
    };
  }

  @Put(':noteId')
  @ApiOperation({
    summary: 'Update a note',
    description: 'Update the content or timestamp of an existing note.',
  })
  @ApiParam({
    name: 'noteId',
    description: 'The unique identifier of the note to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async update(
    @Param('noteId') noteId: string,
    @Body() updateDto: UpdateLectureNoteDto,
    @CurrentUser() user: User,
  ) {
    const note = await this.lectureNotesService.update(noteId, updateDto, user.id);
    return {
      message: 'Note updated successfully',
      data: note,
    };
  }

  @Delete(':noteId')
  @ApiOperation({
    summary: 'Delete a note',
    description: 'Delete a note.',
  })
  @ApiParam({
    name: 'noteId',
    description: 'The unique identifier of the note to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(@Param('noteId') noteId: string, @CurrentUser() user: User) {
    await this.lectureNotesService.remove(noteId, user.id);
    return {
      message: 'Note deleted successfully',
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createQuizDto: CreateQuizDto, @Request() req) {
    return this.quizzesService.create(createQuizDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all public quizzes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isPublic') isPublic?: boolean,
  ) {
    return this.quizzesService.findAll(page, limit, isPublic);
  }

  @Get('my-quizzes')
  @ApiOperation({ summary: "Get creator's quizzes" })
  findMyQuizzes(@Request() req) {
    return this.quizzesService.findByCreator(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz details (without correct answers for taking quiz)' })
  @ApiResponse({ status: 200, description: 'Quiz found' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async findOne(
    @Param('id') id: string,
    @Query('includeAnswers') includeAnswers?: string,
    @Request() req?,
  ) {
    // Only show correct answers if explicitly requested AND user is the creator
    if (includeAnswers === 'true' && req?.user) {
      const isOwner = await this.quizzesService.checkOwnership(id, req.user.id);
      if (isOwner) {
        return this.quizzesService.findOne(id);
      }
    }
    return this.quizzesService.findOneForTaking(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto, @Request() req) {
    return this.quizzesService.update(id, updateQuizDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quiz' })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.quizzesService.remove(id, req.user.id);
  }

  @Get(':id/share')
  @ApiOperation({ summary: 'Get shareable link' })
  getShareLink(@Param('id') id: string) {
    return this.quizzesService.generateShareLink(id);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Get quiz preview for taking (no correct answers shown)' })
  @ApiResponse({ status: 200, description: 'Quiz preview retrieved' })
  getQuizPreview(@Param('id') id: string) {
    return this.quizzesService.findOneForTaking(id);
  }
}

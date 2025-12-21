import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { QuizAttemptsService } from './quiz-attempts.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { AttemptStatus } from '../../entities/enums/attempt-status.enum';

@ApiTags('Quizzes-attempts')
@ApiBearerAuth()
@Controller('quiz-attempts')
@UseGuards(JwtAuthGuard)
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Post('start/:quizId')
  @ApiOperation({ summary: 'Start new quiz attempt' })
  @ApiResponse({ status: 201, description: 'Attempt started successfully' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  startAttempt(@Param('quizId') quizId: string, @Request() req) {
    return this.quizAttemptsService.startAttempt(quizId, req.user.id);
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Submit answer for a question' })
  @ApiResponse({ status: 201, description: 'Answer submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid answer or attempt already completed' })
  submitAnswer(
    @Param('id') attemptId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
    @Request() req,
  ) {
    return this.quizAttemptsService.submitAnswer(attemptId, submitAnswerDto, req.user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete quiz attempt' })
  @ApiResponse({ status: 200, description: 'Attempt completed successfully' })
  @ApiResponse({ status: 400, description: 'Attempt already completed' })
  completeAttempt(@Param('id') attemptId: string, @Request() req) {
    return this.quizAttemptsService.completeAttempt(attemptId, req.user.id);
  }

  @Get('my-attempts')
  @ApiOperation({ summary: "Get user's quiz attempts" })
  getUserAttempts(@Request() req) {
    return this.quizAttemptsService.getUserAttempts(req.user.id);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get all quiz attempts for admin/instructor' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'quizId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Attempts retrieved successfully' })
  async getAdminAttempts(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('quizId') quizId?: string,
    @Query('userId') userId?: string,
  ) {
    const filters = { 
      status: status as AttemptStatus | undefined, 
      quizId, 
      userId 
    };
    
    if (req.user.role === UserRole.ADMIN) {
      return this.quizAttemptsService.getAllAttempts(page, limit, filters);
    } else {
      // Instructor - only get their quiz attempts
      return this.quizAttemptsService.getInstructorAttempts(req.user.id, page, limit, filters);
    }
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get quiz attempt details for admin/instructor' })
  @ApiResponse({ status: 200, description: 'Attempt details retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  getAdminAttemptDetails(@Param('id') attemptId: string, @Request() req) {
    return this.quizAttemptsService.getAttemptDetailsForAdmin(attemptId, req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attempt details' })
  @ApiResponse({ status: 200, description: 'Attempt found' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  getAttemptDetails(@Param('id') attemptId: string, @Request() req) {
    return this.quizAttemptsService.getAttemptDetails(attemptId, req.user.id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get attempt results' })
  @ApiResponse({ status: 200, description: 'Results retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Attempt not completed' })
  getAttemptResults(@Param('id') attemptId: string, @Request() req) {
    return this.quizAttemptsService.getAttemptResults(attemptId, req.user.id);
  }

  @Get('lecture/:lectureId/status')
  @ApiOperation({ summary: 'Get quiz status for a lecture' })
  @ApiResponse({ status: 200, description: 'Quiz status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lecture not found' })
  getLectureQuizStatus(@Param('lectureId') lectureId: string, @Request() req) {
    return this.quizAttemptsService.getLectureQuizStatus(lectureId, req.user.id);
  }

  @Get('lecture/:lectureId/check-completion')
  @ApiOperation({ summary: 'Check if user has completed all quizzes for a lecture' })
  @ApiResponse({ status: 200, description: 'Completion status retrieved' })
  @ApiResponse({ status: 404, description: 'Lecture not found' })
  checkLectureQuizCompletion(@Param('lectureId') lectureId: string, @Request() req) {
    return this.quizAttemptsService.checkLectureQuizCompletion(lectureId, req.user.id);
  }

  @Post(':id/complete-and-check')
  @ApiOperation({ summary: 'Complete quiz attempt and check lecture completion' })
  @ApiResponse({ status: 200, description: 'Attempt completed and lecture status checked' })
  @ApiResponse({ status: 400, description: 'Attempt already completed' })
  completeAttemptAndCheckLecture(
    @Param('id') attemptId: string,
    @Body() body: { enrollmentId?: string },
    @Request() req,
  ) {
    return this.quizAttemptsService.completeAttemptAndCheckLecture(
      attemptId,
      req.user.id,
      body.enrollmentId,
    );
  }
}

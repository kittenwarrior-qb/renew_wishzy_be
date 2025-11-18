import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizAttemptsService } from './quiz-attempts.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}

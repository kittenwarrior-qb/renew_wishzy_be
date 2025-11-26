import { Controller, Get, Body, Patch, Param, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { EnrollmentsService } from './enrollments.service';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('enrollments')
@ApiTags('Enrollments')
@ApiBearerAuth('bearer')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  async findAllEnrollmentOfUser(@Param('userId') userId: string) {
    return this.enrollmentsService.findAllEnrollmentOfUser(userId);
  }

  @Get('my-enrollments')
  async getMyEnrollments(@CurrentUser() user: User) {
    return this.enrollmentsService.findAllEnrollmentOfUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Patch(':id/attributes')
  async updateAttributes(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
    @Req() req: Request,
  ) {
    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/');
    const enrollment = await this.enrollmentsService.patchAttributes(
      id,
      updateAttributeDto.attributes,
      origin,
    );
    return {
      message: 'Enrollment attributes updated successfully',
      ...enrollment,
    };
  }

  @Get(':id/certificate')
  async getCertificate(@Param('id') id: string) {
    return this.enrollmentsService.getCertificate(id);
  }

  @Patch(':id/certificate/regenerate')
  async regenerateCertificate(@Param('id') id: string) {
    return this.enrollmentsService.regenerateCertificate(id);
  }
}

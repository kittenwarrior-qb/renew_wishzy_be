import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('FAQs')
@Controller('faqs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all active FAQs (public)' })
  @ApiResponse({ status: 200, description: 'List of active FAQs' })
  async findAllActive() {
    const faqs = await this.faqsService.findAllActive();
    return {
      success: true,
      data: faqs,
      message: 'FAQs retrieved successfully',
    };
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all FAQs including inactive (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all FAQs' })
  async findAll() {
    const faqs = await this.faqsService.findAll();
    return {
      success: true,
      data: faqs,
      message: 'All FAQs retrieved successfully',
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get FAQ by ID' })
  @ApiResponse({ status: 200, description: 'FAQ details' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async findOne(@Param('id') id: string) {
    const faq = await this.faqsService.findOne(id);
    return {
      success: true,
      data: faq,
      message: 'FAQ retrieved successfully',
    };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new FAQ (admin only)' })
  @ApiResponse({ status: 201, description: 'FAQ created successfully' })
  async create(@Body() createFaqDto: CreateFaqDto) {
    const faq = await this.faqsService.create(createFaqDto);
    return {
      success: true,
      data: faq,
      message: 'FAQ created successfully',
    };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update FAQ (admin only)' })
  @ApiResponse({ status: 200, description: 'FAQ updated successfully' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    const faq = await this.faqsService.update(id, updateFaqDto);
    return {
      success: true,
      data: faq,
      message: 'FAQ updated successfully',
    };
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle FAQ active status (admin only)' })
  @ApiResponse({ status: 200, description: 'FAQ status toggled' })
  async toggleActive(@Param('id') id: string) {
    const faq = await this.faqsService.toggleActive(id);
    return {
      success: true,
      data: faq,
      message: `FAQ is now ${faq.isActive ? 'active' : 'inactive'}`,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete FAQ (admin only)' })
  @ApiResponse({ status: 200, description: 'FAQ deleted successfully' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async remove(@Param('id') id: string) {
    await this.faqsService.remove(id);
    return {
      success: true,
      message: 'FAQ deleted successfully',
    };
  }
}

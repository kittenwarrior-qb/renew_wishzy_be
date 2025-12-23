import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { FilterVoucherDto } from './dto/filter-voucher.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@Controller('vouchers')
@ApiTags('Vouchers')
@ApiBearerAuth('bearer')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createVoucherDto: CreateVoucherDto, @CurrentUser() user: User) {
    const voucher = await this.vouchersService.create(createVoucherDto, user.id);
    return {
      message: 'Voucher created successfully',
      ...voucher,
    };
  }

  @Get()
  async findAll(@Query() filterDto: FilterVoucherDto) {
    const results = await this.vouchersService.findAll(filterDto);

    return {
      message: 'Vouchers retrieved successfully',
      ...results,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const voucher = await this.vouchersService.findOne(id);
    return {
      message: 'Voucher found successfully',
      ...voucher,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    const voucher = await this.vouchersService.update(id, updateVoucherDto);
    return {
      message: 'Voucher updated successfully',
      ...voucher,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.vouchersService.remove(id);
    return {
      message: 'Voucher deleted successfully',
    };
  }

  @Post('available')
  @Public()
  async getAvailableVouchers(@Body() body: { courseIds: string[] }) {
    const courseIds = body?.courseIds || [];
    const vouchers = await this.vouchersService.getAvailableVouchers(courseIds);
    return {
      message: 'Available vouchers retrieved successfully',
      data: vouchers,
    };
  }

  @Post('validate')
  async validateVoucher(@Body() body: { code: string; orderTotal: number; courseIds: string[] }) {
    const result = await this.vouchersService.validateVoucherCode(
      body.code,
      body.orderTotal,
      body.courseIds,
    );
    return {
      message: result.message,
      data: result,
    };
  }
}

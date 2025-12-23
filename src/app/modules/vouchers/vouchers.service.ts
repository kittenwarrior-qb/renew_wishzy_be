import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { FilterVoucherDto } from './dto/filter-voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplyScope, Voucher } from 'src/app/entities/vouchers.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CoursesService } from '../courses/courses.service';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private readonly categoriesService: CategoriesService,
    private readonly coursesService: CoursesService,
  ) {}

  private async validateVoucher(createVoucherDto: CreateVoucherDto): Promise<void> {
    if (createVoucherDto.applyScope === ApplyScope.CATEGORY && createVoucherDto.categoryId) {
      await this.categoriesService.findById(createVoucherDto.categoryId);
    }

    if (createVoucherDto.applyScope === ApplyScope.COURSE && createVoucherDto.courseId) {
      await this.coursesService.findOne(createVoucherDto.courseId);
    }
  }

  async create(createVoucherDto: CreateVoucherDto, userId: string): Promise<Voucher> {
    await this.validateVoucher(createVoucherDto);
    const voucher = this.voucherRepository.create({ ...createVoucherDto, userId });
    return await this.voucherRepository.save(voucher);
  }

  async findAll(filter: FilterVoucherDto): Promise<PaginationResponse<Voucher>> {
    const {
      page = 1,
      limit = 10,
      name,
      code,
      discountType,
      applyScope,
      categoryId,
      courseId,
      isActive,
      startDate,
      endDate,
    } = filter;

    const queryBuilder = this.voucherRepository.createQueryBuilder('voucher');

    if (name) {
      queryBuilder.andWhere('voucher.name ILIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('voucher.code ILIKE :code', { code: `%${code}%` });
    }

    if (discountType) {
      queryBuilder.andWhere('voucher.discount_type = :discountType', { discountType });
    }

    if (applyScope) {
      queryBuilder.andWhere('voucher.apply_scope = :applyScope', { applyScope });
    }

    if (categoryId) {
      queryBuilder.andWhere('voucher.category_id = :categoryId', { categoryId });
    }

    if (courseId) {
      queryBuilder.andWhere('voucher.course_id = :courseId', { courseId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('voucher.is_active = :isActive', { isActive });
    }

    if (startDate) {
      queryBuilder.andWhere('voucher.start_date >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere('voucher.end_date <= :endDate', { endDate: new Date(endDate) });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    queryBuilder.orderBy('voucher.created_at', 'DESC');

    const [vouchers, total] = await queryBuilder.getManyAndCount();
    return {
      items: vouchers,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({ where: { id } });
    if (!voucher) {
      throw new BadRequestException(`Voucher with ID ${id} not found`);
    }
    return voucher;
  }

  async update(id: string, updateVoucherDto: UpdateVoucherDto): Promise<Voucher> {
    const voucher = await this.findOne(id);
    Object.assign(voucher, updateVoucherDto);
    return await this.voucherRepository.save(voucher);
  }

  async remove(id: string): Promise<void> {
    const voucher = await this.findOne(id);
    await this.voucherRepository.remove(voucher);
  }

  async findByCode(code: string): Promise<Voucher | null> {
    return await this.voucherRepository.findOne({ where: { code } });
  }

  /**
   * Get available vouchers for given courses
   * Returns vouchers that can be applied to the order
   */
  async getAvailableVouchers(courseIds: string[]): Promise<Voucher[]> {
    const now = new Date();

    const queryBuilder = this.voucherRepository.createQueryBuilder('voucher');

    queryBuilder
      .where('voucher.is_active = :isActive', { isActive: true })
      .andWhere('voucher.start_date <= :now', { now })
      .andWhere('voucher.end_date >= :now', { now });

    // Filter by apply scope
    if (courseIds.length > 0) {
      queryBuilder.andWhere(
        `(
          voucher.apply_scope = :scopeAll
          OR (voucher.apply_scope = :scopeCourse AND voucher.course_id IN (:...courseIds))
        )`,
        {
          scopeAll: ApplyScope.ALL,
          scopeCourse: ApplyScope.COURSE,
          courseIds,
        },
      );
    } else {
      // If no courses, only return ALL scope vouchers
      queryBuilder.andWhere('voucher.apply_scope = :scopeAll', {
        scopeAll: ApplyScope.ALL,
      });
    }

    queryBuilder.orderBy('voucher.discount_value', 'DESC');

    return await queryBuilder.getMany();
  }

  async validateVoucherCode(
    code: string,
    orderTotal: number,
    courseIds: string[],
  ): Promise<{ valid: boolean; voucher?: Voucher; discount?: number; message?: string }> {
    const voucher = await this.findByCode(code.toUpperCase());

    console.log('=== VALIDATE VOUCHER ===');
    console.log('Code:', code);
    console.log('Order Total:', orderTotal);
    console.log('Course IDs:', courseIds);
    console.log('Voucher found:', voucher ? 'Yes' : 'No');

    if (!voucher) {
      return { valid: false, message: 'Mã giảm giá không tồn tại' };
    }

    console.log('Voucher details:', {
      isActive: voucher.isActive,
      minOrderAmount: voucher.minOrderAmount,
      applyScope: voucher.applyScope,
      courseId: voucher.courseId,
    });

    if (!voucher.isActive) {
      return { valid: false, message: 'Mã giảm giá đã bị vô hiệu hóa' };
    }

    const now = new Date();
    if (voucher.startDate && now < new Date(voucher.startDate)) {
      return { valid: false, message: 'Mã giảm giá chưa có hiệu lực' };
    }

    if (voucher.endDate && now > new Date(voucher.endDate)) {
      return { valid: false, message: 'Mã giảm giá đã hết hạn' };
    }

    if (voucher.minOrderAmount && orderTotal < Number(voucher.minOrderAmount)) {
      console.log('Failed: minOrderAmount check', {
        required: Number(voucher.minOrderAmount),
        actual: orderTotal,
      });
      return {
        valid: false,
        message: `Đơn hàng tối thiểu ${Number(voucher.minOrderAmount).toLocaleString('vi-VN')}đ để áp dụng mã này`,
      };
    }

    // Check apply scope
    if (voucher.applyScope === ApplyScope.COURSE && voucher.courseId) {
      if (!courseIds.includes(voucher.courseId)) {
        console.log('Failed: course scope check', {
          voucherCourseId: voucher.courseId,
          orderCourseIds: courseIds,
        });
        return { valid: false, message: 'Mã giảm giá không áp dụng cho các khóa học này' };
      }
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discountType === 'percent') {
      discount = (orderTotal * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscountAmount && discount > Number(voucher.maxDiscountAmount)) {
        discount = Number(voucher.maxDiscountAmount);
      }
    } else {
      discount = Number(voucher.discountValue);
    }

    // Ensure discount doesn't exceed order total
    discount = Math.min(discount, orderTotal);

    console.log('Validation passed! Discount:', discount);

    return {
      valid: true,
      voucher,
      discount,
      message: 'Áp dụng mã giảm giá thành công',
    };
  }
}

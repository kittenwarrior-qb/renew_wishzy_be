import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('banners')
@ApiBearerAuth('bearer')
@ApiTags('Banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createBannerDto: CreateBannerDto) {
    const banner = await this.bannersService.create(createBannerDto);
    return {
      message: 'Banner created successfully',
      banner,
    };
  }

  @Get()
  @Public()
  async findAll() {
    const banners = await this.bannersService.findAll();
    return {
      message: 'Banners fetched successfully',
      banners,
    };
  }

  @Get(':bannerId')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('bannerId') bannerId: string) {
    const banner = await this.bannersService.findOne(bannerId);
    return {
      message: 'Banner fetched successfully',
      banner,
    };
  }

  @Patch(':bannerId')
  @Roles(UserRole.ADMIN)
  async update(@Param('bannerId') bannerId: string, @Body() updateBannerDto: UpdateBannerDto) {
    const updatedBanner = await this.bannersService.update(bannerId, updateBannerDto);
    return {
      message: 'Banner updated successfully',
      updatedBanner,
    };
  }

  @Delete(':bannerId')
  @Roles(UserRole.ADMIN)
  async remove(@Param('bannerId') bannerId: string) {
    const deletedBanner = await this.bannersService.remove(bannerId);
    return {
      message: 'Banner deleted successfully',
      deletedBanner,
    };
  }
}

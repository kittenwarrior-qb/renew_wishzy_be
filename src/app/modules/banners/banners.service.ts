import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Banner } from 'src/app/entities/banner.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}
  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepository.create(createBannerDto);
    return await this.bannerRepository.save(banner);
  }

  async findAll(): Promise<Banner[]> {
    return await this.bannerRepository.find();
  }

  async findOne(bannerId: string): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({ where: { id: bannerId } });
    if (!banner) {
      throw new BadRequestException(`Banner with ID ${bannerId} not found`);
    }
    return banner;
  }

  async update(bannerId: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(bannerId);
    return await this.bannerRepository.save({ ...banner, ...updateBannerDto });
  }

  async remove(bannerId: string): Promise<Banner> {
    const banner = await this.findOne(bannerId);
    return await this.bannerRepository.remove(banner);
  }
}

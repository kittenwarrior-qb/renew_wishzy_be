import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from 'src/app/entities/banner.entity';

@Module({
  controllers: [BannersController],
  providers: [BannersService],
  imports: [TypeOrmModule.forFeature([Banner])],
})
export class BannersModule {}

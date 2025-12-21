import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from 'src/app/entities/faq.entity';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [FaqsController],
  providers: [FaqsService],
  exports: [FaqsService],
})
export class FaqsModule {}

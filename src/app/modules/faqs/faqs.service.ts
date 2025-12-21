import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from 'src/app/entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  /**
   * Get all active FAQs (public)
   */
  async findAllActive(): Promise<Faq[]> {
    return this.faqRepository.find({
      where: { isActive: true },
      order: { orderIndex: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Get all FAQs including inactive (admin)
   */
  async findAll(): Promise<Faq[]> {
    return this.faqRepository.find({
      order: { orderIndex: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Get single FAQ by ID
   */
  async findOne(id: string): Promise<Faq> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  /**
   * Create new FAQ
   */
  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    const faq = this.faqRepository.create(createFaqDto);
    return this.faqRepository.save(faq);
  }

  /**
   * Update FAQ
   */
  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOne(id);
    Object.assign(faq, updateFaqDto);
    return this.faqRepository.save(faq);
  }

  /**
   * Delete FAQ
   */
  async remove(id: string): Promise<void> {
    const faq = await this.findOne(id);
    await this.faqRepository.remove(faq);
  }

  /**
   * Toggle FAQ active status
   */
  async toggleActive(id: string): Promise<Faq> {
    const faq = await this.findOne(id);
    faq.isActive = !faq.isActive;
    return this.faqRepository.save(faq);
  }
}

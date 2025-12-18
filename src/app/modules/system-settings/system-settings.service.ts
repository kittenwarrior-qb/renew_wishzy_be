import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting, SystemSettingKey } from '../../entities/system-setting.entity';
import { UpdateSettingDto } from './dto/system-setting.dto';

@Injectable()
export class SystemSettingsService {
  // Default values for settings
  private readonly defaults: Record<string, string> = {
    [SystemSettingKey.INSTRUCTOR_REVENUE_PERCENTAGE]: '70',
  };

  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingRepository: Repository<SystemSetting>,
  ) {}

  /**
   * Get all system settings
   */
  async findAll(): Promise<SystemSetting[]> {
    return this.settingRepository.find({
      order: { key: 'ASC' },
    });
  }

  /**
   * Get a setting by key
   */
  async findByKey(key: string): Promise<SystemSetting | null> {
    return this.settingRepository.findOne({ where: { key } });
  }

  /**
   * Get setting value by key with default fallback
   */
  async getValue(key: string): Promise<string> {
    const setting = await this.findByKey(key);
    if (setting) {
      return setting.value;
    }
    return this.defaults[key] || '';
  }

  /**
   * Get instructor revenue percentage (0-100)
   * Returns the percentage that instructors receive from course sales
   */
  async getInstructorRevenuePercentage(): Promise<number> {
    const value = await this.getValue(SystemSettingKey.INSTRUCTOR_REVENUE_PERCENTAGE);
    const percentage = parseFloat(value);
    
    // Validate and clamp between 0-100
    if (isNaN(percentage)) {
      return 70; // Default fallback
    }
    return Math.min(100, Math.max(0, percentage));
  }

  /**
   * Get system revenue percentage (100 - instructor percentage)
   */
  async getSystemRevenuePercentage(): Promise<number> {
    const instructorPercentage = await this.getInstructorRevenuePercentage();
    return 100 - instructorPercentage;
  }

  /**
   * Update a setting by key
   */
  async update(key: string, updateDto: UpdateSettingDto): Promise<SystemSetting> {
    let setting = await this.findByKey(key);
    
    if (!setting) {
      // Create new setting if it doesn't exist
      setting = this.settingRepository.create({
        key,
        value: updateDto.value,
        description: updateDto.description,
      });
    } else {
      // Update existing setting
      setting.value = updateDto.value;
      if (updateDto.description !== undefined) {
        setting.description = updateDto.description;
      }
    }

    return this.settingRepository.save(setting);
  }

  /**
   * Calculate instructor share from a total amount
   */
  async calculateInstructorShare(totalAmount: number): Promise<number> {
    const percentage = await this.getInstructorRevenuePercentage();
    return Math.round(totalAmount * percentage / 100);
  }

  /**
   * Calculate system share from a total amount
   */
  async calculateSystemShare(totalAmount: number): Promise<number> {
    const percentage = await this.getSystemRevenuePercentage();
    return Math.round(totalAmount * percentage / 100);
  }
}

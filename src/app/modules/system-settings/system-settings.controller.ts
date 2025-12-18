import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSettingDto, SettingResponseDto, AllSettingsResponseDto } from './dto/system-setting.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('System Settings')
@ApiBearerAuth('bearer')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lấy tất cả cài đặt hệ thống',
    description: 'Chỉ dành cho Admin. Trả về danh sách tất cả các cài đặt hệ thống.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách cài đặt thành công',
    type: AllSettingsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Chỉ Admin mới có quyền' })
  async findAll(): Promise<AllSettingsResponseDto> {
    const settings = await this.settingsService.findAll();
    return {
      items: settings.map((s) => ({
        key: s.key,
        value: s.value,
        description: s.description,
      })),
    };
  }

  @Get(':key')
  @ApiOperation({
    summary: 'Lấy cài đặt theo key',
    description: 'Lấy giá trị của một cài đặt theo key',
  })
  @ApiParam({
    name: 'key',
    description: 'Key của setting',
    example: 'instructor_revenue_percentage',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy cài đặt thành công',
    type: SettingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Setting không tồn tại' })
  async findOne(@Param('key') key: string): Promise<SettingResponseDto> {
    const setting = await this.settingsService.findByKey(key);
    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }
    return {
      key: setting.key,
      value: setting.value,
      description: setting.description,
    };
  }

  @Put(':key')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Cập nhật cài đặt',
    description: 'Chỉ dành cho Admin. Cập nhật giá trị của một cài đặt.',
  })
  @ApiParam({
    name: 'key',
    description: 'Key của setting cần cập nhật',
    example: 'instructor_revenue_percentage',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Setting updated successfully' },
        key: { type: 'string', example: 'instructor_revenue_percentage' },
        value: { type: 'string', example: '70' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Chỉ Admin mới có quyền' })
  async update(
    @Param('key') key: string,
    @Body() updateDto: UpdateSettingDto,
  ) {
    const setting = await this.settingsService.update(key, updateDto);
    return {
      message: 'Setting updated successfully',
      key: setting.key,
      value: setting.value,
    };
  }
}

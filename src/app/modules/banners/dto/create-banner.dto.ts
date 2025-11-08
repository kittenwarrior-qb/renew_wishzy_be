import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ example: 'Banner title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Banner image url' })
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;

  @ApiProperty({ example: 'Banner link' })
  @IsString()
  @IsNotEmpty()
  link!: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  position!: number;
}

import { IsNotEmpty, IsString, IsOptional, IsEmail, IsArray, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHoursDto {
  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsBoolean()
  isOpen: boolean;
}

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: Record<string, WorkingHoursDto>;

  @IsOptional()
  @IsString()
  category?: string;
}

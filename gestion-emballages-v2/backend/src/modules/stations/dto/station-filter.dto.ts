import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto';

export class StationFilterDto extends PaginationDto {
  @ApiProperty({ 
    required: false, 
    description: 'Filter by station group ID. Use "independent" for stations without a group' 
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  stationGroupId?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Filter by city' 
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  city?: string;
}
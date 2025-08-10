import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStationGroupDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

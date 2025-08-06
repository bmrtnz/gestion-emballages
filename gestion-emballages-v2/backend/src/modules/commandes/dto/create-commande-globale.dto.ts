import { IsString, IsUUID, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';
import { CreateCommandeDto } from './create-commande.dto';

export class CreateCommandeGlobaleDto {
  @ApiProperty({ description: 'Station ID' })
  @IsUUID()
  stationId: string;

  @ApiPropertyOptional({ 
    description: 'Statut général de la commande globale',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  statutGeneral?: OrderStatus;

  @ApiProperty({ 
    description: 'Commandes individuelles',
    type: [CreateCommandeDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommandeDto)
  commandes: Omit<CreateCommandeDto, 'stationId'>[];
}
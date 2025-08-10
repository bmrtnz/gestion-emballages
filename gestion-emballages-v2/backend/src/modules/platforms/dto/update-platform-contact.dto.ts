import { PartialType } from '@nestjs/swagger';
import { CreatePlatformContactDto } from './create-platform-contact.dto';

export class UpdatePlatformContactDto extends PartialType(CreatePlatformContactDto) {}

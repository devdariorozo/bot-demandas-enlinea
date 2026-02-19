import { PartialType } from '@nestjs/swagger';
import { CreateConfigDataBasesDto } from './create-config-data-bases.dto';

export class UpdateConfigDataBasesDto extends PartialType(
  CreateConfigDataBasesDto,
) {}

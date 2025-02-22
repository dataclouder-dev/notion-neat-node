import { ApiProperty, PartialType } from '@nestjs/swagger';

export interface IGeneric {
  id: string;
  name: string;
  description: string;
  content: string;
  img: string;
}

export class CreateGenericDto {
  @ApiProperty({ description: 'The name of the generic item' })
  name: string;

  @ApiProperty({ description: 'The description of the generic item' })
  description: string;

  @ApiProperty({ description: 'The content of the generic item' })
  content: string;

  @ApiProperty({ description: 'The image of the generic item' })
  img: string;
}

export class UpdateGenericDto extends PartialType(CreateGenericDto) {}

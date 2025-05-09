import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { getErrorMessages } from '../../errorMessages/errorMessages';

export enum ElementType {
  RECT = 'rect',
  ELLIPSE = 'ellipse',
  TEXT = 'text',
  LINE = 'line',
  MARKER = 'marker',
}

class BaseElementDto {
  @IsString({ message: getErrorMessages({ elementId: 'invalidType' }).id })
  readonly id: string;

  @IsEnum(ElementType, {
    message: getErrorMessages({ elementId: 'invalidType' }).id,
  })
  readonly type: ElementType;

  @IsBoolean({
    message: getErrorMessages({ draggable: 'invalidType' }).draggable,
  })
  readonly draggable: boolean;

  @IsNumber(
    {},
    { message: getErrorMessages({ dragDistance: 'invalidType' }).dragDistance },
  )
  readonly dragDistance: number;

  @IsNumber({}, { message: getErrorMessages({ x: 'invalidType' }).x })
  readonly x: number;

  @IsNumber({}, { message: getErrorMessages({ y: 'invalidType' }).y })
  readonly y: number;

  @IsNumber(
    {},
    { message: getErrorMessages({ rotation: 'invalidType' }).rotation },
  )
  readonly rotation: number;

  @IsString({ message: getErrorMessages({ fill: 'invalidType' }).fill })
  readonly fill: string;

  @IsString({ message: getErrorMessages({ stroke: 'invalidType' }).stroke })
  readonly stroke: string;

  @IsNumber(
    {},
    { message: getErrorMessages({ strokeWidth: 'invalidType' }).strokeWidth },
  )
  readonly strokeWidth: number;
}

class RectElementDto extends BaseElementDto {
  @IsNumber(
    {},
    { message: getErrorMessages({ cornerRadius: 'invalidType' }).cornerRadius },
  )
  readonly cornerRadius: number;

  @IsNumber({}, { message: getErrorMessages({ width: 'invalidType' }).width })
  readonly width: number;

  @IsNumber({}, { message: getErrorMessages({ height: 'invalidType' }).height })
  readonly height: number;
}

class EllipseElementDto extends BaseElementDto {
  @IsNumber({}, { message: getErrorMessages({ width: 'invalidType' }).width })
  readonly width: number;

  @IsNumber({}, { message: getErrorMessages({ height: 'invalidType' }).height })
  readonly height: number;
}

class TextElementDto extends BaseElementDto {
  @IsString({ message: getErrorMessages({ svg: 'invalidType' }).svg })
  readonly svg: string;

  @IsString({ message: getErrorMessages({ content: 'invalidType' }).content })
  readonly content: string;

  @IsNumber({}, { message: getErrorMessages({ width: 'invalidType' }).width })
  readonly width: number;

  @IsNumber({}, { message: getErrorMessages({ height: 'invalidType' }).height })
  readonly height: number;
}

class LineElementDto extends BaseElementDto {
  @IsArray({ message: getErrorMessages({ points: 'invalidType' }).points })
  @IsNumber(
    {},
    {
      each: true,
      message: getErrorMessages({ points: 'invalidArrayItems' }).points,
    },
  )
  readonly points: number[];

  @IsNumber({}, { message: getErrorMessages({ width: 'invalidType' }).width })
  readonly width: number;
}

class MarkerElementDto extends BaseElementDto {
  @IsArray({ message: getErrorMessages({ points: 'invalidType' }).points })
  @IsNumber(
    {},
    {
      each: true,
      message: getErrorMessages({ points: 'invalidArrayItems' }).points,
    },
  )
  readonly points: number[];

  @IsNumber({}, { message: getErrorMessages({ width: 'invalidType' }).width })
  readonly width: number;

  @IsNumber(
    {},
    { message: getErrorMessages({ opacity: 'invalidType' }).opacity },
  )
  readonly opacity: number;
}

export class CreateElementDto {
  @ValidateNested()
  @Type(() => BaseElementDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: RectElementDto, name: ElementType.RECT },
        { value: EllipseElementDto, name: ElementType.ELLIPSE },
        { value: TextElementDto, name: ElementType.TEXT },
        { value: LineElementDto, name: ElementType.LINE },
        { value: MarkerElementDto, name: ElementType.MARKER },
      ],
    },
  })
  readonly element: BaseElementDto;
}

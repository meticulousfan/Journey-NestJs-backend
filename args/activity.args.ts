import { ArgsType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

@ArgsType()
export class CreateActivityArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly journey: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly client: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly user: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
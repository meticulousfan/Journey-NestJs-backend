import { ArgsType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

@ArgsType()
export class CreateJourneyStepArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly journey: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly description: string;
}

@ArgsType()
export class UpdateJourneyStepArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly journey: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly description: string;
}

@ArgsType()
export class UpdateJourneyStepStatusArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly status: string;
}

@ArgsType()
export class DeleteJourneyStepArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;
}

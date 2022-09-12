import { ArgsType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

@ArgsType()
export class CreateJourneyArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly title: string;
}

@ArgsType()
export class UpdateJourneyArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly title: string;
}

@ArgsType()
export class UpdateJourneyStatusArgs {
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
export class DeleteJourneyArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;
}

@ArgsType()
export class GetJourneyArgs {
  @Field({ nullable: true })
  @IsOptional()
  uuid?: string;

  @Field((type) => Int, { nullable: true })
  @Min(0)
  @IsOptional()
  skip?: number;

  @Field((type) => Int, { nullable: true })
  @Min(1)
  @IsOptional()
  take?: number;
}

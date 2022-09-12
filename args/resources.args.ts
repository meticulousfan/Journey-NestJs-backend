import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, Min } from 'class-validator';
import { ResourceType } from 'src/journey/entity/resources.entity';

@ArgsType()
export class CreateResourceArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly link: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly type: ResourceType;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly step: string;
}

@ArgsType()
export class UpdateResourceArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly link: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly type: ResourceType;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly step: string;
}

@ArgsType()
export class DeleteResourceArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;
}

@ArgsType()
export class GetResourcesArgs {
  @Field()
  @IsString()
  @IsOptional()
  journey?: string;

  @Field((type) => Int, { nullable: true })
  @Min(0)
  @IsOptional()
  skip?: number;

  @Field((type) => Int, { nullable: true })
  @Min(1)
  @IsOptional()
  take?: number;
}

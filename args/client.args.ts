import { ArgsType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

import { GraphQLUpload, FileUpload } from 'graphql-upload';

@ArgsType()
export class CreateClientArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly journey: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly street_address: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly suburb: string;
}

@ArgsType()
export class UpdateClientArgs {
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
  readonly first_name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly street_address: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly suburb: string;
}

@ArgsType()
export class DeleteClient {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly journey: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;
}

@ArgsType()
export class GetClient {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly journey: string;
}

@ArgsType()
export class GetClientByCode {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}

@ArgsType()
export class GetClientByJourney {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly journey: string;
}

@ArgsType()
export class GetClientsArgs {
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

@ArgsType()
export class UpdateClientStepArgs {
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
  readonly start_date: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly end_state: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly status: string;
}

@ArgsType()
export class ClientMessagesArgs {
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
  readonly message: string;
}

@ArgsType()
export class ClientFilesArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly journey: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly client: string;

  @Field((type) => GraphQLUpload, { name: 'file' })
  @IsNotEmpty()
  file: FileUpload;
}

@ArgsType()
export class ClientCode {
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly journey: string;
}

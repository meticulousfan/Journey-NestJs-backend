import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class ClientDTO {
  @Field((type) => String)
  uuid: string;

  @Field((type) => GraphQLJSON)
  journey: string;

  @Field((type) => GraphQLJSON)
  steps: string;

  @Field((type) => GraphQLJSON)
  contact: string;

  @Field((type) => GraphQLJSON)
  activity: string;

  @Field((type) => GraphQLJSON)
  files: string;

  @Field((type) => GraphQLJSON)
  messages: string;

  @Field((type) => String)
  first_name: string;

  @Field((type) => String)
  last_name: string;

  @Field((type) => String)
  street_address: string;

  @Field((type) => String)
  suburb: string;

  @Field((type) => String)
  status: string;

  @Field((type) => String)
  start_date: string;

  @Field((type) => String)
  end_date: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ClientMessageDTO {
  @Field((type) => String)
  uuid: string;

  @Field((type) => String)
  message: string;

  @Field((type) => GraphQLJSON)
  journey: string;

  @Field((type) => GraphQLJSON)
  client: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CodeDTO {
  @Field((type) => String)
  uuid: string;

  @Field((type) => GraphQLJSON)
  journey: string;

  @Field((type) => GraphQLJSON)
  client: string;
}

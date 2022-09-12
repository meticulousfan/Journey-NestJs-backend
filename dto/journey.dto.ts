import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class JourneyDTO {
  @Field((type) => String)
  uuid: string;

  @Field((type) => String)
  title: string;

  @Field((type) => GraphQLJSON)
  user: string;

  @Field((type) => GraphQLJSON)
  steps: string;

  @Field((type) => String)
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

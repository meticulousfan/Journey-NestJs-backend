import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class JourneyStepsDTO {
  @Field((type) => String)
  uuid: string;

  @Field((type) => String)
  title: string;

  @Field((type) => String)
  description: string;

  @Field((type) => GraphQLJSON)
  journey: string;

  @Field((type) => GraphQLJSON)
  resources: string;

  @Field((type) => GraphQLJSON)
  user: string;

  @Field((type) => String)
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

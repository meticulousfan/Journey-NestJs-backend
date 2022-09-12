import { Field, Int, ObjectType, EnumOptions } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class JourneyResourcesDTO {
  @Field((type) => String)
  uuid: string;

  @Field((type) => String)
  name: string;

  @Field((type) => String)
  link: string;

  @Field((type) => String)
  type: string;

  @Field((type) => GraphQLJSON)
  user: string;

  @Field((type) => GraphQLJSON)
  step: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

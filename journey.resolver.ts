import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { JourneyEntity } from './entity/journey.entity';
import { JourneyStepsEntity } from './entity/steps.entity';
import { JourneyService } from './journey.service';
import {
  PaginatedJourneyResponse,
  PaginatedJourneyResourcesResponse,
  PaginatedJourneyClientsResponse,
} from '../paginate/paginated-response';
import { GqlAuthGuard } from '../auth/gql/gql-auth.guard';
import { CurrentUser } from '../auth/gql/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { ResponseDTO } from '../common/dto/response.dto';
import {
  JourneyStepsResourcesEntity,
  ResourceType,
} from './entity/resources.entity';
import { JourneyClientsEntity } from './entity/client.entity';
import { ClientDTO, ClientMessageDTO, CodeDTO } from './dto/client.dto';
import {
  CreateClientArgs,
  UpdateClientArgs,
  DeleteClient,
  GetClient,
  GetClientsArgs,
  UpdateClientStepArgs,
  ClientMessagesArgs,
  ClientFilesArgs,
  GetClientByJourney,
  ClientCode,
  GetClientByCode,
} from './args/client.args';

import {
  CreateJourneyArgs,
  UpdateJourneyArgs,
  DeleteJourneyArgs,
  GetJourneyArgs,
} from './args/journey.args';
import {
  CreateResourceArgs,
  UpdateResourceArgs,
  DeleteResourceArgs,
  GetResourcesArgs,
} from './args/resources.args';
import {
  CreateJourneyStepArgs,
  UpdateJourneyStepArgs,
  DeleteJourneyStepArgs,
  UpdateJourneyStepStatusArgs,
} from './args/steps.args';
import { JourneyDTO } from './dto/journey.dto';
import { JourneyStepsDTO } from './dto/steps.dto';
import { JourneyResourcesDTO } from './dto/recources.dto';
import { ClientJourneyStepsEntity } from './entity/client_steps.entity';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PUB_SUB } from 'src/pubSub/pubSub.module';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { JourneyCodesEntity } from './entity/journey_codes.entity';

const NEW_CLIENT_MESSAGE_EVENT = 'newClientMessageCreated';

@Resolver((of) => ResponseDTO)
export class JourneyResolver {
  constructor(
    private readonly JourneyService: JourneyService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query((returns) => PaginatedJourneyResponse)
  getAllJourneys(
    @Args() args: GetJourneyArgs,
    @CurrentUser() user: any,
  ): Promise<PaginatedJourneyResponse> {
    return this.JourneyService.getAllJourneys(args, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query((returns) => PaginatedJourneyResourcesResponse)
  getAllResources(
    @Args() args: GetResourcesArgs,
    @CurrentUser() user: any,
  ): Promise<PaginatedJourneyResourcesResponse> {
    return this.JourneyService.getAllResources(args, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query((returns) => PaginatedJourneyClientsResponse)
  getAllClients(
    @Args() args: GetClientsArgs,
    @CurrentUser() user: any,
  ): Promise<PaginatedJourneyClientsResponse> {
    return this.JourneyService.getAllClients(args, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query((returns) => ClientDTO)
  getClient(@Args() args: GetClient): Promise<JourneyClientsEntity> {
    return this.JourneyService.getClient(args);
  }

  @UseGuards(GqlAuthGuard)
  @Query((returns) => JourneyDTO)
  getJourney(
    @Args() args: GetJourneyArgs,
    @CurrentUser() user: any,
  ): Promise<JourneyEntity> {
    return this.JourneyService.getJourney(args, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => JourneyDTO)
  createJourney(
    @Args() input: CreateJourneyArgs,
    @CurrentUser() user: any,
  ): Promise<JourneyEntity> {
    return this.JourneyService.createJourney(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => JourneyResourcesDTO)
  createResource(
    @Args() input: CreateResourceArgs,
    @CurrentUser() user: any,
  ): Promise<JourneyStepsResourcesEntity> {
    return this.JourneyService.createStepResource(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => JourneyResourcesDTO)
  updateResource(
    @Args() input: UpdateResourceArgs,
    @CurrentUser() user: any,
  ): Promise<JourneyStepsResourcesEntity> {
    return this.JourneyService.updateStepResource(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => JourneyStepsDTO)
  createJourneyStep(
    @Args() input: CreateJourneyStepArgs,
    @CurrentUser() user: any,
  ): Promise<JourneyStepsEntity> {
    return this.JourneyService.createJourneyStep(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ClientDTO)
  AddClient(
    @Args() input: CreateClientArgs,
    @CurrentUser() user: any,
  ): Promise<JourneyClientsEntity> {
    return this.JourneyService.addClient(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ClientDTO)
  UpdateClient(
    @Args() input: UpdateClientArgs,
    @CurrentUser() user: any,
  ): Promise<JourneyClientsEntity> {
    return this.JourneyService.updateClient(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => JourneyDTO)
  updateJourney(
    @Args() input: UpdateJourneyArgs,
    @CurrentUser() user: any,
  ): Promise<JourneyEntity> {
    return this.JourneyService.updateJourney(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ResponseDTO)
  deleteResource(
    @Args() input: DeleteResourceArgs,
    @CurrentUser() user: any,
  ): Promise<ResponseDTO> {
    return this.JourneyService.deleteResource(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ResponseDTO)
  deleteClient(
    @Args() input: DeleteClient,
    @CurrentUser() user: any,
  ): Promise<ResponseDTO> {
    return this.JourneyService.deleteClient(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => JourneyDTO)
  updateJourneyStep(
    @Args() input: UpdateJourneyStepArgs,
    @CurrentUser() user: any,
  ): Promise<JourneyStepsEntity> {
    return this.JourneyService.updateJourneyStep(input, user);
  }

  @Mutation((returns) => JourneyDTO)
  updateJourneyStepStatus(
    @Args() input: UpdateJourneyStepStatusArgs,
  ): Promise<ClientJourneyStepsEntity> {
    return this.JourneyService.updateJourneyStepStatus(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ClientDTO)
  updateClientStep(
    @Args() input: UpdateClientStepArgs,
    @CurrentUser() user: any,
  ): Promise<ClientJourneyStepsEntity> {
    return this.JourneyService.updateClientStep(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ResponseDTO)
  deleteJourneyStep(
    @Args() input: DeleteJourneyStepArgs,
    @CurrentUser() user: any,
  ): Promise<ResponseDTO> {
    return this.JourneyService.deleteJourneyStep(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ResponseDTO)
  deleteJourney(
    @Args() input: DeleteJourneyArgs,
    @CurrentUser() user: any,
  ): Promise<ResponseDTO> {
    return this.JourneyService.deleteJourney(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ResponseDTO)
  sendMessageToClient(
    @Args() input: ClientMessagesArgs,
    @CurrentUser() user: any,
  ): Promise<ResponseDTO> {
    return this.JourneyService.sendMessageToClient(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ResponseDTO)
  sendFileToClient(
    @Args() input: ClientFilesArgs,
    @CurrentUser() user: any,
  ): Promise<ResponseDTO> {
    return this.JourneyService.sendFileToClient(input, user);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  @Subscription(() => ClientMessageDTO)
  newClientMessageCreated() {
    return this.pubSub.asyncIterator(NEW_CLIENT_MESSAGE_EVENT);
  }

  // upload

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ResponseDTO)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args({ name: 'uploadType', type: () => String })
    uploadType: string,
    @CurrentUser() user: any,
  ): Promise<ResponseDTO> {
    return this.JourneyService.uploadFile(file, uploadType, user);
  }

  @Query((returns) => ClientDTO)
  getClientProgress(@Args() args: GetClient): Promise<JourneyClientsEntity> {
    return this.JourneyService.getClientProgress(args);
  }

  @Query((returns) => ClientDTO)
  getClientProgressByJourney(
    @Args() args: GetClientByJourney,
  ): Promise<JourneyClientsEntity> {
    return this.JourneyService.getClientProgressByJourney(args);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => ResponseDTO)
  generateJourneyCode(
    @Args() input: ClientCode,
    @CurrentUser() user: any,
  ): Promise<ResponseDTO> {
    return this.JourneyService.generateClientCode(input, user);
  }

  @Query((returns) => CodeDTO)
  getClientProgressByCode(
    @Args() args: GetClientByCode,
  ): Promise<JourneyCodesEntity> {
    return this.JourneyService.getClientByCode(args);
  }
}

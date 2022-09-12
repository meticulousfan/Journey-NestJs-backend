import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { JourneyEntity, StatusEnum } from './entity/journey.entity';
import { JourneyStepsEntity } from './entity/steps.entity';
import { ClientJourneyStepsEntity } from './entity/client_steps.entity';
import { AuthConfig } from '../auth/auth.config';
import { MailerService } from '@nestjs-modules/mailer';
import { JourneyActivityEntity } from './entity/activity.entity';

import {
  JourneyStepsResourcesEntity,
  ResourceType,
} from './entity/resources.entity';
import { Pagination } from '../paginate';
import { ResponseDTO } from '../common/dto/response.dto';
import { UserEntity } from '../user/user.entity';
import {
  CreateJourneyArgs,
  UpdateJourneyArgs,
  UpdateJourneyStatusArgs,
  DeleteJourneyArgs,
  GetJourneyArgs,
} from './args/journey.args';
import {
  CreateResourceArgs,
  UpdateResourceArgs,
  DeleteResourceArgs,
  GetResourcesArgs,
} from './args/resources.args';
import { JourneyDTO } from './dto/journey.dto';
import { JourneyResourcesDTO } from './dto/recources.dto';
import {
  CreateJourneyStepArgs,
  UpdateJourneyStepArgs,
  UpdateJourneyStepStatusArgs,
  DeleteJourneyStepArgs,
} from './args/steps.args';

import { JourneyClientsEntity } from './entity/client.entity';
import { ClientDTO } from './dto/client.dto';
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
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';

import { ClientJourneyMessagesEntity } from './entity/client_messages.entity';
import { ClientJourneyFilesEntity } from './entity/client_files.entity';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PUB_SUB } from 'src/pubSub/pubSub.module';

import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { PassThrough } from 'stream';
import { streamToBuffer } from '@jorgeferrero/stream-to-buffer';
import { JourneyCodesEntity } from './entity/journey_codes.entity';
import { ContactsService } from 'src/contacts/contacts.service';

const NEW_CLIENT_MESSAGE_EVENT = 'newClientMessageCreated';

@Injectable()
export class JourneyService {
  userPool: any;
  cognitoClient: any;
  constructor(
    @InjectRepository(JourneyEntity)
    private readonly journeyRepo: Repository<JourneyEntity>,
    @InjectRepository(JourneyStepsEntity)
    private readonly journeyStepsRepo: Repository<JourneyStepsEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(JourneyStepsResourcesEntity)
    private readonly resources: Repository<JourneyStepsResourcesEntity>,

    @InjectRepository(JourneyClientsEntity)
    private readonly clients: Repository<JourneyClientsEntity>,

    @InjectRepository(ClientJourneyStepsEntity)
    private readonly clientSteps: Repository<ClientJourneyStepsEntity>,

    @InjectRepository(ClientJourneyMessagesEntity)
    private readonly clientMessages: Repository<ClientJourneyMessagesEntity>,

    @InjectRepository(ClientJourneyFilesEntity)
    private readonly clientFiles: Repository<ClientJourneyFilesEntity>,

    @InjectRepository(JourneyActivityEntity)
    private readonly activityRepo: Repository<JourneyActivityEntity>,

    @InjectRepository(JourneyCodesEntity)
    private readonly journeyCodes: Repository<JourneyCodesEntity>,

    @Inject(PUB_SUB) private pubSub: RedisPubSub,

    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly authConfig: AuthConfig,
    private readonly mailerService: MailerService,

  ) {
    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    this.userPool = new AmazonCognitoIdentity.CognitoUserPool({
      UserPoolId: this.authConfig.userPoolId,
      ClientId: this.authConfig.clientId,
    });

    this.cognitoClient = new AWS.CognitoIdentityServiceProvider({
      apiVersion: '2016-04-19',
      region: 'us-east-2',
    });
  }

  async getAllJourneys(
    opts: GetJourneyArgs,
    currentUser: any,
  ): Promise<Pagination<JourneyEntity>> {
    const { skip, take } = opts;

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    const [results, total] = await this.journeyRepo.findAndCount({
      relations: ['user', 'steps'],
      take,
      skip: skip * take,
      where: {
        user,
      },
    });

    return new Pagination<JourneyEntity>({ results, total }, { take, skip });
  }

  async getAllResources(
    opts: GetResourcesArgs,
    user: any,
  ): Promise<Pagination<JourneyStepsResourcesEntity>> {
    const { skip, take } = opts;

    const journey = await this.journeyRepo.findOne({ uuid: opts.journey });

    const [results, total] = await this.resources.findAndCount({
      relations: ['user', 'journey', 'step'],
      where: {
        journey: journey,
      },
      take,
      skip: skip * take,
    });

    return new Pagination<JourneyStepsResourcesEntity>(
      { results, total },
      { take, skip },
    );
  }

  async getAllClients(
    opts: GetClientsArgs,
    user: any,
  ): Promise<Pagination<JourneyClientsEntity>> {
    const { skip, take } = opts;

    const journey = await this.journeyRepo.findOne({ uuid: opts.journey });

    const [results, total] = await this.clients.findAndCount({
      relations: ['journey', 'steps'],
      where: {
        journey: journey,
      },
      take,
      skip: skip * take,
    });

    return new Pagination<JourneyClientsEntity>(
      { results, total },
      { take, skip },
    );
  }

  async getClient(opts: GetClient): Promise<JourneyClientsEntity> {
    const { uuid } = opts;

    const client = await this.clients.findOne({
      relations: ['journey', 'steps', 'activity', 'files', 'messages'],
      where: {
        uuid,
      },
    });

    return client;
  }

  async getClientProgress(opts: GetClient): Promise<JourneyClientsEntity> {
    const { uuid } = opts;

    const journey = await this.journeyRepo.findOne({ uuid: opts.journey });

    const client = await this.clients.findOne({
      relations: ['journey', 'steps', 'activity', 'files', 'messages'],
      where: {
        uuid,
        journey,
      },
    });
    return client;
  }

  async getClientProgressByJourney(
    opts: GetClientByJourney,
  ): Promise<JourneyClientsEntity> {
    console.log(opts);

    const journey = await this.journeyRepo.findOne({ uuid: opts.journey });

    console.log(journey);

    const client = await this.clients.findOne({
      relations: ['journey', 'steps', 'activity', 'files', 'messages'],
      where: {
        journey,
      },
    });
    console.log(client);
    return client;
  }

  async getClientById(uuid: string): Promise<JourneyClientsEntity> {
    const client = await this.clients.findOne({
      relations: ['journey'],
      where: {
        uuid,
      },
    });

    return client;
  }

  async createJourney(
    data: CreateJourneyArgs,
    currentUser: any,
  ): Promise<JourneyEntity> {
    const { title } = data;
    const journey = new JourneyEntity();

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    journey.title = title;
    journey.user = user;

    await this.journeyRepo.save(journey);

    return journey;
  }

  async createStepResource(
    data: CreateResourceArgs,
    currentUser: any,
  ): Promise<JourneyStepsResourcesEntity> {
    const { link, type, step, name } = data;

    const step_resources = new JourneyStepsResourcesEntity();

    const journeyStep = await this.journeyStepsRepo.findOne({
      relations: ['journey'],
      where: {
        uuid: step,
      },
    });

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    console.log(journeyStep.journey);

    step_resources.name = name;

    step_resources.link = link;
    step_resources.user = user;
    step_resources.type = ResourceType[type];
    step_resources.journey = journeyStep.journey;
    step_resources.step = journeyStep;

    await this.resources.save(step_resources);

    return step_resources;
  }

  async addClient(
    data: CreateClientArgs,
    currentUser: any,
  ): Promise<JourneyClientsEntity> {
    const {
      email,
      journey,
      first_name,
      last_name,
      street_address,
      suburb,
    } = data;

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    const journey_to_add = await this.journeyRepo.findOne({
      uuid: journey,
    });

    const client_already_exists = await this.clients.findOne({
      where: {
        journey: journey_to_add,
        email: email,
      },
    });

    if (client_already_exists) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Client already exists in the journey',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const client = new JourneyClientsEntity();

    client.journey = journey_to_add;
    client.suburb = suburb;
    client.first_name = first_name;
    client.last_name = last_name;
    client.street_address = street_address;
    client.email = email;

    const newClient = await this.clients.save(client);

    if (journey_to_add && journey_to_add.steps.length) {
      journey_to_add.steps.map(async (x: any) => {
        const client_steps = new ClientJourneyStepsEntity();

        client_steps.client = newClient;

        client_steps.journey = journey_to_add;

        client_steps.step = x;

        await this.clientSteps.save(client_steps);
      });
    }

    const activity = new JourneyActivityEntity();

    activity.client = newClient;
    activity.journey = journey_to_add;
    activity.title = `Welcome`;
    activity.description = `${user.name} added you to the journey`;
    activity.user = user;

    this.activityRepo.save(activity);

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      journey_name: journey_to_add.title,
      url: `http://clients.litapp.io/?id=${newClient.uuid}`,
    };
    console.log(payload);

    // this.mailerService
    //   .sendMail({
    //     to: email,
    //     subject: `Tracking: ${payload.journey_name} Progress`,
    //     template: 'journey_invite',
    //     context: payload,
    //   })
    //   .then((res) => {
    //     console.log('== Email ==');
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    return client;
  }

  async createVerifiedClient(data: any): Promise<any> {
    const lowercaseEmail = data.email.toLowerCase();
    const payload = {
      UserPoolId: this.authConfig.userPoolId,
      Username: lowercaseEmail,
      MessageAction: 'SUPPRESS',
      TemporaryPassword: 'lipapp123',
      UserAttributes: [
        {
          Name: 'email',
          Value: lowercaseEmail,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
        {
          Name: 'custom:userType',
          Value: 'Client',
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.cognitoClient.adminCreateUser(payload, async (error, response) => {
        console.log(error);
        console.log(response);
        if (error) {
          reject(error);
        } else {
          const newUser = new UserEntity();

          // const customer = await stripe.customers.create({
          //   description: 'Client',
          //   email: lowercaseEmail,
          // });

          const user = await this.cognitoClient
            .adminSetUserPassword({
              UserPoolId: this.authConfig.userPoolId,
              Username: data.email,
              Password: 'litapp123',
              Permanent: true,
            })
            .promise();

          const role = await this.roleService.findByName('Client');
          newUser.name = `${data.first_name} ${data.last_name}`;
          newUser.email = data.email;
          newUser.street_address = data.street_address;
          newUser.suburb = data.suburb;
          newUser.roles = [role];
          // newUser.stripe_id = customer.id;
          (newUser.cognitoID = response['User']['Username']),
            (newUser.signupLocation = 'add_client');

          await this.userRepo.save(newUser);

          resolve(newUser);
        }
      });
    });
  }

  async createJourneyStep(
    data: CreateJourneyStepArgs,
    currentUser: any,
  ): Promise<JourneyStepsEntity> {
    const { journey, title, description } = data;
    const journeySteps = new JourneyStepsEntity();

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    const currentJourney = await this.journeyRepo.findOne({ uuid: journey });

    journeySteps.title = title;
    journeySteps.description = description;
    (journeySteps.user = user), (journeySteps.journey = currentJourney);

    await this.journeyStepsRepo.save(journeySteps);

    return journeySteps;
  }

  async updateJourney(
    data: UpdateJourneyArgs,
    currentUser: any,
  ): Promise<JourneyEntity> {
    const { uuid, title } = data;
    const journey = await this.journeyRepo.findOne({ uuid: uuid });

    journey.title = title;

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    journey.title = title;
    journey.user = user;

    await this.journeyRepo.save(journey);

    return journey;
  }

  async updateJourneyStatus(
    data: UpdateJourneyStatusArgs,
    currentUser: any,
  ): Promise<JourneyEntity> {
    const { uuid, status } = data;
    const journey = await this.journeyRepo.findOne({ uuid: uuid });

    journey.status = StatusEnum[status];

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    await this.journeyRepo.save(journey);

    return journey;
  }

  async updateStepResource(
    data: UpdateResourceArgs,
    currentUser: any,
  ): Promise<JourneyStepsResourcesEntity> {
    const { uuid, link, type, step, name } = data;

    const step_resources = await this.resources.findOne({ uuid: uuid });

    const journeyStep = await this.journeyStepsRepo.findOne({
      relations: ['journey'],
      where: {
        uuid: step,
      },
    });

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    step_resources.link = link;
    step_resources.name = name;
    step_resources.user = user;
    step_resources.type = ResourceType[type];
    step_resources.step = journeyStep;
    step_resources.journey = journeyStep.journey;

    await this.resources.save(step_resources);

    return step_resources;
  }

  async updateClient(
    data: UpdateClientArgs,
    currentUser: any,
  ): Promise<JourneyClientsEntity> {
    const {
      uuid,
      journey,
      first_name,
      last_name,
      street_address,
      suburb,
    } = data;

    const journey_to_add = await this.journeyRepo.findOne({ uuid: journey });

    const client = await this.clients.findOne({
      uuid,
      journey: journey_to_add,
    });

    client.suburb = suburb;
    client.first_name = first_name;
    client.last_name = last_name;
    client.street_address = street_address;

    await this.clients.save(client);

    return client;
  }

  async updateJourneyStep(
    data: UpdateJourneyStepArgs,
    currentUser: any,
  ): Promise<JourneyStepsEntity> {
    const { uuid, journey, title, description } = data;
    const journeySteps = await this.journeyStepsRepo.findOne({ uuid });

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    const currentJourney = await this.journeyRepo.findOne({ uuid: journey });

    journeySteps.title = title;
    journeySteps.description = description;
    (journeySteps.user = user), (journeySteps.journey = currentJourney);

    await this.journeyStepsRepo.save(journeySteps);

    return journeySteps;
  }

  async updateJourneyStepStatus(
    data: UpdateJourneyStepStatusArgs,
  ): Promise<ClientJourneyStepsEntity> {
    const { uuid, status } = data;
    const clientSteps = await this.clientSteps.findOne({ uuid });

    clientSteps.status = StatusEnum[status];

    await this.clientSteps.save(clientSteps);

    return clientSteps;
  }

  async deleteJourneyStep(
    data: DeleteJourneyStepArgs,
    currentUser: any,
  ): Promise<ResponseDTO> {
    const { uuid } = data;

    await this.journeyStepsRepo.delete({ uuid });

    return <ResponseDTO>{
      message: 'Journey Step deleted successfully',
      error: false,
    };
  }

  async deleteResource(
    data: DeleteResourceArgs,
    currentUser: any,
  ): Promise<ResponseDTO> {
    const { uuid } = data;

    await this.resources.delete({ uuid });

    return <ResponseDTO>{
      message: 'Step resource deleted successfully',
      error: false,
    };
  }

  async deleteJourney(
    data: DeleteJourneyArgs,
    currentUser: any,
  ): Promise<ResponseDTO> {
    const { uuid } = data;

    await this.journeyRepo.delete({ uuid });

    return <ResponseDTO>{
      message: 'Journey deleted successfully',
      error: false,
    };
  }

  async deleteClient(
    data: DeleteClient,
    currentUser: any,
  ): Promise<ResponseDTO> {
    const journey = await this.journeyRepo.findOne({ uuid: data.journey });

    await this.clients.delete({ uuid: data.uuid, journey });

    return <ResponseDTO>{
      message: 'Client deleted successfully',
      error: false,
    };
  }

  async getJourney(data: any, currentUser: any): Promise<JourneyEntity> {
    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    const journey = await this.journeyRepo.findOne({
      relations: ['user', 'steps'],
      where: { uuid: data.uuid, user },
    });

    return journey;
  }

  async updateClientStep(
    data: UpdateClientStepArgs,
    currentUser: any,
  ): Promise<ClientJourneyStepsEntity> {
    const { uuid, start_date, end_state, status } = data;

    const clientStep = await this.clientSteps.findOne({ uuid });

    clientStep.start_date = start_date;
    clientStep.end_date = end_state;
    clientStep.status = StatusEnum[status];

    console.log(clientStep);

    await this.clientSteps.save(clientStep);

    return clientStep;
  }

  async sendMessageToClient(
    data: ClientMessagesArgs,
    currentUser: any,
  ): Promise<ResponseDTO> {
    const { journey, client, message } = data;

    const clientObj = await this.clients.findOne({ uuid: client });
    const journeyObj = await this.journeyRepo.findOne({ uuid: journey });

    const clientMessage = new ClientJourneyMessagesEntity();

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    clientMessage.user = user;
    clientMessage.message = message;
    clientMessage.journey = journeyObj;
    clientMessage.client = clientObj;

    const newMessage = await this.clientMessages.save(clientMessage);

    this.pubSub.publish(NEW_CLIENT_MESSAGE_EVENT, {
      newClientMessageCreated: newMessage,
    });

    return <ResponseDTO>{
      message: 'Message sent to client successfully',
      error: false,
    };
  }

  async sendFileToClient(
    data: ClientFilesArgs,
    currentUser: any,
  ): Promise<ResponseDTO> {
    const { journey, client, file } = data;

    const clientObj = await this.clients.findOne({ uuid: client });
    const journeyObj = await this.journeyRepo.findOne({ uuid: journey });

    const clientMessage = new ClientJourneyFilesEntity();

    const date = new Date();
    const seconds = date.getTime() / 1000;
    const s3 = new AWS.S3();
    const file_name = `${seconds}_${data.file.filename}}`;

    const stream = data.file.createReadStream();
    const body = await streamToBuffer(stream);

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    clientMessage.user = user;
    clientMessage.file = data.file.filename;
    clientMessage.journey = journeyObj;
    clientMessage.client = clientObj;

    s3.putObject(
      {
        Bucket: 'lit-app-assets',
        Key: file_name,
        Body: body,
      },
      function (err, data) {
        if (err) {
          console.log('Error uploading data: ', err);
        } else {
          console.log(
            'Successfully uploaded data to lit-app-assets' +
              JSON.stringify(data),
          );
        }
      },
    );

    await this.clientFiles.save(clientMessage);

    return <ResponseDTO>{
      message: 'File sent to client successfully',
      error: false,
    };
  }

  async uploadFile(
    file: FileUpload,
    uploadType: string,
    currentUser: any,
  ): Promise<ResponseDTO> {
    try {
      const date = new Date();
      const seconds = date.getTime() / 1000;
      const s3 = new AWS.S3();
      const file_name = `${seconds}_${file.filename}`;

      const stream = file.createReadStream();
      const data = await streamToBuffer(stream);

      console.log(currentUser);

      const user = await this.userRepo.findOne({
        where: { cognitoID: currentUser.sub },
      });

      console.log(uploadType);

      switch (uploadType) {
        case 'account_icon':
          this.userService.saveAccountIcon(file_name, user);
          break;

        case 'account_logo':
          this.userService.saveAccountLogo(file_name, user);

          break;

        default:
        // code block
      }

      s3.putObject(
        {
          Bucket: 'lit-app-assets',
          Key: file_name,
          Body: data,
        },
        function (err, data) {
          if (err) {
            console.log('Error uploading data: ', err);
          } else {
            console.log(
              'Successfully uploaded data to lit-app-assets' +
                JSON.stringify(data),
            );
          }
        },
      );

      return <ResponseDTO>{
        message: 'File sent to client successfully',
        error: false,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  // Geneate Unique Journey Access Code Unique

  async generateClientCode(
    data: ClientCode,
    currentUser: any,
  ): Promise<ResponseDTO> {
    const { journey, uuid } = data;

    const journeyObj = await this.journeyRepo.findOne({ uuid: journey });
    const client = await this.clients.findOne({ uuid });

    const alreadyExists = await this.journeyCodes.findOne({
      client,
      journey: journeyObj,
    });

    if (alreadyExists) {
      throw new BadRequestException(`Code already exists`);
    }

    const unique = new Date().valueOf();

    const code = String(unique).substring(3, 13);

    const journeyCode = new JourneyCodesEntity();

    journeyCode.code = code;
    journeyCode.journey = journeyObj;
    journeyCode.client = client;

    await this.journeyCodes.save(journeyCode);

    return <ResponseDTO>{
      message: 'Code Generated Successfully',
      error: false,
      results: {
        code,
      },
    };
  }

  // Get Client By code

  async getClientByCode(opts: GetClientByCode): Promise<JourneyCodesEntity> {
    const { code } = opts;

    const client = await this.journeyCodes.findOne({ code });

    return client;
  }


  /** Adding contac to the Journey Template */


  async addContactToJourney(
    contact:any,
    opts: any,
    currentUser: any,
  ): Promise<JourneyClientsEntity> {
 

    const user = await this.userRepo.findOne({
      relations: ['roles'],
      where: { cognitoID: currentUser.sub },
    });

    const journey_to_add = await this.journeyRepo.findOne({
      uuid: opts.journey,
    });

    const client_already_exists = await this.clients.findOne({
      where: {
        journey: journey_to_add,
        email: contact.email
      },
    });

    if (client_already_exists) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Client already exists in the journey',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const client = new JourneyClientsEntity();

    client.journey = journey_to_add;
    client.first_name  = contact.first_name;
    client.last_name = contact.last_name;
    client.suburb = contact.suburb;
    client.street_address = contact.street_address;
    client.email = contact.email;
    client.contact = contact;


    // Assigning journey steps to client
    

    const newClient = await this.clients.save(client);

    if (journey_to_add && journey_to_add.steps.length) {

      journey_to_add.steps.map(async (x: any) => {

        const client_steps = new ClientJourneyStepsEntity();

        client_steps.client = newClient;

        client_steps.journey = journey_to_add;

        client_steps.step = x;

        await this.clientSteps.save(client_steps);
      });
    }

    const activity = new JourneyActivityEntity();

    this.activityRepo.save(activity);

    return client;
  }
}

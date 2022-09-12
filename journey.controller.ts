import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JourneyService } from './journey.service';
import { JourneyEntity, StatusEnum } from './entity/journey.entity';
import { JourneyStepsEntity } from './entity/steps.entity';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { UserService } from '../user/user.service';
import { ClientJourneyStepsEntity } from './entity/client_steps.entity';
import { JourneyClientsEntity } from './entity/client.entity';
import {
  ActivityDto,
  CompleteStatusDto,
  FilesDto,
  MessagesDto,
} from './dto/webhooks.dto';

import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';

@Controller('journey')
@ApiTags('Journey')
export class JourneyController {
  constructor(
    @InjectRepository(JourneyEntity)
    private readonly journeyRepo: Repository<JourneyEntity>,
    @InjectRepository(JourneyStepsEntity)
    private readonly journeyStepsRepo: Repository<JourneyStepsEntity>,

    @InjectRepository(ClientJourneyStepsEntity)
    private readonly clientSteps: Repository<ClientJourneyStepsEntity>,

    @InjectRepository(JourneyClientsEntity)
    private readonly clientSRepo: Repository<JourneyClientsEntity>,

    private readonly journeyService: JourneyService,
    private readonly userService: UserService,
  ) {}

  @Post('/step/complete')
  @ApiOperation({ summary: 'Mark Journey Step Complete' })
  async updateJourneyStepStatus(
    @Body() data: CompleteStatusDto,
  ): Promise<ResponseDTO> {
    const validate = await this.userService.validateApiKey(data.apiKey);

    if (validate) {
      try {
        const client = await this.clientSRepo.findOne({ uuid: data.clientId });

        const clientStep = await this.clientSteps.findOne({
          uuid: data.stepId,
          client,
        });

        clientStep.status = StatusEnum['completed'];

        await this.clientSteps.save(clientStep);

        return <ResponseDTO>{
          error: false,
          message: 'Journey step status updated Successfully',
        };
      } catch (e) {
        throw new BadRequestException(e.message);
      }
    } else {
      return <ResponseDTO>{
        error: true,
        message: 'Invalid API KEY',
      };
    }
  }

  @Get('/client/activity')
  @ApiOperation({ summary: 'Get Client Journey Activity' })
  async getClientJourneyActivity(
    @Body() data: ActivityDto,
  ): Promise<ResponseDTO> {
    const validate = await this.userService.validateApiKey(data.apiKey);

    if (validate) {
      try {
        const client = await this.clientSRepo.findOne({
          relations: ['activity'],
          where: {
            uuid: data.clientId,
          },
        });
        return <ResponseDTO>{
          error: false,
          message: 'Client Activity',
          results: client.activity,
        };
      } catch (e) {
        throw new BadRequestException(e.message);
      }
    } else {
      return <ResponseDTO>{
        error: true,
        message: 'Invalid API KEY',
      };
    }
  }

  @Get('/client/messages')
  @ApiOperation({ summary: 'Get Client Journey Messages' })
  async getClientJourneyMessages(
    @Body() data: MessagesDto,
  ): Promise<ResponseDTO> {
    const validate = await this.userService.validateApiKey(data.apiKey);

    if (validate) {
      try {
        const client = await this.clientSRepo.findOne({
          relations: ['messages'],
          where: {
            uuid: data.clientId,
          },
        });
        return <ResponseDTO>{
          error: false,
          message: 'Client Messages',
          results: client.messages,
        };
      } catch (e) {
        throw new BadRequestException(e.message);
      }
    } else {
      return <ResponseDTO>{
        error: true,
        message: 'Invalid API KEY',
      };
    }
  }

  @Get('/client/files')
  @ApiOperation({ summary: 'Get Client Journey Files' })
  async getClientJourneyFiles(@Body() data: FilesDto): Promise<ResponseDTO> {
    const validate = await this.userService.validateApiKey(data.apiKey);

    if (validate) {
      try {
        const client = await this.clientSRepo.findOne({
          relations: ['files'],
          where: {
            uuid: data.clientId,
          },
        });
        return <ResponseDTO>{
          error: false,
          message: 'Client Files',
          results: client.files,
        };
      } catch (e) {
        throw new BadRequestException(e.message);
      }
    } else {
      return <ResponseDTO>{
        error: true,
        message: 'Invalid API KEY',
      };
    }
  }
}

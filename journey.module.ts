import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JourneyResolver } from './journey.resolver';
import { JourneyService } from './journey.service';
import { JourneyEntity } from './entity/journey.entity';
import { JourneyStepsEntity } from './entity/steps.entity';
import { ClientJourneyStepsEntity } from './entity/client_steps.entity';
import { ClientJourneyMessagesEntity } from './entity/client_messages.entity';
import { ClientJourneyFilesEntity } from './entity/client_files.entity';
import { UserEntity } from '../user/user.entity';
import { JourneyStepsResourcesEntity } from './entity/resources.entity';
import { JourneyClientsEntity } from './entity/client.entity';
import { JourneyActivityEntity } from './entity/activity.entity';
import { JourneyCodesEntity } from './entity/journey_codes.entity';

import { RoleModule } from 'src/role/role.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthConfig } from 'src/auth/auth.config';
import { JourneyController } from './journey.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      JourneyEntity,
      JourneyStepsEntity,
      UserEntity,
      JourneyStepsResourcesEntity,
      JourneyClientsEntity,
      ClientJourneyStepsEntity,
      ClientJourneyFilesEntity,
      ClientJourneyMessagesEntity,
      JourneyActivityEntity,
      JourneyCodesEntity,
    ]),
    RoleModule,
    AuthModule,
  ],
  controllers: [JourneyController],
  providers: [JourneyService, JourneyResolver, AuthConfig],
  exports: [JourneyService],
})
export class JourneyModule {}

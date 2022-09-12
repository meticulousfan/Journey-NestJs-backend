import { Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import {
  Column,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { JourneyEntity } from 'src/journey/entity/journey.entity';
import { ClientJourneyStepsEntity } from 'src/journey/entity/client_steps.entity';

import { JourneyActivityEntity } from 'src/journey/entity/activity.entity';
import { ClientJourneyFilesEntity } from 'src/journey/entity/client_files.entity';
import { ClientJourneyMessagesEntity } from 'src/journey/entity/client_messages.entity';
import { ContactsEntity } from 'src/contacts/contacts.entity';

export enum StatusEnum {
  active = 'Active',
  inactive = 'Inactive',
}

@Entity('journey_clients_entity')
export class JourneyClientsEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({ default: null })
  email: string;

  @Column({ default: null })
  first_name: string;

  @Column({ default: null })
  last_name: string;

  @Column({ default: null })
  street_address: string;

  @Column({ default: null })
  suburb: string;

  @ManyToOne((type) => JourneyEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  journey: JourneyEntity;

  @ManyToOne((type) => ContactsEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  contact: ContactsEntity;

  @OneToMany((type) => JourneyActivityEntity, (activiy) => activiy.client)
  activity: JourneyActivityEntity;

  @OneToMany((type) => ClientJourneyStepsEntity, (steps) => steps.client, {
    eager: true,
  })
  steps: ClientJourneyStepsEntity;

  @OneToMany((type) => ClientJourneyFilesEntity, (f) => f.client, {
    eager: true,
  })
  files: ClientJourneyFilesEntity;

  @OneToMany((type) => ClientJourneyMessagesEntity, (m) => m.client, {
    eager: true,
  })
  messages: ClientJourneyMessagesEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

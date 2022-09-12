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
import { JourneyStepsResourcesEntity } from 'src/journey/entity/resources.entity';
import { JourneyClientsEntity } from 'src/journey/entity/client.entity';
import { JourneyStepsEntity } from 'src/journey/entity/steps.entity';
import { JourneyEntity } from 'src/journey/entity/journey.entity';

export enum StatusEnum {
  active = 'Active',
  inactive = 'Inactive',
  archived = 'Archived',
  not_started = 'not_started',
  completed = 'completed',
  in_progress = 'in_progress',
}

@Entity('client_steps_entity')
export class ClientJourneyStepsEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @ManyToOne((type) => JourneyClientsEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  client: JourneyClientsEntity;

  @ManyToOne((type) => JourneyStepsEntity, {
    nullable: true,
  })
  step: JourneyStepsEntity;

  @ManyToOne((type) => JourneyEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  journey: JourneyEntity;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.inactive,
  })
  status: StatusEnum;

  @Column({ default: null })
  start_date: string;

  @Column({ default: null })
  end_date: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

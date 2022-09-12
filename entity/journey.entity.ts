import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { JourneyStepsEntity } from 'src/journey/entity/steps.entity';
import { JourneyStepsResourcesEntity } from 'src/journey/entity/resources.entity';

export enum StatusEnum {
  active = 'Active',
  inactive = 'Inactive',
  archived = 'Archived',
  not_started = 'not_started',
  completed = 'completed',
  in_progress = 'in_progress',
}

@Entity('journey_entity')
export class JourneyEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.inactive,
  })
  status: StatusEnum;

  @ManyToOne((type) => UserEntity, {
    nullable: true,
  })
  user: UserEntity;

  @OneToMany((type) => JourneyStepsEntity, (steps) => steps.journey, {
    cascade: true,
    eager: true,
  })
  steps: [];

  @OneToMany((type) => JourneyStepsResourcesEntity, (r) => r.journey, {
    cascade: true,
    eager: true,
  })
  resources: [];

  @Column({ default: null })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

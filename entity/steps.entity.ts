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
import { JourneyStepsResourcesEntity } from 'src/journey/entity/resources.entity';

export enum StatusEnum {
  active = 'Active',
  inactive = 'Inactive',
  archived = 'Archived',
  not_started = 'not_started',
  completed = 'completed',
  in_progress = 'in_progress',
}

@Entity('journey_steps_entity')
export class JourneyStepsEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.not_started,
  })
  status: StatusEnum;

  @ManyToOne((type) => UserEntity, {
    nullable: true,
  })
  user: UserEntity;

  @ManyToOne((type) => JourneyEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  journey: JourneyEntity;

  @OneToMany(
    (type) => JourneyStepsResourcesEntity,
    (resources) => resources.step,
    {
      eager: true,
    },
  )
  resources: [];

  @Column({ default: null })
  title: string;

  @Column({ default: null })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

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
import { JourneyEntity } from 'src/journey/entity/journey.entity';
import { JourneyStepsEntity } from 'src/journey/entity/steps.entity';
import { ClientJourneyStepsEntity } from 'src/journey/entity/client_steps.entity';

export enum ResourceType {
  pdf_document = 'Pdf document',
  audio = 'Audio',
  video = 'Video',
  google_doc = 'Google doc',
  default = '',
}

@Entity('journey_steps_resources_entity')
export class JourneyStepsResourcesEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
    default: ResourceType.default,
  })
  type: ResourceType;

  @ManyToOne((type) => UserEntity, {
    nullable: true,
  })
  user: UserEntity;

  @ManyToOne((type) => JourneyEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  journey: JourneyEntity;

  @ManyToOne((type) => JourneyStepsEntity, (step) => step.resources, {
    nullable: true,
  })
  step: JourneyStepsEntity;

  @Column({ default: null })
  name: string;

  @Column({ default: null })
  link: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

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
import { JourneyClientsEntity } from 'src/journey/entity/client.entity';

@Entity('journey_activity_entity')
export class JourneyActivityEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({ default: null })
  title: string;

  @Column({ default: null })
  description: string;

  @ManyToOne((type) => UserEntity, {
    nullable: true,
  })
  user: UserEntity;

  @ManyToOne((type) => JourneyEntity, {
    nullable: true,
  })
  journey: JourneyEntity;

  @ManyToOne((type) => JourneyClientsEntity, {
    nullable: true,
  })
  client: JourneyClientsEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

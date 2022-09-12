import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { JourneyClientsEntity } from 'src/journey/entity/client.entity';
import { JourneyEntity } from 'src/journey/entity/journey.entity';

@Entity('client_messages_entity')
export class ClientJourneyMessagesEntity {
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

  @ManyToOne((type) => UserEntity, {
    nullable: true,
  })
  user: UserEntity;

  @ManyToOne((type) => JourneyEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  journey: JourneyEntity;

  @Column({ default: null })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

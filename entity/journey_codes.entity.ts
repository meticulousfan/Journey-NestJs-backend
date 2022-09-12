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
import { JourneyEntity } from 'src/journey/entity/journey.entity';
import { JourneyClientsEntity } from 'src/journey/entity/client.entity';


export enum StatusEnum {
  active = 'Active',
  inactive = 'Inactive',
}

@Entity('journey_codes_entity')
export class JourneyCodesEntity{
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @ManyToOne((type) => JourneyEntity, {
    nullable: true,
    onDelete: 'CASCADE',
    eager:true
  })
  journey: JourneyEntity;

  @ManyToOne((type) => JourneyClientsEntity, {
    nullable: true,
    onDelete: 'CASCADE',
    eager:true

  })
  client: JourneyClientsEntity;
  

  @Column({ default: null })
  code: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

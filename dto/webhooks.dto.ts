import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CompleteStatusDto {
 
  @ApiProperty({ description: 'Client id' })
  clientId: string;

  @ApiProperty({ description: 'Step id' })
  stepId: string;

  @ApiProperty({ description: 'API KEY' })
  apiKey: string;
}


export class ActivityDto {
 
    @ApiProperty({ description: 'Client id' })
    clientId: string;
  
    @ApiProperty({ description: 'API KEY' })
    apiKey: string;
}

export class FilesDto {
 
    @ApiProperty({ description: 'Client id' })
    clientId: string;
  
    @ApiProperty({ description: 'API KEY' })
    apiKey: string;
}

export class MessagesDto {
 
    @ApiProperty({ description: 'Client id' })
    clientId: string;
  
    @ApiProperty({ description: 'API KEY' })
    apiKey: string;
}
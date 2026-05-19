import { Module } from '@nestjs/common';
import { StrategicService } from './strategic.service';
import { StrategicController } from './strategic.controller';

@Module({ providers: [StrategicService], controllers: [StrategicController] })
export class StrategicModule {}

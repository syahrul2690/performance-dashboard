import { Module } from '@nestjs/common';
import { OperationalService } from './operational.service';
import { OperationalController } from './operational.controller';

@Module({ providers: [OperationalService], controllers: [OperationalController] })
export class OperationalModule {}

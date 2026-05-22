import { Module } from '@nestjs/common';
import { GcgEsgService } from './gcg-esg.service';
import { GcgEsgController } from './gcg-esg.controller';

@Module({ providers: [GcgEsgService], controllers: [GcgEsgController] })
export class GcgEsgModule {}

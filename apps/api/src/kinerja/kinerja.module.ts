import { Module } from '@nestjs/common';
import { KinerjaService } from './kinerja.service';
import { KinerjaController } from './kinerja.controller';

@Module({ providers: [KinerjaService], controllers: [KinerjaController] })
export class KinerjaModule {}

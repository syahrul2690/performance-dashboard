import { Module } from '@nestjs/common';
import { ProsesBisnisService } from './proses-bisnis.service';
import { ProsesBisnisController } from './proses-bisnis.controller';

@Module({ providers: [ProsesBisnisService], controllers: [ProsesBisnisController] })
export class ProsesBisnisModule {}

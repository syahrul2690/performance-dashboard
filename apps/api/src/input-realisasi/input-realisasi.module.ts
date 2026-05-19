import { Module } from '@nestjs/common';
import { InputRealisasiService } from './input-realisasi.service';
import { InputRealisasiController } from './input-realisasi.controller';

@Module({ providers: [InputRealisasiService], controllers: [InputRealisasiController] })
export class InputRealisasiModule {}

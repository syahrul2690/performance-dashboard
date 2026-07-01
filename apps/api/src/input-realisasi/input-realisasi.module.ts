import { Module } from '@nestjs/common';
import { InputRealisasiService } from './input-realisasi.service';
import { InputRealisasiController } from './input-realisasi.controller';
import { ExecutiveModule } from '../executive/executive.module';
import { OperationalModule } from '../operational/operational.module';

@Module({
  imports: [ExecutiveModule, OperationalModule],
  providers: [InputRealisasiService],
  controllers: [InputRealisasiController],
})
export class InputRealisasiModule {}

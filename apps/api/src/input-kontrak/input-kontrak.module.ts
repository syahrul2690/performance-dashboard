import { Module } from '@nestjs/common';
import { InputKontrakService } from './input-kontrak.service';
import { InputKontrakController } from './input-kontrak.controller';

@Module({ providers: [InputKontrakService], controllers: [InputKontrakController] })
export class InputKontrakModule {}

import { Module } from '@nestjs/common';
import { PetaService } from './peta.service';
import { PetaController } from './peta.controller';

@Module({ providers: [PetaService], controllers: [PetaController] })
export class PetaModule {}

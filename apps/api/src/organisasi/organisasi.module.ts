import { Module } from '@nestjs/common';
import { OrganisasiService } from './organisasi.service';
import { OrganisasiController } from './organisasi.controller';

@Module({ providers: [OrganisasiService], controllers: [OrganisasiController] })
export class OrganisasiModule {}

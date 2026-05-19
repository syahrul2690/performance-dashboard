import { Module } from '@nestjs/common';
import { HumanCapitalService } from './human-capital.service';
import { HumanCapitalController } from './human-capital.controller';

@Module({ providers: [HumanCapitalService], controllers: [HumanCapitalController] })
export class HumanCapitalModule {}

import { Module } from '@nestjs/common';
import { WorkflowKmService } from './workflow-km.service';
import { WorkflowKmController } from './workflow-km.controller';

@Module({ providers: [WorkflowKmService], controllers: [WorkflowKmController] })
export class WorkflowKmModule {}

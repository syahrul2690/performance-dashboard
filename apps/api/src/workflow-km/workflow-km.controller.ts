import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { WorkflowKmService } from './workflow-km.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { IsIn, IsOptional, IsString } from 'class-validator';

class ReviewDto {
  @IsIn(['approve', 'return']) action: 'approve' | 'return';
  @IsOptional() @IsString() note?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('workflow-km')
export class WorkflowKmController {
  constructor(private svc: WorkflowKmService) {}

  @Get('usulan')
  usulan() { return this.svc.getUsulan(); }

  @Get('realisasi')
  realisasi() { return this.svc.getRealisasi(); }

  @Post(':docId/review')
  review(
    @Param('docId') docId: string,
    @Body() dto: ReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.svc.review(docId, dto.action, dto.note ?? '', user);
  }
}

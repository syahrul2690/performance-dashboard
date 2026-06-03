import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InputRealisasiService } from './input-realisasi.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { IsObject, IsString, IsOptional, IsIn } from 'class-validator';

class SubmitDto {
  @IsString() unitCode: string;
  @IsObject() values: Record<string, unknown>;
}

class ReviewDto {
  @IsIn(['approve', 'reject']) action: 'approve' | 'reject';
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsIn(['konseptor', 'previous']) returnTo?: 'konseptor' | 'previous';
}

@UseGuards(JwtAuthGuard)
@Controller('input-realisasi')
export class InputRealisasiController {
  constructor(private svc: InputRealisasiService) {}

  @Get('history')
  history(@Query('unitCode') unitCode?: string, @Query('periodId') periodId?: string) {
    return this.svc.getHistory(unitCode, periodId);
  }

  @Get('review/list')
  reviewList(@CurrentUser() user: User) {
    return this.svc.getReviewList(user);
  }

  @Put('submit')
  submit(@CurrentUser() user: User, @Body() dto: SubmitDto) {
    return this.svc.submit(user, dto.unitCode, dto.values);
  }

  @Post(':id/review')
  review(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: ReviewDto) {
    return this.svc.review(user, id, dto.action, dto.note, dto.returnTo);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.svc.delete(user, id);
  }
}

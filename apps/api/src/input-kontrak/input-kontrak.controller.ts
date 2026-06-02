import {
  Controller, Get, Post, Delete, Body, Query, Param, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InputKontrakService } from './input-kontrak.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { IsArray, IsString, IsOptional, IsIn } from 'class-validator';

class SaveDto {
  @IsOptional() @IsString() id?: string;
  @IsString() unitCode: string;
  @IsString() bidang: string;
  @IsString() holder: string;
  @IsArray() kpiItems: Record<string, unknown>[];
}

class ReviewDto {
  @IsIn(['approve', 'reject']) action: 'approve' | 'reject';
  @IsOptional() @IsString() note?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('input-kontrak')
export class InputKontrakController {
  constructor(private svc: InputKontrakService) {}

  @Get()
  list(@Query('unitCode') unitCode?: string, @Query('periodId') periodId?: string) {
    return this.svc.getList(unitCode, periodId);
  }

  @Get('review/list')
  reviewList(@CurrentUser() user: User) {
    return this.svc.getReviewList(user);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  @Post('save')
  save(@CurrentUser() user: User, @Body() dto: SaveDto) {
    return this.svc.save(user, dto.id, dto.unitCode, dto.bidang, dto.holder, dto.kpiItems);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: { buffer: Buffer; originalname?: string }) {
    return this.svc.parseExcel(file);
  }

  @Post(':id/submit')
  submit(@CurrentUser() user: User, @Param('id') id: string) {
    return this.svc.submit(user, id);
  }

  @Post(':id/review')
  review(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: ReviewDto) {
    return this.svc.review(user, id, dto.action, dto.note);
  }

  @Delete(':id')
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.svc.delete(user, id);
  }
}

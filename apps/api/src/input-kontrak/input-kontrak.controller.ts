import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { InputKontrakService } from './input-kontrak.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { IsArray, IsObject, IsString } from 'class-validator';

class SaveDto {
  @IsString() unitCode: string;
  @IsString() bidang: string;
  @IsString() holder: string;
  @IsArray() kpiItems: Record<string, unknown>[];
}

@UseGuards(JwtAuthGuard)
@Controller('input-kontrak')
export class InputKontrakController {
  constructor(private svc: InputKontrakService) {}

  @Get()
  list(@Query('unitCode') unitCode?: string, @Query('periodId') periodId?: string) {
    return this.svc.getList(unitCode, periodId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  @Post('save')
  save(@CurrentUser() user: User, @Body() dto: SaveDto) {
    return this.svc.save(user, dto.unitCode, dto.bidang, dto.holder, dto.kpiItems);
  }

  @Post(':id/submit')
  submit(@CurrentUser() user: User, @Param('id') id: string) {
    return this.svc.submit(user, id);
  }

  @Delete(':id')
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.svc.delete(user, id);
  }
}

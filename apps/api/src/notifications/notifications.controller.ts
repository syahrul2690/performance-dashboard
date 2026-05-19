import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: User) { return this.svc.getList(user); }

  @Post(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: User) { return this.svc.markRead(id, user); }

  @Post('read-all')
  markAllRead(@CurrentUser() user: User) { return this.svc.markAllRead(user); }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getList(user: User) {
    return this.prisma.notification.findMany({
      where: { OR: [{ userId: user.id }, { userId: null }] },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string, user: User) {
    return this.prisma.notification.updateMany({
      where: { id, OR: [{ userId: user.id }, { userId: null }] },
      data: { unread: false },
    });
  }

  async markAllRead(user: User) {
    return this.prisma.notification.updateMany({
      where: { OR: [{ userId: user.id }, { userId: null }] },
      data: { unread: false },
    });
  }
}

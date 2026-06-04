import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Hanya notifikasi MILIK user (sudah ditargetkan per role+bidang+unit saat dibuat).
  // Broadcast global (userId null) tidak ditampilkan agar tidak bocor lintas-bidang.
  async getList(user: User) {
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string, user: User) {
    return this.prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { unread: false },
    });
  }

  async markAllRead(user: User) {
    return this.prisma.notification.updateMany({
      where: { userId: user.id },
      data: { unread: false },
    });
  }
}

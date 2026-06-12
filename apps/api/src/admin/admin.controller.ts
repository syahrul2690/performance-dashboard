import { Controller, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.DEVELOPER)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Delete('reset-test-data')
  async resetTestData(@CurrentUser() user: User) {
    if (user.role !== Role.SUPERADMIN && user.role !== Role.DEVELOPER) {
      throw new ForbiddenException('Hanya SUPERADMIN atau DEVELOPER yang dapat mereset data');
    }
    await this.prisma.notification.deleteMany({});
    await this.prisma.auditLog.deleteMany({});
    await this.prisma.realisasiBundle.deleteMany({});
    await this.prisma.inputRealisasi.deleteMany({});
    await this.prisma.kMBundle.deleteMany({});
    await this.prisma.kontrakManajemen.deleteMany({});
    return { success: true, message: 'Semua data KM, realisasi, notifikasi, dan log audit berhasil dihapus.' };
  }
}

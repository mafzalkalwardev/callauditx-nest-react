import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller()
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('analytics/dashboard')
  async getDashboard(@Req() req: any) {
    if (req.user.role === 'ADMIN') {
      return this.service.getDashboardAnalytics();
    }
    if (!req.user.clientId) {
      throw new ForbiddenException('Client profile required');
    }
    return this.service.getDashboardAnalytics(req.user.clientId);
  }

  @Get('analytics/earnings')
  async getEarnings(@Req() req: any) {
    if (req.user.role === 'ADMIN') {
      return this.service.getEarnings();
    }
    return this.service.getEarnings(req.user.sub);
  }

  @Get('admin/clients')
  @UseGuards(AdminGuard)
  async getAdminClients() {
    return this.service.getAdminClients();
  }
}

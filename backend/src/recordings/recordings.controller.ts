import { Controller, Get, Post, Param, Body, UseGuards, Req, UploadedFile, UploadedFiles, UseInterceptors, ForbiddenException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RecordingsService } from './recordings.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

// Custom multer disk storage to preserve extension
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller()
@UseGuards(AuthGuard)
export class RecordingsController {
  constructor(private readonly service: RecordingsService) {}

  @Get('recordings')
  async getRecordings(@Req() req: any) {
    if (req.user.role === 'ADMIN') {
      return this.service.getRecordings();
    }
    if (!req.user.clientId) {
      throw new ForbiddenException('Client account required');
    }
    return this.service.getRecordings(req.user.clientId);
  }

  @Get('recordings/:id')
  async getRecordingById(@Param('id') id: string) {
    return this.service.getRecordingById(id);
  }

  @Post('recordings/upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadRecording(
    @UploadedFile() file: Express.Multer.File,
    @Body('categoryId') categoryId: string,
    @Req() req: any,
  ) {
    if (req.user.role !== 'CLIENT' || !req.user.clientId) {
      throw new ForbiddenException('Only clients can upload recordings');
    }
    return this.service.uploadAndReview(file, categoryId, req.user.clientId);
  }

  @Post('recordings/upload-bulk')
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  async uploadRecordingsBulk(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('categoryId') categoryId: string,
    @Req() req: any,
  ) {
    if (req.user.role !== 'CLIENT' || !req.user.clientId) {
      throw new ForbiddenException('Only clients can upload recordings');
    }

    const completed: any[] = [];
    for (const file of files) {
      const result = await this.service.uploadAndReview(file, categoryId, req.user.clientId);
      completed.push(result);
    }
    return { success: true, count: completed.length, data: completed };
  }

  @Post('reviews/:id/override')
  @UseGuards(AdminGuard)
  async overrideReview(@Param('id') reviewId: string, @Body() body: any) {
    return this.service.overrideReview(reviewId, body);
  }

  @Get('notifications')
  async getNotifications(@Req() req: any) {
    return this.service.getNotifications(req.user.sub);
  }

  @Post('notifications/read')
  async markNotificationsRead(@Req() req: any) {
    return this.service.markNotificationsRead(req.user.sub);
  }
}

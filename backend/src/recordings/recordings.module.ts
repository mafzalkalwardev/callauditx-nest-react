import { Module } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { PrismaService } from '../prisma.service';
import { AIModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, AIModule],
  controllers: [RecordingsController],
  providers: [RecordingsService, PrismaService],
  exports: [RecordingsService],
})
export class RecordingsModule {}

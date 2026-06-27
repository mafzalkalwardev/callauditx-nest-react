import { Module } from '@nestjs/common';
import { AIEngineService } from './ai-engine.service';

@Module({
  providers: [AIEngineService],
  exports: [AIEngineService],
})
export class AIModule {}

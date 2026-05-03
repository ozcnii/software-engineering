import { Module } from '@nestjs/common';
import { SolvingService } from './solving.service';

@Module({
  providers: [SolvingService],
  exports: [SolvingService],
})
export class SolvingModule {}

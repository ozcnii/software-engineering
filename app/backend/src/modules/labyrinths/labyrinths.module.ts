import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GenerationModule } from '../generation/generation.module';
import { SolvingModule } from '../solving/solving.module';
import { LabyrinthsController } from './labyrinths.controller';
import { LabyrinthsService } from './labyrinths.service';

@Module({
  imports: [AuthModule, GenerationModule, SolvingModule],
  controllers: [LabyrinthsController],
  providers: [LabyrinthsService],
})
export class LabyrinthsModule {}

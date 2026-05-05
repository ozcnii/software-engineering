import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { LabyrinthsController } from './labyrinths.controller';
import { LabyrinthsService } from './labyrinths.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [LabyrinthsController],
  providers: [LabyrinthsService],
})
export class LabyrinthsModule {}

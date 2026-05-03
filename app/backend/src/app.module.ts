import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { LabyrinthsModule } from './modules/labyrinths/labyrinths.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [UsersModule, AuthModule, LabyrinthsModule],
})
export class AppModule {}

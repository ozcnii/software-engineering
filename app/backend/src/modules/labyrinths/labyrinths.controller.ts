import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestWithUser } from '../auth/jwt.types';
import { CreateLabyrinthDto } from './dto/create-labyrinth.dto';
import { GenerateLabyrinthDto } from './dto/generate-labyrinth.dto';
import { SolveLabyrinthDto } from './dto/solve-labyrinth.dto';
import { LabyrinthsService } from './labyrinths.service';

@Controller('labyrinths')
@UseGuards(RolesGuard)
export class LabyrinthsController {
  constructor(private readonly labyrinthsService: LabyrinthsService) {}

  @Get()
  @Roles('admin', 'player')
  list(@Query() query: Record<string, unknown>) {
    return this.labyrinthsService.list(query);
  }

  @Post('generate')
  @HttpCode(200)
  @Roles('admin')
  generate(@Body() dto: GenerateLabyrinthDto) {
    return this.labyrinthsService.generate(dto);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateLabyrinthDto, @Req() req: RequestWithUser) {
    if (!req.user) {
      throw new Error('Authenticated user missing from request');
    }

    return this.labyrinthsService.create(dto, req.user.id);
  }

  @Get(':id')
  @Roles('admin', 'player')
  detail(@Param('id') id: string) {
    return this.labyrinthsService.detail(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.labyrinthsService.delete(id);
  }

  @Post(':id/solve')
  @HttpCode(200)
  @Roles('player')
  solve(@Param('id') id: string, @Body() dto: SolveLabyrinthDto) {
    return this.labyrinthsService.solve(id, dto);
  }
}

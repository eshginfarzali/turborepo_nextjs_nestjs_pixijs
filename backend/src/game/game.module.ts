import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';

@Module({
  providers: [GameGateway, GameResolver, GameService],
})
export class GameModule {}

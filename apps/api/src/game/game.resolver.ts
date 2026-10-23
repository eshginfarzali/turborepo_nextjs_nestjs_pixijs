import { Args, Query, Resolver } from '@nestjs/graphql';
import type { GameState } from '@repo/shared';
import { GameService } from './game.service';
import { GameModel } from './models/game.model';

const toModel = (game: GameState): GameModel => ({
  roomId: game.roomId,
  board: game.board,
  status: game.status,
  turn: game.turn,
  winner: game.winner,
  players: game.players.map(({ name, mark }) => ({ name, mark })),
});

@Resolver(() => GameModel)
export class GameResolver {
  constructor(private readonly gameService: GameService) {}

  @Query(() => [GameModel], {
    description: 'Rooms waiting for a second player, for the lobby.',
  })
  openGames(): GameModel[] {
    return this.gameService
      .list()
      .filter((game) => game.status === 'waiting')
      .map(toModel);
  }

  @Query(() => [GameModel], { description: 'All active rooms.' })
  games(): GameModel[] {
    return this.gameService.list().map(toModel);
  }

  @Query(() => GameModel, { nullable: true })
  game(@Args('roomId') roomId: string): GameModel | null {
    const game = this.gameService.get(roomId);
    return game ? toModel(game) : null;
  }
}

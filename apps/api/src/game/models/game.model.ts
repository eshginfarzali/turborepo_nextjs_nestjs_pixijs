import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Player', {
  description: 'A player in a room (socket ids are not exposed).',
})
export class PlayerModel {
  @Field()
  name!: string;

  @Field({ description: '"X" or "O"' })
  mark!: string;
}

@ObjectType('Game')
export class GameModel {
  @Field()
  roomId!: string;

  @Field(() => [String], {
    nullable: 'items',
    description: '9 cells, row by row; null for an empty cell.',
  })
  board!: (string | null)[];

  @Field({ description: 'waiting | playing | won | draw' })
  status!: string;

  @Field({ description: 'Mark that moves next.' })
  turn!: string;

  @Field(() => String, { nullable: true })
  winner!: string | null;

  @Field(() => [PlayerModel])
  players!: PlayerModel[];
}

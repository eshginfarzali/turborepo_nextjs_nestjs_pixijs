import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

@Resolver()
export class GameResolver {
  @Query(() => String)
  hello() {
    return 'Hello GraphQL from Tic-Tac-Toe!';
  }

  @Mutation(() => String)
  saveResult(@Args('winner') winner: string) {
    console.log('Saving winner', winner);
    return `Saved winner: ${winner}`;
  }
}

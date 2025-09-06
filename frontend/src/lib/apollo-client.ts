// "use client";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:3001/graphql", // backend GraphQL endpoint
    credentials: "include", // lazım olsa cookie göndərmək üçün
  }),
  cache: new InMemoryCache(),
});

export default client;

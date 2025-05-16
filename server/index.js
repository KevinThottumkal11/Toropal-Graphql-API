import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs, resolvers } from './graphql-schema.js';
import { initDatabase } from './cartDataStore.js';

initDatabase();

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, {
  context: async ({ req }) => {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) throw new Error('Not Authorized!');
    const token = auth.split(' ')[1];
    if (!token) throw new Error('Not Authorized!');
    return { userToken: token };
  },
    listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server running at ${url}`);
});
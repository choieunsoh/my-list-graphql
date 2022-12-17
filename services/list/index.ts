import { ApolloServer } from 'apollo-server'
import { createGqlServer } from '../../libs/server'
import { resolvers } from './resolvers'
import { typeDefs } from './resolvers/schema'

export async function startListServer(): Promise<ApolloServer> {
  const server = await createGqlServer({
    typeDefs,
    resolvers,
  })

  const { url } = await server.listen(Number(process.env.LIST_SERVICE_PORT))

  console.log(`List service running at ${url}`)

  return server
}

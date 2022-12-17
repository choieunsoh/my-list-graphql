import { startGateway } from './gateway'
import { startServer as startUserServer } from './services/user'
import { startListServer } from './services/list'

async function bootstrap() {
  await Promise.all([startUserServer(), startListServer()])

  await startGateway()
}

bootstrap()

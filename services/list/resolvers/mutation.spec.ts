import { ApolloServer, gql } from 'apollo-server'
import { PrismaClient } from '@prisma/client'

import { List, Task } from 'generated/types'
import { startListServer } from '..'

const NEW_LIST_TITLE_WORLD_CUP_2022 = 'World Cup 2022'
const UPDATE_LIST_TITLE_WORLD_CUP_2022 = 'FIFA World Cup Qatar 2022'
const NEW_TASK_TITLE_ARGENTINA = 'Argentina'
const NEW_TASK_TITLE_FRANCE = 'France'
const NEW_TASK_TITLE_CROATIA = 'Croatia'
const NEW_TASK_TITLE_MOROCCO = 'Morocco'
const NEW_TASK_TITLE_ENGLAND = 'England'
const NEW_TASK_TITLE_PORTUGAL = 'Portugal'
const UPDATE_TASK_TITLE_BRAZIL = 'Brazil'

describe('List Mutation', () => {
  let server: ApolloServer
  let prisma: PrismaClient
  let userId: string

  jest.setTimeout(30 * 1000)

  beforeAll(async () => {
    server = await startListServer()
    prisma = new PrismaClient()

    const user = await prisma.user.findUnique({
      where: { username: 'tod' },
    })
    userId = user?.id ?? ''
  })

  afterAll(async () => {
    await prisma.list.deleteMany({
      where: {
        title: { contains: 'World Cup' },
      },
    })

    await server.stop()
    await prisma.$disconnect()
  })

  describe('✅ Happy Cases', () => {
    test('Create a list', async () => {
      // Arrange
      const now = new Date().getTime()

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            createList(input: { title: "${NEW_LIST_TITLE_WORLD_CUP_2022}", createdUserId: "${userId}"}) {
              title
              updatedAt
            }
          }
        `,
      })

      const createdWorldCupList: List | null = result.data?.createList
      const updatedAt = new Date(createdWorldCupList?.updatedAt).getTime()
      const prismaCreatedWorldCupList = await prisma.list.findUnique({
        where: { title: NEW_LIST_TITLE_WORLD_CUP_2022 },
      })

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(createdWorldCupList).toBeDefined()
      expect(createdWorldCupList?.title).toBe(NEW_LIST_TITLE_WORLD_CUP_2022)
      expect(now).toBeLessThan(updatedAt)
      expect(prismaCreatedWorldCupList).toBeDefined()
      expect(prismaCreatedWorldCupList?.title).toBe(
        NEW_LIST_TITLE_WORLD_CUP_2022
      )
    })

    test('Update an existing list', async () => {
      // Arrange
      const worldCupList = await prisma.list.findUnique({
        where: { title: NEW_LIST_TITLE_WORLD_CUP_2022 },
      })
      const worldCupListId = worldCupList?.listId ?? ''
      const lastUpdatedAt = (worldCupList?.updatedAt ?? new Date()).getTime()

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            updateList(listId: "${worldCupListId}", input: { title: "${UPDATE_LIST_TITLE_WORLD_CUP_2022}", updatedUserId: "${userId}"}) {
              title
              updatedAt
            }
          }
        `,
      })

      const updatedWorldCupList: List | null = result.data?.updateList
      const updatedAt = new Date(updatedWorldCupList?.updatedAt).getTime()
      const prismaUpdatedWorldCupList = await prisma.list.findUnique({
        where: { listId: worldCupListId },
      })

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(updatedWorldCupList).toBeDefined()
      expect(updatedWorldCupList?.title).toBe(UPDATE_LIST_TITLE_WORLD_CUP_2022)
      expect(lastUpdatedAt).toBeLessThan(updatedAt)
      expect(prismaUpdatedWorldCupList).toBeDefined()
      expect(prismaUpdatedWorldCupList?.listId).toBe(worldCupListId)
      expect(prismaUpdatedWorldCupList?.title).toBe(
        UPDATE_LIST_TITLE_WORLD_CUP_2022
      )
    })

    test('Create a task', async () => {
      // Arrange
      const now = new Date().getTime()
      const [worldCupList] = await prisma.list.findMany({
        where: {
          title: { contains: 'World Cup' },
        },
      })
      const worldCupListId = worldCupList?.listId ?? ''

      // Act
      const resultArgentina = await server.executeOperation({
        query: gql`
          mutation {
            createTask(input: { listId: "${worldCupListId}", title: "${NEW_TASK_TITLE_ARGENTINA}", createdUserId: "${userId}"}) {
              title
              position
              completed
              updatedAt
            }
          }
        `,
      })
      await server.executeOperation({
        query: gql`
          mutation {
            createTask(input: { listId: "${worldCupListId}", title: "${NEW_TASK_TITLE_FRANCE}", createdUserId: "${userId}"}) {
              title
              position
              completed
              updatedAt
            }
          }
        `,
      })
      await server.executeOperation({
        query: gql`
          mutation {
            createTask(input: { listId: "${worldCupListId}", title: "${NEW_TASK_TITLE_CROATIA}", createdUserId: "${userId}"}) {
              title
              position
              completed
              updatedAt
            }
          }
        `,
      })
      await server.executeOperation({
        query: gql`
          mutation {
            createTask(input: { listId: "${worldCupListId}", title: "${NEW_TASK_TITLE_MOROCCO}", createdUserId: "${userId}"}) {
              title
              position
              completed
              updatedAt
            }
          }
        `,
      })
      await server.executeOperation({
        query: gql`
          mutation {
            createTask(input: { listId: "${worldCupListId}", title: "${NEW_TASK_TITLE_ENGLAND}", createdUserId: "${userId}"}) {
              title
              position
              completed
              updatedAt
            }
          }
        `,
      })
      await server.executeOperation({
        query: gql`
          mutation {
            createTask(input: { listId: "${worldCupListId}", title: "${NEW_TASK_TITLE_PORTUGAL}", createdUserId: "${userId}"}) {
              title
              position
              completed
              updatedAt
            }
          }
        `,
      })

      const createdWorldCupTask: Task | null = resultArgentina.data?.createTask
      const updatedAt = new Date(createdWorldCupTask?.updatedAt).getTime()
      const [prismaCreatedArgentinaTask] = await prisma.task.findMany({
        where: { title: NEW_TASK_TITLE_ARGENTINA },
      })
      const [prismaCreatedFranceTask] = await prisma.task.findMany({
        where: { title: NEW_TASK_TITLE_FRANCE },
      })
      const [prismaCreatedEnglandTask] = await prisma.task.findMany({
        where: { title: NEW_TASK_TITLE_ENGLAND },
      })

      // Assess
      expect(resultArgentina).toBeTruthy()
      expect(resultArgentina.errors).toBeFalsy()
      expect(createdWorldCupTask).toBeDefined()
      expect(createdWorldCupTask?.title).toBe(NEW_TASK_TITLE_ARGENTINA)
      expect(now).toBeLessThan(updatedAt)
      expect(prismaCreatedArgentinaTask).toBeDefined()
      expect(prismaCreatedArgentinaTask?.listId).toBe(worldCupListId)
      expect(prismaCreatedArgentinaTask?.title).toBe(NEW_TASK_TITLE_ARGENTINA)
      expect(prismaCreatedArgentinaTask?.position).toBe(1)
      expect(prismaCreatedArgentinaTask?.completed).toBe(false)
      expect(prismaCreatedFranceTask).toBeDefined()
      expect(prismaCreatedFranceTask?.listId).toBe(worldCupListId)
      expect(prismaCreatedFranceTask?.title).toBe(NEW_TASK_TITLE_FRANCE)
      expect(prismaCreatedFranceTask?.position).toBe(2)
      expect(prismaCreatedFranceTask?.completed).toBe(false)
      expect(prismaCreatedEnglandTask).toBeDefined()
      expect(prismaCreatedEnglandTask?.listId).toBe(worldCupListId)
      expect(prismaCreatedEnglandTask?.title).toBe(NEW_TASK_TITLE_ENGLAND)
      expect(prismaCreatedEnglandTask?.position).toBe(5)
      expect(prismaCreatedEnglandTask?.completed).toBe(false)
    })

    test('Update an existing task', async () => {
      // Arrange
      const [englandTask] = await prisma.task.findMany({
        where: {
          title: NEW_TASK_TITLE_ENGLAND,
        },
      })
      const englandTaskId = englandTask?.taskId ?? ''
      const lastUpdatedAt = (englandTask?.updatedAt ?? new Date()).getTime()

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            updateTask(taskId: "${englandTaskId}", input: { title: "${UPDATE_TASK_TITLE_BRAZIL}", completed: true, updatedUserId: "${userId}"}) {
              title
              position
              completed
              updatedAt
            }
          }
        `,
      })

      const updatedBrazilTask: Task | null = result.data?.updateTask
      const updatedAt = new Date(updatedBrazilTask?.updatedAt).getTime()
      const [prismaUpdatedBrazilTask] = await prisma.task.findMany({
        where: {
          title: UPDATE_TASK_TITLE_BRAZIL,
        },
      })

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(updatedBrazilTask).toBeDefined()
      expect(updatedBrazilTask?.title).toBe(UPDATE_TASK_TITLE_BRAZIL)
      expect(lastUpdatedAt).toBeLessThan(updatedAt)
      expect(prismaUpdatedBrazilTask).toBeDefined()
      expect(prismaUpdatedBrazilTask?.title).toBe(UPDATE_TASK_TITLE_BRAZIL)
      expect(prismaUpdatedBrazilTask?.position).toBe(5)
      expect(prismaUpdatedBrazilTask?.completed).toBe(true)
    })

    test('Move task from 1 to 6, should move 6 tasks', async () => {
      // Arrange
      const [worldCupList] = await prisma.list.findMany({
        where: {
          title: { contains: 'World Cup' },
        },
      })
      const worldCupListId = worldCupList?.listId ?? ''
      const beforeMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      // 1 Argentina
      // 2 France
      // 3 Croatia
      // 4 Morocco
      // 5 Brazil
      // 6 Portugal
      const [argentina] = beforeMoveTasks

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            moveTask(taskId: "${argentina.taskId}", input: { position: 6, updatedUserId: "${userId}"})
          }
        `,
      })

      const affectedRows: number = result.data?.moveTask
      const afterMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      // 1 France
      // 2 Croatia
      // 3 Morocco
      // 4 Brazil
      // 5 Portugal
      // 6 Argentina
      const [france, croatia, morocco, brazil, portugal, newArgentina] =
        afterMoveTasks

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(affectedRows).toBe(6)
      expect(france.position).toBe(1)
      expect(croatia.position).toBe(2)
      expect(morocco.position).toBe(3)
      expect(brazil.position).toBe(4)
      expect(portugal.position).toBe(5)
      expect(newArgentina.position).toBe(6)
    })

    test('Move task from 6 to 1, should move 6 tasks', async () => {
      // Arrange
      const [worldCupList] = await prisma.list.findMany({
        where: {
          title: { contains: 'World Cup' },
        },
      })
      const worldCupListId = worldCupList?.listId ?? ''
      const beforeMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      // 1 France
      // 2 Croatia
      // 3 Morocco
      // 4 Brazil
      // 5 Portugal
      // 6 Argentina
      const argentina = beforeMoveTasks.slice(-1).pop()

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            moveTask(taskId: "${argentina?.taskId}", input: { position: 1, updatedUserId: "${userId}"})
          }
        `,
      })

      const affectedRows: number = result.data?.moveTask
      const afterMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      // 1 Argentina
      // 2 France
      // 3 Croatia
      // 4 Morocco
      // 5 Brazil
      // 6 Portugal
      const [newArgentina, france, croatia, morocco, brazil, portugal] =
        afterMoveTasks

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(affectedRows).toBe(6)
      expect(newArgentina.position).toBe(1)
      expect(france.position).toBe(2)
      expect(croatia.position).toBe(3)
      expect(morocco.position).toBe(4)
      expect(brazil.position).toBe(5)
      expect(portugal.position).toBe(6)
    })

    test('Move task from 2 to 5, should move 4 tasks', async () => {
      // Arrange
      const [worldCupList] = await prisma.list.findMany({
        where: {
          title: { contains: 'World Cup' },
        },
      })
      const worldCupListId = worldCupList?.listId ?? ''
      const beforeMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      // 1 Argentina
      // 2 France
      // 3 Croatia
      // 4 Morocco
      // 5 Brazil
      // 6 Portugal
      const [, france] = beforeMoveTasks

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            moveTask(taskId: "${france.taskId}", input: { position: 5, updatedUserId: "${userId}"})
          }
        `,
      })

      const affectedRows: number = result.data?.moveTask
      const afterMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      // 1 Argentina
      // 2 Croatia
      // 3 Morocco
      // 4 Brazil
      // 5 France
      // 6 Portugal
      const [argentina, croatia, morocco, brazil, newFrance, portugal] =
        afterMoveTasks

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(affectedRows).toBe(4)
      expect(argentina.position).toBe(1)
      expect(croatia.position).toBe(2)
      expect(morocco.position).toBe(3)
      expect(brazil.position).toBe(4)
      expect(newFrance.position).toBe(5)
      expect(portugal.position).toBe(6)
    })

    test('Move task from 5 to 2, should move 4 tasks', async () => {
      // Arrange
      const [worldCupList] = await prisma.list.findMany({
        where: {
          title: { contains: 'World Cup' },
        },
      })
      const worldCupListId = worldCupList?.listId ?? ''
      const beforeMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      // 1 Argentina
      // 2 Croatia
      // 3 Morocco
      // 4 Brazil
      // 5 France
      // 6 Portugal
      const [, , , , france] = beforeMoveTasks

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            moveTask(taskId: "${france.taskId}", input: { position: 2, updatedUserId: "${userId}"})
          }
        `,
      })

      const affectedRows: number = result.data?.moveTask
      const afterMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      // 1 Argentina
      // 2 France
      // 3 Croatia
      // 4 Morocco
      // 5 Brazil
      // 6 Portugal
      const [argentina, newFrance, croatia, morocco, brazil, portugal] =
        afterMoveTasks

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(affectedRows).toBe(4)
      expect(argentina.position).toBe(1)
      expect(newFrance.position).toBe(2)
      expect(croatia.position).toBe(3)
      expect(morocco.position).toBe(4)
      expect(brazil.position).toBe(5)
      expect(portugal.position).toBe(6)
    })

    test('Move task from 1 to 1, no tasks need to move', async () => {
      // Arrange
      const [worldCupList] = await prisma.list.findMany({
        where: {
          title: { contains: 'World Cup' },
        },
      })
      const worldCupListId = worldCupList?.listId ?? ''
      const beforeMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      const [argentina] = beforeMoveTasks

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            moveTask(taskId: "${argentina.taskId}", input: { position: 1, updatedUserId: "${userId}"})
          }
        `,
      })

      const affectedRows: number = result.data?.moveTask
      const afterMoveTasks = await prisma.task.findMany({
        where: { listId: worldCupListId },
        orderBy: { position: 'asc' },
      })
      const [afterArgentina] = afterMoveTasks

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(affectedRows).toBe(0)
      expect(argentina.position).toBe(1)
      expect(afterArgentina.position).toBe(1)
    })

    test('Delete an existing task', async () => {
      // Arrange
      const [portugalTask] = await prisma.task.findMany({
        where: {
          title: NEW_TASK_TITLE_PORTUGAL,
        },
      })
      const portugalTaskId = portugalTask?.taskId ?? ''

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            deleteTask(taskId: "${portugalTaskId}") {
              success
            }
          }
        `,
      })

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(result.data).toBeTruthy()
      expect(result.data?.deleteTask?.success).toBeTruthy()
    })

    test('Delete an existing list', async () => {
      // Arrange
      const [worldCupList] = await prisma.list.findMany({
        where: {
          title: { contains: 'World Cup' },
        },
      })
      const worldCupListId = worldCupList?.listId ?? ''

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            deleteList(listId: "${worldCupListId}") {
              success
            }
          }
        `,
      })

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(result.data).toBeTruthy()
      expect(result.data?.deleteList?.success).toBeTruthy()
    })
  })

  describe('🔥 Failure Cases', () => {
    test('Create a list with invalid arguments', async () => {
      // Arrange

      // Act
      const result = await server.executeOperation({
        query: gql`
          mutation {
            createList(input: invalidArgument)
          }
        `,
      })

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeTruthy()
    })
  })
})

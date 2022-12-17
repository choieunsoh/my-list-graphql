import { ApolloServer, gql } from 'apollo-server'
import { PrismaClient } from '@prisma/client'

import { List, Task } from 'generated/types'
import { startListServer } from '../../list'

describe('List Query', () => {
  let server: ApolloServer
  let prisma: PrismaClient

  beforeAll(async () => {
    server = await startListServer()
    prisma = new PrismaClient()
  })

  afterAll(async () => {
    await server.stop()
    await prisma.$disconnect()
  })

  describe('✅ Happy Cases', () => {
    test('Retrieve all lists and their tasks', async () => {
      // Arrange

      // Act
      const result = await server.executeOperation({
        query: gql`
          query {
            lists {
              title
              tasks {
                title
                position
              }
            }
          }
        `,
      })

      const lists: List[] = result.data?.lists ?? []
      const [firstList] = lists
      const [latestTask] = firstList.tasks ?? []
      const firstTask = (firstList.tasks ?? []).slice().pop()

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(lists).toHaveLength(6)
      expect(firstList.tasks).toHaveLength(5)
      expect(latestTask.title).toBe('Black Panther: Wakanda Forever')
      expect(latestTask.position).toBe(5)
      expect(firstTask?.title).toBe('Top Gun: Maverick')
      expect(firstTask?.position).toBe(1)
    })

    test('Retrieve a list and their tasks', async () => {
      // Arrange
      const theList = await prisma.list.findFirst({
        where: { title: 'Dream Destination' },
      })
      const listId = theList?.listId ?? ''

      // Act
      const result = await server.executeOperation({
        query: gql`
          query {
            list(id: "${listId}") {
              title
              tasks {
                title
                position
              }
            }
          }
        `,
      })

      const list: List = result.data?.list
      const [latestTask] = list.tasks ?? []
      const firstTask = (list.tasks ?? []).slice().pop()

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeFalsy()
      expect(list.tasks).toHaveLength(5)
      expect(latestTask.title).toBe('Hallstatt, Austria')
      expect(latestTask.position).toBe(5)
      expect(firstTask?.title).toBe('Bora Bora Island')
      expect(firstTask?.position).toBe(1)
    })
  })

  describe('🔥 Failure Cases', () => {
    test('Retrieve all lists and their tasks with invalid arguments', async () => {
      // Arrange

      // Act
      const result = await server.executeOperation({
        query: gql`
          query {
            lists {
              invalidArgument
            }
          }
        `,
      })

      // Assess
      expect(result).toBeTruthy()
      expect(result.errors).toBeTruthy()
    })
  })
})

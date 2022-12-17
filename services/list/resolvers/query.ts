import { Resolvers } from 'generated/types'
import { Context } from '../../../libs/context'
import { Task } from '@prisma/client'

export const query: Resolvers<Context>['Query'] = {
  lists: async (_parent, _args, ctx) => {
    const lists = await ctx.prisma.list.findMany({
      orderBy: { title: 'asc' },
    })
    if (lists.length === 0) return lists

    const taskMap = await createTaskMap(ctx)

    return lists.map(list => {
      const tasks = taskMap.get(list.listId) ?? []
      return {
        ...list,
        tasks,
      }
    })
  },
  list: async (_parent, { id }, ctx) => {
    const list = await ctx.prisma.list.findUnique({
      where: { listId: id },
    })
    if (!list) return null

    const tasks = await findAllTasks(ctx, id)

    return {
      ...list,
      tasks,
    }
  },
}

async function createTaskMap(ctx: Context) {
  const tasks = await findAllTasks(ctx)
  const taskMap = new Map<string, Array<Task>>()
  tasks.forEach(task => {
    const listId = task.listId
    const tasksInList = taskMap.get(listId) ?? []
    tasksInList.push(task)
    taskMap.set(listId, tasksInList)
  })
  return taskMap
}

async function findAllTasks(ctx: Context, id: string | null = null) {
  if (!id) {
    return await ctx.prisma.task.findMany({
      orderBy: [{ position: 'desc' }, { updatedAt: 'desc' }, { title: 'desc' }],
    })
  }

  return await ctx.prisma.task.findMany({
    where: { listId: id },
    orderBy: [{ position: 'desc' }, { updatedAt: 'desc' }, { title: 'desc' }],
  })
}

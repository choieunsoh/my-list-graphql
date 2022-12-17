import { Resolvers } from 'generated/types'
import { Context } from 'libs/context'

export const mutation: Resolvers<Context>['Mutation'] = {
  createList: async (_parent, { input }, ctx) => {
    const createdList = await ctx.prisma.list.create({
      data: {
        title: input.title,
        createdUserId: input.createdUserId,
        updatedUserId: input.createdUserId,
      },
    })
    return {
      ...createdList,
      tasks: [],
    }
  },

  updateList: async (_parent, { listId, input }, ctx) =>
    ctx.prisma.list.update({
      where: { listId },
      data: {
        title: input.title ?? undefined,
        updatedUserId: input.updatedUserId ?? undefined,
      },
    }),

  deleteList: async (_parent, { listId }, ctx) => {
    const deleteTasks = ctx.prisma.task.deleteMany({
      where: { listId },
    })
    const deleteList = ctx.prisma.list.delete({
      where: { listId },
    })

    const [deletedTasks, deletedList] = await ctx.prisma.$transaction([
      deleteTasks,
      deleteList,
    ])
    const success: boolean = (deletedList ? 1 : 0) + deletedTasks.count > 0

    return {
      success,
    }
  },

  createTask: async (_parent, { input }, ctx) => {
    const latestTask = await ctx.prisma.task.findFirst({
      where: { listId: input.listId },
      orderBy: { position: 'desc' },
    })
    const nextPosition = (latestTask?.position ?? 0) + 1

    const createdTask = await ctx.prisma.task.create({
      data: {
        listId: input.listId,
        title: input.title,
        position: nextPosition,
        createdUserId: input.createdUserId,
        updatedUserId: input.createdUserId,
      },
    })
    return createdTask
  },

  updateTask: async (_parent, { taskId, input }, ctx) =>
    ctx.prisma.task.update({
      where: { taskId },
      data: {
        title: input.title ?? undefined,
        completed: input.completed,
        updatedUserId: input.updatedUserId ?? undefined,
      },
    }),

  deleteTask: async (_parent, { taskId }, ctx) => {
    const deleteTask = await ctx.prisma.task.delete({
      where: { taskId },
    })

    return {
      success: !!deleteTask,
    }
  },

  moveTask: async (_parent, { taskId, input }, ctx) => {
    const task = await ctx.prisma.task.findUnique({ where: { taskId } })
    if (!task) return 0

    const { listId, position: currentPosition } = task
    const { position: newPosition, updatedUserId } = input
    if (newPosition === currentPosition) return 0

    const positionCondition =
      newPosition > currentPosition
        ? 'AND "position" > $3 AND "position" <= $4'
        : 'AND "position" >= $4 AND "position" < $3'
    const sign = newPosition > currentPosition ? '-' : '+'

    const UPDATE_POSITION_SQL = `
UPDATE "Task" A SET
"position" = B."newPosition"
,"updatedAt" = CURRENT_TIMESTAMP 
,"updatedUserId" = $5
FROM (
	SELECT "taskId"
	,$4 AS "newPosition"
	FROM "Task"
	WHERE "taskId" = $2
	UNION
	SELECT "taskId"
	,"position" ${sign} 1 AS "newPosition"
	FROM "Task" 
	WHERE "listId" = $1
	AND "taskId" <> $2
	${positionCondition}
) B
WHERE A."taskId" = B."taskId"`

    const affectedRows = await ctx.prisma.$executeRawUnsafe(
      UPDATE_POSITION_SQL,
      listId,
      taskId,
      currentPosition,
      newPosition,
      updatedUserId
    )

    return affectedRows
  },
}

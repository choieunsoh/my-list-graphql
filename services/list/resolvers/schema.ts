import { gql } from 'apollo-server'

export const typeDefs = gql`
  scalar DateTime

  type Task {
    taskId: ID!
    title: String!
    position: Int!
    completed: Boolean!
    updatedAt: DateTime!
  }

  type List {
    listId: ID!
    title: String!
    tasks: [Task!]
    updatedAt: DateTime!
  }

  input CreateListInput {
    title: String!
    createdUserId: String!
  }

  input UpdateListInput {
    title: String!
    updatedUserId: String!
  }

  input CreateTaskInput {
    listId: ID!
    title: String!
    description: String!
    createdUserId: String!
  }

  input UpdateTaskInput {
    title: String!
    completed: Boolean!
    updatedUserId: String!
  }

  input MoveTaskInput {
    position: Int!
    updatedUserId: String!
  }

  type MutationResult {
    success: Boolean!
  }

  type Query {
    lists: [List!]!
    list(id: ID!): List
  }

  type Mutation {
    createList(input: CreateListInput!): List!
    updateList(listId: ID!, input: UpdateListInput!): List
    deleteList(listId: ID!): MutationResult!
    createTask(input: CreateTaskInput!): Task!
    updateTask(taskId: ID!, input: UpdateTaskInput!): Task
    deleteTask(taskId: ID!): MutationResult!
    moveTask(taskId: ID!, input: MoveTaskInput!): Int!
  }
`

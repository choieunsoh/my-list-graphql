import { PrismaClient } from '@prisma/client'

interface ListData {
  [title: string]: TaskData[]
}
interface TaskData {
  listId?: string
  title: string
  description?: string
  position?: number
}

const prisma = new PrismaClient()

async function main() {
  await prisma.task.deleteMany()
  await prisma.list.deleteMany()
  await prisma.user.deleteMany()

  const user1 = await prisma.user.create({
    data: {
      username: 'admin',
      password: '1234',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      username: 'tod',
      password: '1234',
    },
  })

  console.log({ user1, user2 })

  const createdUserId = user2.id
  const updatedUserId = user2.id

  const data: ListData = {
    'Top Programming Languages in 2022': [
      {
        title: 'JavaScript / TypeScript',
        description:
          'Jobs Found: 801K (~31%), Keywords: javascript, typescript, react, angular, vue, node.',
      },
      {
        title: 'Python',
        description:
          'Jobs Found: 515K (~20%), Keywords: python, django, flask.',
      },
      {
        title: 'Java',
        description: 'Jobs Found: 443K (~17%), Keywords: java, spring.',
      },
      {
        title: 'C#',
        description: 'Jobs Found: 305K (~12%), Keywords: c#, .net.',
      },
      {
        title: 'PHP',
        description:
          'Jobs Found: 226K (~9%), Keywords: php, laravel, wordpress.',
      },
    ],
    'Dream Destination': [
      {
        title: 'Bora Bora Island',
        description:
          'The Bora Bora island is one of the most popular islands in The Islands of Tahiti.',
      },
      {
        title: 'Maldives',
        description: 'It lies southwest of Sri Lanka and India.',
      },
      {
        title: 'Tromso, Norway',
        description:
          'The one of the best places in the world to see the Northern Lights.',
      },
      {
        title: 'Switzerland',
        description:
          'A destination that many people dream about visiting for its romantic scenery',
      },
      {
        title: 'Hallstatt, Austria',
        description:
          'The picturesque little town of Hallstatt is one of the most beautiful places to visit in Austria',
      },
    ],
    'Daily Routine': [
      {
        title: 'English Class',
        description: 'Take an English class for 30 min.',
      },
      {
        title: 'Tech Articles',
        description: 'Read tech articles for an hour.',
      },
      {
        title: 'Practice Algorithm',
        description: 'Practice 2-3 questions a day.',
      },
      { title: 'Work From Home', description: 'Start from 10AM (8 hours).' },
      { title: 'Jogging', description: 'For an hour.' },
    ],
    '2022 Worldwide Box Office': [
      { title: 'Top Gun: Maverick', description: '$1,488,732,821' },
      { title: 'Jurassic World: Dominion', description: '$1,001,136,080' },
      {
        title: 'Doctor Strange in the Multiverse of Madness',
        description: '$955,775,804',
      },
      { title: 'Minions: The Rise of Gru', description: '$939,433,210' },
      { title: 'Black Panther: Wakanda Forever', description: '$772,662,471' },
    ],
    'The Game Awards 2022': [
      {
        title: 'Game of the Year',
        description: 'Elden Ring - FromSoftware / Bandai Namco Entertainment',
      },
      {
        title: 'Best Game Direction',
        description: 'Elden Ring - FromSoftware / Bandai Namco Entertainment',
      },
      {
        title: 'Best Narrative',
        description:
          'God of War Ragnarök - Santa Monica Studio / Sony Interactive Entertainment',
      },
      {
        title: 'Best Art Direction',
        description: 'Elden Ring - FromSoftware / Bandai Namco Entertainment',
      },
      {
        title: 'Best Independent Game',
        description: 'Stray - BlueTwelve Studio / Annapurna Interactive',
      },
    ],
    'My Favorite Anime': [
      {
        title: 'Dragon Ball',
        description: '',
      },
      {
        title: 'Saint Seiya',
        description: '',
      },
      {
        title: 'Detective Conan',
        description: '',
      },
      {
        title: 'Sword Art Online',
        description: '',
      },
      {
        title: 'One Piece',
        description: '',
      },
    ],
  }

  await prisma.list.createMany({
    data: Object.keys(data).map(title => {
      return { title, createdUserId, updatedUserId }
    }),
    skipDuplicates: true,
  })

  const listMap = new Map<string, string>()
  const lists = await prisma.list.findMany()
  lists.forEach(list => {
    listMap.set(list.title, list.listId)
  })

  const allTasks: TaskData[] = []
  Object.keys(data).forEach(listTitle => {
    const listId = listMap.get(listTitle) ?? ''
    const tasks = data[listTitle]
    const tasksInList = tasks.map<TaskData>((task, index) => {
      return {
        listId,
        title: task.title,
        position: index + 1,
      }
    })
    allTasks.push(...tasksInList)
  })
  await prisma.task.createMany({
    data: allTasks.map(({ listId = '', title, position }) => {
      return {
        listId,
        title,
        position,
        createdUserId,
        updatedUserId,
      }
    }),
    skipDuplicates: true,
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

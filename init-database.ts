import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const users: { name: string, apiKey: string }[] = [
  {
    name: "Bob",
    apiKey: "123456",
  },
  {
    name: "Jake",
    apiKey: "qwerty",
  }
];
const tweets: { content: string, authorId: number }[] = [
  {
    content: 'This is my second tweet!',
    authorId: 1
  },
  {
    content: 'Hi, my name is Jake!',
    authorId: 2
  },
  {
    content: 'Hi, my name is Jake!',
    authorId: 2
  },
  {
    content: 'Hi, my name is Jake!',
    authorId: 2
  }
]

console.log('connected to prisma database');

async function init() {
  for (const user of users) {
    await prisma.user.create({
      data: {
        name: user.name,
        apiKey: user.apiKey
      }
    });
  }
  for (const tweet of tweets) {
    await prisma.tweet.create({
      data: {
        content: tweet.content,
        authorId: tweet.authorId
      }
    });
  }
}

init().then(() => {
  console.log('database initialized');
});



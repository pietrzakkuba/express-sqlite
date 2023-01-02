const express = require("express");
const bodyParser = require("body-parser");
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(bodyParser.json());
const prisma = new PrismaClient();

app.use(async (req, res, next) => {
  const authNeeded = ['POST', 'DELETE'].includes(req.method) && req.path.includes('/tweets');
  if (authNeeded) {
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          {id: req.body.id},
          {apiKey: req.header('x-api-key')}
        ]
      }
    });
    if (!user) {
      res.status(401).json({
        status: 401,
        message: 'Wrong credentials'
      });
    } else {
      res.locals.user = user;
      next();
    }
  } else next();
})

app.get("/tweets", async (req, res) => {
  const tweets = await prisma.tweet.findMany();
  res.json(tweets);
});

app.get("/users/:id", async (req, res) => {
  const user = await prisma.user.findFirst({
    select: {
      id: true,
      name: true
    },
    where: {
      id: Number(req.params.id)
    }
  })
  if (!user) {
    res.status(404).json({
      status: 404,
      message: "User not found",
    });
  }
  else res.json(user);
});

app.get("/users/:id/tweets", async (req, res) => {
  const tweets = await prisma.tweet.findMany({
    where: {
      authorId: Number(req.params.id)
    }
  });
  res.json(tweets);
});

app.post("/tweets", async (req, res) => {
  const tweet = await prisma.tweet.create({
    data: {
      content: req.body.content,
      authorId: req.body.id
    }
  })
  res.status(201).json(tweet);
});

app.delete("/tweets/:id", async (req, res) => {
  const tweetToDeleteExists = !!await prisma.tweet.findFirst({
    where: {
      AND: [
        {id: Number(req.params.id)},
        {authorId: res.locals.user.id}
      ]
    }
  });
  if (tweetToDeleteExists) {
    const tweet = await prisma.tweet.delete({
      where: {id: Number(req.params.id)}
    });
    res.json(tweet);
  } else {
    res.json({status: 'tweet does not exist or someone else is its author'});
  }
});

app.listen(3000, () => console.log("app is running"));

# Create DI Container

> Tiny universal ES-friendly dependency injection tool

[![npm version](https://img.shields.io/npm/v/create-di-container.svg)](https://npmjs.com/create-di-container)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/create-di-container.svg)](https://bundlephobia.com/result?p=create-di-container)
[![npm type definitions](https://img.shields.io/npm/types/create-di-container.svg)](https://npmjs.com/create-di-container)
[![npm downloads](https://img.shields.io/npm/dm/create-di-container.svg)](https://npmjs.com/create-di-container)
[![Build Status](https://travis-ci.com/umidbekkarimov/di-container.svg?branch=master)](https://travis-ci.com/umidbekkarimov/di-container)
[![codecov](https://codecov.io/gh/umidbekkarimov/di-container/branch/master/graph/badge.svg)](https://codecov.io/gh/umidbekkarimov/di-container)
[![npm license](https://img.shields.io/npm/l/create-di-container.svg)](https://npmjs.com/create-di-container)

#### Installation

```bash
npm install create-di-container
```

#### Usage

```js
import express from "express";
import { Container, AbstractInjectableClass } from "create-di-container";
import db from "./db"; // Your custom database connection.

const app = express();

class UserRepo extends AbstractInjectableClass {
  get db() {
    // Take transaction or default connection.
    return (
      this.container.resolveValue("trx") || this.container.resolveValue("db")
    );
  }

  getUser(id) {
    return this.db.user.findOne({ id });
  }

  async editUser(id, values) {
    const entity = await this.getUser(id);

    return this.db.user.update(entity, values);
  }
}

app.use(req => {
  req.container = new Container();
  req.container.inject("db", db);
});

app.get("/users/:id", (req, res) => {
  const userRepo = req.container.resolveClass(UserRepo);

  userRepo.getUser(req.params.id).then(user => {
    res.json(user);
  });
});

app.put("/users/:id", (req, res) => {
  const db = req.container.resolveValue("db");
  const userRepo = req.container.resolveClass(UserRepo);

  db.transaction(trx => {
    // Replace current db.
    req.container.inject("trx", trx);

    return userRepo.editUser(req.params.id, req.body);
  }).then(user => {
    res.json(user);
  });
});
```

# Create DI Container

> Tiny universal ES-friendly dependency injection tool

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

import express from "express";

// using classes to benefit from dependency injection in order to test
export class Server {
  private app: express.Application;

  constructor(express: express.Application) {
    this.app = express;

    this.app.get("/", (req, res) => {
      res.send("Round robin server");
    });
  }
}

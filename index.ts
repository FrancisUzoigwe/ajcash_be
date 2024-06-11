import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import { mainApp } from "./mainApp";
import { dbConfig } from "./utils/dbConfig";
import { IncomingMessage, ServerResponse, Server } from "node:http";

const app: Application = express();
const port: number | string = process.env.PORT || 2244;

app.use(cors({ origin: "https://ajcash-ng.web.app", methods: ["GET", "POST", "DELETE", "PATCH"] }));
app.use(express.json());

mainApp(app);

const server: Server<typeof IncomingMessage, typeof ServerResponse> =
  app.listen(port, () => {
    console.clear();

    dbConfig();
  });

process.on("uncaughtException", (error: Error) => {
  console.log("uncaughtException: ", error);

  process.exit(0);
});

process.on("uncaughtException", (reason: any) => {
  console.log("uncaughtException: ", reason);

  server.close(() => {
    process.exit(0);
  });
});

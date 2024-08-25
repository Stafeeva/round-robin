import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Server } from "./server";

// db dependencies
import mysql from "mysql";
import puresql, { PuresqlAdapter } from "puresql";

// domain dependencies
import * as meeting from "@App/repository/meeting";
import { Service as MeetingService } from "@App/service/meeting";
import * as speaker from "@App/repository/speaker";
import { Service as SpeakerService } from "@App/service/speaker";

const PORT = process.env.PORT || 8000;

const app: express.Application = express();

const httpServer = createServer(app);
const io: SocketIOServer = new SocketIOServer(httpServer);

app.use(express.json());
// Serve the React static files after build
app.use(express.static("../../client/build"));

httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const dbConnection = mysql.createConnection({
  host: "0.0.0.0",
  port: 3306,
  user: "root", // defined in docker-compose.yml
  password: "password",
  database: "roundrobin",
});

const pureSQLAdapter: PuresqlAdapter = puresql.adapters.mysql(
  dbConnection,
  () => {}
);

const pureSQLQueries: Record<
  string,
  puresql.PuresqlQuery<any>
> = puresql.loadQueries("server/src/queries.sql");

const meetingRepository = new meeting.SQLRepository(
  pureSQLAdapter,
  pureSQLQueries
);

const speakerRepository = new speaker.SQLRepository(
  pureSQLAdapter,
  pureSQLQueries
);

const meetingService = new MeetingService(meetingRepository);
const speakerService = new SpeakerService(speakerRepository);

const roundRobinServer = new Server(app, meetingService, speakerService);

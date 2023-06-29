import express from "express";
import { router } from "./routes";
import client, { Connection, Channel, ConsumeMessage } from "amqplib";

const app = express();

app.use(express.json());
app.use(router);

app.listen(process.env.PORT || 3001, () => console.log("Listening!"));

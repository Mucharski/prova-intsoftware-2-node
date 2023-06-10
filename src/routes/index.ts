import { RestaurantResponse } from "./../interfaces/createSchedule";
import { prisma } from "../database";
import { Router, Response, Request } from "express";
import { formatISO, lastDayOfMonth, lastDayOfWeek } from "date-fns";
import axios from "axios";
import https from "https";
import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { Kafka, Producer } from "kafkajs";

export const router = Router();

router.post("/createSchedules", async (req: Request, res: Response) => {
  const today = new Date();
  const messages: RestaurantResponse[] = [];

  const consumer =
    async (channel: Channel) =>
    (msg: ConsumeMessage | null): void => {
      if (msg) {
        let message: RestaurantResponse = JSON.parse(msg.content.toString());
        messages.push(message);
        channel.ack(msg);
      }
    };

  const connection: Connection = await client.connect("amqp://localhost");

  const channel: Channel = await connection.createChannel();

  await channel.assertQueue("new-restaurants", { durable: false });

  await channel.consume("new-restaurants", await consumer(channel));

  const kafkaClient: Kafka = new Kafka({
    clientId: "node-kafka",
    brokers: ["localhost:9092"],
  });

  const producer: Producer = kafkaClient.producer();

  messages.forEach(async (element: RestaurantResponse) => {
    await prisma.schedule.create({
      data: {
        scheduledTo: lastDayOfWeek(today),
        restaurantName: element.Name,
        restaurantId: element.Id,
      },
    });

    await prisma.schedule.create({
      data: {
        scheduledTo: lastDayOfMonth(today),
        restaurantName: element.Name,
        restaurantId: element.Id,
      },
    });

    await producer.connect();

    console.log("Enviando mensagem ao Kafka...");
    await producer.send({
      topic: "schedules",
      messages: [
        {
          value: JSON.stringify(element),
        },
      ],
    });
    console.log("Mensagem enviada ao Kafka!");
  });

  await producer.disconnect();

  if (messages.length > 0) {
    return res.status(200).json({
      message: "A fila foi processada e os agendamentos foram criados!",
    });
  } else {
    return res.status(400).json({
      message: "A fila estava vazia e nenhum agendamento foi criado!",
    });
  }
});

router.get("/getSchedules", async (req: Request, res: Response) => {
  const schedules = await prisma.schedule.findMany();

  return res.status(200).json({ schedules: schedules });
});

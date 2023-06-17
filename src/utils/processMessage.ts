import { RestaurantResponse } from "./../interfaces/createSchedule";
import { prisma } from "../database";
import { Router, Response, Request } from "express";
import { formatISO, lastDayOfMonth, lastDayOfWeek } from "date-fns";
import axios from "axios";
import https from "https";
import { Kafka, Producer } from "kafkajs";

export async function processMessage(message: RestaurantResponse) {
  const today = new Date();

  const kafkaClient: Kafka = new Kafka({
    clientId: "node-kafka",
    brokers: ["localhost:9092"],
  });

  const producer: Producer = kafkaClient.producer();

  await prisma.schedule.create({
    data: {
      scheduledTo: lastDayOfWeek(today),
      restaurantName: message.Name,
      restaurantId: message.Id,
    },
  });

  let schedule = {
    scheduledTo: lastDayOfWeek(today),
    restaurantName: message.Name,
    restaurantId: message.YelpId,
  };

  await producer.connect();
  console.log("Enviando mensagem ao Kafka...");
  await producer.send({
    topic: "schedules",
    messages: [
      {
        value: JSON.stringify(schedule),
      },
    ],
  });
  console.log("Mensagem enviada ao Kafka!");

  await prisma.schedule.create({
    data: {
      scheduledTo: lastDayOfMonth(today),
      restaurantName: message.Name,
      restaurantId: message.Id,
    },
  });

  schedule = {
    scheduledTo: lastDayOfMonth(today),
    restaurantName: message.Name,
    restaurantId: message.YelpId,
  };

  console.log("Enviando mensagem ao Kafka...");
  await producer.send({
    topic: "schedules",
    messages: [
      {
        value: JSON.stringify(schedule),
      },
    ],
  });
  console.log("Mensagem enviada ao Kafka!");

  await producer.disconnect();
}

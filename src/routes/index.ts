import { RestaurantResponse } from "./../interfaces/createSchedule";
import { prisma } from "../database";
import { Router, Response, Request } from "express";
import { formatISO, lastDayOfMonth, lastDayOfWeek } from "date-fns";
import axios from "axios";
import https from "https";
import { Kafka, Producer } from "kafkajs";

export const router = Router();

router.get("/getSchedules", async (req: Request, res: Response) => {
  const schedules = await prisma.schedule.findMany();

  return res.status(200).json({ schedules: schedules });
});

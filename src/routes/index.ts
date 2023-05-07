import { prisma } from "../database";
import { Router, Response, Request } from "express";
import { RestaurantResponse } from "../interfaces/createSchedule";
import { formatISO, lastDayOfMonth, lastDayOfWeek } from "date-fns";
import axios from "axios";
import https from "https";

export const router = Router();

router.post("/createSchedules", async (req: Request, res: Response) => {
  const { body } = req;

  const agent = new https.Agent({ rejectUnauthorized: false });
  const today = new Date();
  axios
    .get("https://localhost:7197/Restaurant/List", { httpsAgent: agent })
    .then((res) => {
      res.data.forEach(async (element: RestaurantResponse) => {
        await prisma.schedule.create({
          data: {
            scheduledTo: lastDayOfWeek(today),
            restaurantName: element.name,
            restaurantId: element.id,
          },
        });

        await prisma.schedule.create({
          data: {
            scheduledTo: lastDayOfMonth(today),
            restaurantName: element.name,
            restaurantId: element.id,
          },
        });
      });
    });

  return res.status(200).json({ message: "Criado com sucesso!" });
});

router.get("/getSchedules", async (req: Request, res: Response) => {
  const schedules = await prisma.schedule.findMany();

  return res.status(200).json({ schedules: schedules });
});

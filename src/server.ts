import { RestaurantResponse } from "./interfaces/createSchedule";
import express from "express";
import { router } from "./routes";
import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { processMessage } from "./utils/processMessage";

const app = express();

app.use(express.json());
app.use(router);

messageConsumer();
async function messageConsumer(): Promise<void> {
  const consumer =
    async (channel: Channel) =>
    (msg: ConsumeMessage | null): void => {
      if (msg) {
        console.log(msg.content.toString());
        let restaurantResponse: RestaurantResponse = JSON.parse(
          msg.content.toString()
        );
        processMessage(restaurantResponse);
        channel.ack(msg);
      }
    };

  const connection: Connection = await client.connect("amqp://localhost");

  const channel: Channel = await connection.createChannel();

  await channel.assertQueue("new-restaurants", { durable: false });

  console.log("Waiting for messages....");

  await channel.consume("new-restaurants", await consumer(channel));

  //   await channel.close();
  //   await connection.close();
}

app.listen(process.env.PORT || 3001, () => console.log("Listening!"));

import { connect, NatsConnection, StringCodec } from "nats";

let nc: NatsConnection;

async function tryConnectNATS(retries: number = 5, delay: number = 2000) {
  while (retries > 0) {
    try {
      nc = await connect({ servers: "nats://nats-server:4222" });
      console.log("Connected to NATS");

      const sc = StringCodec();
      const sub = nc.subscribe("updates");
      (async () => {
        for await (const m of sub) {
          console.log(`Received a message: ${sc.decode(m.data)}`);
        }
      })().then(() => {
        console.log("subscription closed");
      });
      return;
    } catch (err) {
      console.error(
        `Failed to connect to NATS, retries left: ${retries - 1}`,
        err
      );
      retries--;
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  console.error("Could not connect to NATS after multiple attempts");
}

export async function connectNATS() {
  await tryConnectNATS();
}

export function getNATSConnection(): NatsConnection {
  return nc;
}

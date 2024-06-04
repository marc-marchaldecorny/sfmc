import { Messages, Scheduler, Queue, vcr } from "@vonage/vcr-sdk";
import express from "express";
import errorhandler from "errorhandler";
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(errorhandler());

const port = process.env.NERU_APP_PORT;
const queueName = `queue-${process.env.VCR_INSTANCE_SERVICE_NAME}`;
const queue = new Queue(vcr.getGlobalSession());

app.get("/_/health", async (req, res) => {
  res.sendStatus(200);
});

app.get("/_/metrics", async (req, res) => {
  res.sendStatus(200);
});

await createQueueIfNeeded();

async function createQueueIfNeeded() {
  let queueDetails;

  try {
    queueDetails = await queue.getQueueDetails(queueName);
    console.log("🚀 Getting queueDetails. queueName:", queueName);
  } catch (e) {
    console.log("No existing queue, creating...");
  }

  if (!queueDetails) {
    await queue.createQueue(queueName, "execute", {
      maxInflight: 10,
      msgPerSecond: 100,
      active: true,
    });
    console.log(`💡 createQueue queueName:${queueName}`);
  }
}

app.post("/execute", async (req, res, next) => {
  // console.log("🚀 execute:", req.body);
  console.log("🚀 execute");
  try {
    res.send("OK").status(200);
  } catch (error) {
    next(error);
  }
});

app.post("/queue", async (req, res, next) => {
  // console.log("🚀 queue:", req.body);
  console.log("🚀 queue");
  try {
    await queue.enqueueSingle(queueName, req.body);
    res.send("OK").status(200);
  } catch (error) {
    next(error);
  }
});

app.post("/list", async (req, res, next) => {
  try {
    const queues = await queue.list();
    console.log("🚀 list", queues);
    res.send(queues).status(200);
  } catch (error) {
    next(error);
  }
});
app.post("/delete", async (req, res, next) => {
  console.log("🚀 delete:", req.query.name);
  try {
    await queue.deleteQueue(req.query.name);
    res.send(`deleted ${req.query.name}`).status(200);
  } catch (error) {
    next(error);
  }
});

app.post("/getQueueDetails", async (req, res, next) => {
  console.log("🚀 getQueueDetails:", req.query.name);
  try {
    const queueDetails = await queue.getQueueDetails(req.query.name);

    res.send(queueDetails).status(200);
  } catch (error) {
    next(error);
  }
});

app.post("/deadLetterList", async (req, res, next) => {
  console.log("🚀 deadLetterList:", req.query.name);
  try {
    const failedTasks = await queue.deadLetterList(req.query.name);

    res.send(failedTasks).status(200);
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Neru listening on port ${port}`);
});

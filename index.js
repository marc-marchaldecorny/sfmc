import { neru, Messages, Scheduler, State, Voice } from "neru-alpha";
import express from "express";
import errorhandler from "errorhandler";
import { createFile } from "./create-json.js";
import { index } from "./routes/index.js";
import { save, validate, publish, execute, stop } from "./routes/activity.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(errorhandler());

const port = process.env.NERU_APP_PORT;
const URL =
  process.env.ENDPOINT_URL_SCHEME + "/" + process.env.INSTANCE_SERVICE_NAME;
const LANGUAGE = process.env.LANGUAGE;
const SFMC_APP_EXT_KEY = process.env.SFMC_APP_EXT_KEY;

const VONAGE_SENDER = process.env.VONAGE_SENDER;
const ENFORCE_SENDER_ID = process.env.ENFORCE_SENDER_ID;

if (process.env.DEBUG == "true") {
  console.log("🚀 Debug URL:", URL);
  // console.log("🚀 Debug URL:", neru.getAppUrl());
} else {
  console.log("🚀 Deploy URL:", URL);
  if (!VONAGE_SENDER) {
    console.log("ℹ️ VONAGE_SENDER:", VONAGE_SENDER);
  }

  console.log("ℹ️ ENFORCE_SENDER_ID:", ENFORCE_SENDER_ID);
}

// Creates SFMC ./public/config.json file.
createFile(LANGUAGE, SFMC_APP_EXT_KEY);

app.get("/_/health", async (req, res) => {
  res.sendStatus(200);
});

app.get("/_/metrics", async (req, res) => {
  res.sendStatus(200);
});

app.get("/test", (req, res) => {
  console.log("/✅ test");
  res.send("OK");
});

app.get("/", index);
app.post("/save/", save);
app.post("/validate/", validate);
app.post("/publish/", publish);
app.post("/execute/", execute);
app.post("/stop/", stop);

// WORKS WITH V01
app.post("/onMessage", async (req, res, next) => {
  try {
    console.log("/✅ onMessage", req.body);
    res.sendStatus(200);
  } catch (error) {
    console.log("❌ /onMessage error:", error);
    res.sendStatus(400);
    next(error);
  }
});

const session = neru.createSession();
const messaging = new Messages(session);

const to = { type: "sms", number: VONAGE_SENDER };
const from = { type: "sms", number: null };

// v0.1 - causes error: "error subscribing to event"
// let inboundMsg = await messaging
// .listenMessages('onMessage', from, to)
// .execute();
// console.log('✅ inboundMsg:', inboundMsg);

// v1 - still works for v0.1
let listeningForInbound = await messaging
  .onMessage("onMessage", from, to)
  .execute();
console.log("ℹ️ listeningForInbound:", listeningForInbound);

app.listen(port, () => {
  console.log(`Neru listening on port ${port}`);
});

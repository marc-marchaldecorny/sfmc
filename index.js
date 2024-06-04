import { neru, Messages, Scheduler, State, Queue, Voice } from "neru-alpha";
import express from "express";
import errorhandler from "errorhandler";
import { index } from "./routes/index.js";
import {
  save,
  validate,
  publish,
  execute,
  executeNeruMessaging,
  stop,
} from "./routes/activity.js";
import axios from "axios";
import { Base64 } from "js-base64";

const app = express();
const session = neru.createSession();
const messaging = new Messages(session);

app.use(express.json());
app.use(express.static("public"));
app.use(errorhandler());

const JUMPER_API_JWT =
  process.env.JUMPER_API_JWT ||
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ6OHJlQ0ZZdENQWTJCTFpkOE9IQWlPVFR3QXM0IiwiYXVkIjoieGhtSnBSWHlWa2ZHYnUwSmNkRXBiblM1ODlKc2tBU0dVM3hHRTJPYWFGV1dEV2htIiwiaXNzIjoidXJuOlwvXC9hcGlnZWUtZWRnZS1KV1QtcG9saWN5LXRlc3QiLCJtZXJjaGFudF9pZCI6IjYyMjQ2Nzc0MTg2OTY3MDQiLCJleHAiOjE2OTI3ODIxODksImlhdCI6MTY4NTAwNjE4OSwianRpIjoiY2MwMmZkNjUtMTIyYi00NjFjLThkMTctMWZiNmQzMzVlZTlhIn0.afkCe8pc9PutYvnFw2Bg2mA8ec6hOtTvvSROF6VsAMSU7cwAIz9s3B1wf1HOrxGl0lNhKTZnw5ISgLKHBcML-gi0dwXhPTE6mNfTnGU0nwX8fAClQTT9lNWL_FyFBxhDLs2bDnjTvaYQVzePOiqVRZY2ussdnmDiujdwYoegqHgacRQgTkqfnZ5QGns9w_p3kmdh1I2kyzERQrGtTgAAxx9mlVB_k8EKq82AHq70NiatHRpTyo2HJ7PPWTZymWy5gHCwcs0_lrtElG5uzC9FUWTLkwCFSEhe7X0ocjfGWhqATPC8dmhUSW-87ST1w_k7oV_bh-NPtnxsk9vKwP34QQ";

const port = process.env.NERU_APP_PORT;
const URL =
  process.env.ENDPOINT_URL_SCHEME + "/" + process.env.INSTANCE_SERVICE_NAME;
const TO_NUMBER = process.env.TO_NUMBER;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;

if (process.env.DEBUG == "true") {
  console.log("🚀 DEBUG:", URL);
} else {
  console.log("🚀 DEPLOY URL:", URL);
  if (!WHATSAPP_NUMBER || !TO_NUMBER) {
    console.log("ℹ️ WHATSAPP_NUMBER:", WHATSAPP_NUMBER);
    console.log("ℹ️ TO_NUMBER:", TO_NUMBER);
  }
}

app.get("/_/health", async (req, res) => {
  res.sendStatus(200);
});

app.get("/getTemplates", async (req, res) => {
  console.log("/✅ getTemplates:", req.body);

  try {
    var config = {
      method: "get",
      url: `https://api.jumper.ai/chat/fetch-whatsapp-templates?limit=all`,
      headers: {
        Authorization: `Bearer ${JUMPER_API_JWT}`,
      },
    };

    await axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        console.log("✅ Successfully got list");
        res.status(200).send(response.data);
      })
      .catch(function (error) {
        console.log(error);
        res.status(400).send(error);
      });
  } catch (error) {
    res.status(400).send(error);
  }
});
app.get("/getTemplate/:id", async (req, res) => {
  console.log("/✅ getTemplate/:id", req.body);

  try {
    if (!req.params.id) {
      res
        .status(400)
        .send(
          "You must pass in a template id, like URL/getTemplate/5278515970834432"
        );
    } else {
      const id = req.params.id;
      var config = {
        method: "get",
        url: `https://api.jumper.ai/chat/get-whatsapp-template?id=${id}`,
        headers: {
          Authorization: `Bearer ${JUMPER_API_JWT}`,
        },
      };

      await axios(config)
        .then(function (response) {
          console.log(`✅ Successfully got template: ${id}`);
          res.status(200).send(response.data);
        })
        .catch(function (error) {
          console.log(error);
          res.status(400).send(error);
        });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/", index);
app.post("/save/", save);
app.post("/validate/", validate);
app.post("/publish/", publish);
app.post("/execute/", execute);
app.post("/stop/", stop);

// To test neru messaging for neru deploy in dev environment
app.get("/execute", executeJumper);

function executeJumper(req, res) {
  // Simulating SFMC post request payload
  let request = {
    body: {
      inArguments: [
        { senderID: "12015542422" },
        { templateName: "template_test" },
        { templateText: "Hi , welcome to Vonage marketing" },
        { templateLanguage: "en" },
        { templatePlaceholders: "{FirstName}" },
        { phone: "15754947093" },
        { Id: "0050H00000Cm4DKITT" },
        { FirstName: "Kitt" },
        { Email: "kittphi@gmail.com" },
      ],
    },
  };
  execute(request, res);
}
// to test neru messaging for neru deploy in dev environment
app.get("/executeNeru/", executeNeru);

function executeNeru(req, res) {
  let request = {
    body: {
      inArguments: [
        { senderID: "12015542422" },
        { templateName: "template_test" },
        { templateText: "Hi , welcome to Vonage marketing" },
        { templateLanguage: "en" },
        { templatePlaceholders: "{FirstName}" },
        { phone: "15754947093" },
        { Id: "0050H00000Cm4DKITT" },
        { FirstName: "Kitt" },
        { Email: "kittphi@gmail.com" },
      ],
    },
  };
  executeNeruMessaging(request, res);
}

// WORKS WITH V01
app.post("/onMessage", async (req, res, next) => {
  try {
    console.log("/✅ onMessage", req.body);
    res.sendStatus(200);
  } catch (error) {
    console.log("❌ /onMessage error:", error);
    res.status(500).json({ error: error.message });
    next(error);
  }
});

const to = { type: "whatsapp", number: WHATSAPP_NUMBER };
const from = { type: "whatsapp", number: null };

// v1 - still works for v0.1
let listeningForInbound = await messaging
  .onMessage("onMessage", from, to)
  .execute();
console.log("ℹ️ listeningForInbound:", listeningForInbound);

app.listen(port, () => {
  console.log(`Neru listening on port ${port}`);
});

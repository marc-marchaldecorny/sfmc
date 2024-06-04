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

app.get("/test", async (req, res) => {
  res.sendStatus(200);
});

app.get("/getWATemplateList", async (req, res) => {
  console.log("/✅ getWATemplateList:", req.body);
  let body = "this body";
  res.status(200).send({ getWATemplateList: body });
});

app.post("/getWATemplateList", async (req, res) => {
  console.log("/✅ getWATemplateList:", req.body);

  try {
    let wabaID = req.body.wabaID;
    var token = req.body.token;

    var config = {
      method: "get",
      url: `https://api.nexmo.com/v2/whatsapp-manager/wabas/${wabaID}/templates?status=APPROVED`,
      headers: {
        Authorization: `Basic ${Base64.encode(token)}`,
      },
    };

    await axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        console.log("/✅ Successfully got list");
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

// app.get("/watext", async (req, res) => {
//   console.log("/✅ watext");
//   try {
//     const session = neru.createSession();
//     const messages = new Messages(session);

//     await messages
//       .send({
//         to: TO_NUMBER,
//         from: WHATSAPP_NUMBER,
//         channel: "whatsapp",
//         message_type: "text",
//         text: "Hi",
//       })
//       .execute();
//     res.sendStatus(201);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get("/watemplate", async (req, res) => {
//   console.log("/✅ watemplate");
//   try {
//     const session = neru.createSession();
//     const messages = new Messages(session);

//     await messages
//       .send({
//         to: TO_NUMBER,
//         from: WHATSAPP_NUMBER,
//         channel: "whatsapp",
//         whatsapp: {
//           policy: "deterministic",
//           locale: "en_US",
//         },
//         message_type: "template",
//         template: {
//           name: "kitt_vcr_wa_one",
//           parameters: ["{Name}"],
//         },
//         client_ref: "string",
//       })
//       .execute();
//     res.sendStatus(201);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

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

// v01
// /✅ onMessage {
//   message_uuid: '383e42b6-ac75-4c85-a490-439701716015',
//   to: { type: 'whatsapp', number: '12015542422' },
//   from: { type: 'whatsapp', number: '15754947093' },
//   timestamp: '2023-02-23T19:03:57.237Z',
//   message: { content: { type: 'text', text: 'Hello' } },
//   direction: 'inbound'
// }

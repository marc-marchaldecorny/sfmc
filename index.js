import { vcr, Messages, Queue } from "@vonage/vcr-sdk";
import express from "express";
import errorhandler from "errorhandler";
import { index } from "./routes/index.js";
import {
  save,
  validate,
  publish,
  execute,
  stop,
  sms,
  deadLetterList,
  deleteQueue,
} from "./routes/activity.js";
import path from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
const app = express();

app.use(express.json());
app.use(errorhandler());

// Allows config.json file creation using fs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.VCR_PORT;
const VONAGE_NUMBER = process.env.VONAGE_NUMBER;

// Pass SFMC_APP_EXT_KEY and URL to config.json
const SFMC_APP_EXT_KEY = process.env.SFMC_APP_EXT_KEY;
const URL =
  "https://" + process.env.INSTANCE_SERVICE_NAME + ".euw1.runtime.vonage.cloud";

// *********************************
// Inbound SMS Messages Listner
const session = vcr.createSession();
const messaging = new Messages(session);

// *********************************
if (process.env.DEBUG == "true") {
  console.log("🚀 Debug");
  // console.log('🚀 VCR_API_APPLICATION_ID:', process.env.VCR_API_APPLICATION_ID);
  // console.log('🚀 VCR_PRIVATE_KEY:', process.env.VCR_PRIVATE_KEY);
} else {
  console.log("🚀 Deploy");
}

app.get("/_/metrics", async (req, res) => {
  res.sendStatus(200);
});

app.get("/_/health", async (req, res) => {
  res.sendStatus(200);
});

app.get("/test", (req, res) => {
  console.log("/✅ test");
  res.send("OK");
});

// Route to pass vcr.yml environment variables to index.html
// If True, field has disabled value. If False, allow input string.
// Pass ENFORCE_SENDER_ID and VONAGE_SENDER to HTML
app.get("/api/data", (req, res) => {
  const ENFORCE_SENDER_ID = process.env.ENFORCE_SENDER_ID;
  const VONAGE_SENDER = process.env.VONAGE_SENDER;
  res.json({ ENFORCE_SENDER_ID, VONAGE_SENDER });
});

app.get("/", index);
app.post("/save/", save);
app.post("/validate/", validate);
app.post("/publish/", publish);
app.post("/sms/", sms);
app.post("/execute/", execute);
app.post("/stop/", stop);
app.post("/deadLetterList/", deadLetterList);
app.post("/deleteQueue/", deleteQueue);

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

const to = { type: "sms", number: VONAGE_NUMBER };
const from = { type: "sms", number: null };
let listeningForInbound = await messaging.onMessage("onMessage", from, to);
console.log("ℹ️ listeningForInbound:", listeningForInbound);

app.listen(port, () => {
  console.log(`VCR listening on port ${port}`);
});

const filePath = "./public/config.json";
// const filePath = "config.json";
let jsonData;
export function createFile(URL, SFMC_APP_EXT_KEY) {
  // Data to be written to the JSON file
  const data = {
    workflowApiVersion: "1.1",
    metaData: {
      icon: "images/icon.png",
      iconSmall: "images/iconSmall.png",
      category: "message",
    },
    type: "REST",
    lang: {
      "en-US": {
        name: "SMS",
        description:
          "Send Vonage Messages with Salesforce Marketing Cloud Journey Builder",
      },
    },
    arguments: {
      execute: {
        inArguments: [],
        outArguments: [],
        url: `${URL}/execute`,
      },
    },
    configurationArguments: {
      applicationExtensionKey: `${SFMC_APP_EXT_KEY}`,
      save: {
        url: `${URL}/save`,
      },
      publish: {
        url: `${URL}/publish`,
      },
      stop: {
        url: `${URL}/stop`,
      },
      validate: {
        url: `${URL}/validate`,
      },
    },
    wizardSteps: [
      {
        label: "Configuration",
        key: "step1",
      },
    ],
    userInterfaces: {
      configModal: {
        height: 900,
        width: 1200,
      },
    },
    schema: {
      arguments: {
        execute: {
          inArguments: [
            {
              textMessage: {
                dataType: "Text",
                isNullable: false,
                direction: "out",
              },
            },
          ],
          outArguments: [],
        },
      },
    },
  };
  // Check if the file already exists
  if (fs.existsSync(filePath)) {
    console.error("File already exists. Aborting operation.");
    // readFile();
  } else {
    // Convert JavaScript object to JSON string
    jsonData = JSON.stringify(data, null, 2); // The second argument (null) is for replacer function and the third argument (2) is for indentation.

    // Write data to the file
    fs.writeFile(filePath, jsonData, (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("JSON file has been created successfully!");
        // readFile();
      }
    });
  }
}

export function readFile() {
  // Read existing data from JSON file
  fs.readFile(filePath, "utf8", (err, jsonData) => {
    if (err) {
      console.error("Error reading JSON file:", err);
    } else {
      try {
        // Parse JSON data from file
        const data = JSON.parse(jsonData);

        console.log(data);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
      }
    }
  });
}

createFile(URL, SFMC_APP_EXT_KEY);

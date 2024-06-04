"use strict";
import { vcr, Messages, Queue } from "@vonage/vcr-sdk";
import { Vonage } from "@vonage/server-sdk";
import createError from "http-errors";
import util from "util";

export const logExecuteData = [];
const vonage = new Vonage({
  applicationId: process.env.API_APPLICATION_ID,
  privateKey: process.env.PRIVATE_KEY,
  appendUserAgent: "sfmc"
});
const queueName = `queue-${process.env.VCR_INSTANCE_SERVICE_NAME}`;
const queue = new Queue(vcr.getGlobalSession());

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export default function logData(req) {
  logExecuteData.push({
    body: req.body,
    headers: req.headers,
    trailers: req.trailers,
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    route: req.route,
    cookies: req.cookies,
    ip: req.ip,
    path: req.path,
    host: req.hostname,
    fresh: req.fresh,
    stale: req.stale,
    protocol: req.protocol,
    secure: req.secure,
    originalUrl: req.originalUrl,
  });
  console.log("✅ logData headers: " + util.inspect(req.headers));
  console.log("✅ logData body: " + util.inspect(req.body));
}

export function edit(req, res) {
  console.log("🚀 Edit");
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function save(req, res) {
  console.log("🚀 Save");

  logData(req);

  res.status(200).send({
    status: true,
  });
}

await createQueueIfNeeded();

async function createQueueIfNeeded() {
  let queueDetails;

  try {
    queueDetails = await queue.getQueueDetails(queueName);
    // console.log("🚀 getQueueDetails:", queueDetails);
  } catch (e) {
    console.log("No existing queue, creating...");
  }

  if (!queueDetails) {
    await queue.createQueue(queueName, "sms", {
      maxInflight: 30,
      msgPerSecond: 25,
      active: true,
    });
  } else {
    console.log("💡 queueName exists");
  }
}

export async function execute(req, res, next) {
  let securityOptionsObject = req.body.securityOptions;
  if (securityOptionsObject) {
    console.log("🚀 Execute securityOptions:", securityOptionsObject);
  } else {
    console.log("❌ Execute No securityOptions");
  }

  try {
    // DOES NOT WORK: message is not sent, but we get a sent message id.
    req.body.internalApiSecret = INTERNAL_API_SECRET;
    await queue.enqueueSingle(queueName, req.body);

    return res.status(200).send({
      status: true,
    });
  } catch (error) {
    console.log("Error /ececute:", error);
    next(error);

    return res.status(400).send({
      status: false,
    });
  }
}

export async function sms(req, res, next) {
  logData(req);
  try {
    let { internalApiSecret } = req.body;
    if (!internalApiSecret || internalApiSecret !== INTERNAL_API_SECRET) {
      console.log("not from queue");
      return res.status(200).send({ msg: "not from queue" });
    }

    console.log("🚀 sms:", req.body);
    let phone;
    let senderID;
    let textMessage;

    let inArgumentsArrayObject = req.body.inArguments;
    for (var i = 0; i < inArgumentsArrayObject.length; i++) {
      if (inArgumentsArrayObject[i].phone) {
        phone = inArgumentsArrayObject[i].phone;
      } else if (inArgumentsArrayObject[i].senderID) {
        senderID =
          process.env.VONAGE_SENDER || inArgumentsArrayObject[i].senderID;
      } else if (inArgumentsArrayObject[i].textMessage) {
        textMessage = inArgumentsArrayObject[i].textMessage;
      }
    }

    inArgumentsArrayObject.forEach((element) => {
      Object.entries(element).forEach(([key, value]) => {
        console.log(`💡 ${key}: ${value}`);

        if (textMessage) {
          textMessage = textMessage.replace(`{${key}}`, value);
        }
      });
    });

    if (!phone) {
      console.log(`❌ Missing phone: ${phone}`);
      res.status(200).send({
        status: false,
      });
    } else if (textMessage) {
      console.log("💡 senderID:", senderID);
      console.log("💡 phone:", phone);
      console.log("💡 textMessage:", textMessage);

      const from = { type: "sms", number: senderID };
      const to = { type: "sms", number: phone };

      let respMsg = await vonage.messages.send({
        client_ref: req.body.journeyId,
        text: textMessage,
        messageType: "text",
        to: to.number,
        from: from.number,
        channel: "sms",
                
      });

      console.log("✅ Sent message:", respMsg);
      return res.status(200).send({
        status: true,
      });
    }
  } catch (error) {
    console.log("Error sms in Activity: ", error);
    return res.status(400).send({
      status: false,
    });
  }
}

export function publish(req, res) {
  console.log("🚀 Publish:", req.body);
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function validate(req, res) {
  console.log("🚀 Validate:", req.body);
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function stop(req, res) {
  console.log("🚀 Stop");

  logData(req);
  res.status(200).send({
    status: true,
  });
}

// Listing Failed Tasks
export async function deadLetterList(req, res) {
  let { name } = req.query;
  const failedTasks = await queue.deadLetterList(name);
  console.log("🚀 deadLetterList:", failedTasks);
  logData(req);
  res.status(200).send({
    status: true,
  });
}

// Delete a Queue
export async function deleteQueue(req, res) {
  let { name } = req.query;
  const deleteTask = await queue.deleteQueue(name);
  console.log("🚀 deleteQueue:", deleteTask);
  logData(req);
  res.status(200).send({
    status: true,
  });
}

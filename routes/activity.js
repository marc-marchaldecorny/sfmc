"use strict";
import { neru, Messages, Scheduler, State, Voice } from "neru-alpha";
import util from "util";
import axios from "axios";
import FormData from "form-data";
import {
  getAllTemplates,
  getPageId,
  getTemplateInfo,
  getTemplateId,
  replaceObject,
  sendMessage,
} from "./api.js";

export const logExecuteData = [];

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
  console.log("✅ logData body: " + util.inspect(req.body));

  console.log("logData req.body.keyValue: " + req.body.keyValue);
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

export async function execute(req, res) {
  console.log("🚀 Execute:", req.body);
  let phone;
  let senderID;
  let inboundAi;
  // SMS
  let textMessage;
  // MMS
  let imageUrl;
  let imageCaption;
  // WHATSAPP
  let templateName;
  let templateText;
  let templateLanguage;
  let templatePlaceholders;
  let inArgumentsArrayObject = req.body.inArguments;

  for (var i = 0; i < inArgumentsArrayObject.length; i++) {
    if (inArgumentsArrayObject[i].phone) {
      phone = inArgumentsArrayObject[i].phone;
    } else if (inArgumentsArrayObject[i].senderID) {
      senderID = inArgumentsArrayObject[i].senderID;
    } else if (inArgumentsArrayObject[i].inboundAi) {
      inboundAi = inArgumentsArrayObject[i].inboundAi;
    } else if (inArgumentsArrayObject[i].textMessage) {
      textMessage = inArgumentsArrayObject[i].textMessage;
    } else if (inArgumentsArrayObject[i].imageUrl) {
      imageUrl = inArgumentsArrayObject[i].imageUrl;
    } else if (inArgumentsArrayObject[i].imageCaption) {
      imageCaption = inArgumentsArrayObject[i].imageCaption;
    } else if (inArgumentsArrayObject[i].templateText) {
      templateText = inArgumentsArrayObject[i].templateText;
    } else if (inArgumentsArrayObject[i].templateLanguage) {
      templateLanguage = inArgumentsArrayObject[i].templateLanguage;
    } else if (inArgumentsArrayObject[i].templateName) {
      templateName = inArgumentsArrayObject[i].templateName;
    } else if (inArgumentsArrayObject[i].templatePlaceholders) {
      templatePlaceholders = inArgumentsArrayObject[i].templatePlaceholders;
    }
  }

  // OVERWRITE PLACEHOLDERS
  let templatePlaceholderArray = [];
  inArgumentsArrayObject.forEach((element) => {
    Object.entries(element).forEach(([key, value]) => {
      console.log(`💡 ${key}: ${value}`);

      if (textMessage) {
        textMessage = textMessage.replace(`{${key}}`, value);
      }

      if (imageCaption) {
        imageCaption = imageCaption.replace(`{${key}}`, value);
      }

      // IF USER ENTERED DE KEY eg. {Name}, THEN REPLACE KEY:VALUE ADD TO PARAM ARRAY
      if (templatePlaceholders.includes(`{${key}}`)) {
        console.log("🟡 Matched:", key); // Matched: Name
        // REPLACE WITH DE VALUES
        templatePlaceholders = templatePlaceholders.replace(`{${key}}`, value);
        // ADD TO PARAMS ARRAY
        templatePlaceholderArray.push(value);
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
    const session = neru.createSession();
    const messaging = new Messages(session);
    const from = { type: "sms", number: senderID };
    const to = { type: "sms", number: phone };
    const msg = textMessage;
    let respMsg = await messaging.sendText(from, to, msg).execute();
    console.log("✅ Success sending message:", respMsg);
    res.status(200).send({
      status: true,
    });
  } else if (imageUrl) {
    console.log("💡 senderID:", senderID);
    console.log("💡 phone:", phone);
    console.log("💡 imageUrl:", imageUrl);
    console.log("💡 imageCaption:", imageCaption);
    const session = neru.createSession();
    const messaging = new Messages(session);
    const from = { type: "mms", number: senderID };
    const to = { type: "mms", number: phone };

    const imageContent = {
      type: "image",
      image: {
        url: imageUrl,
        caption: imageCaption,
      },
    };
    try {
      let respMsg = await messaging.sendImage(from, to, imageContent).execute();
      console.log("✅ Success sending message:", respMsg);
      res.status(200).send({
        status: true,
      });
    } catch (error) {
      console.log("Error trying to send message:", error);
      res.status(200).send({
        status: false,
      });
    }
  } else if (templateName) {
    console.log("💡 senderID:", senderID);
    console.log("💡 phone:", phone);
    console.log("💡 templateName:", templateName);
    console.log("💡 templateLanguage:", templateLanguage);
    // console.log('💡 templateText:', templateText); // Hi , how are you?
    console.log("💡 templatePlaceholders:", templatePlaceholders); // Kitt Phi
    console.log("💡 templatePlaceholderArray:", templatePlaceholderArray); // [ 'Kitt Phi' ]

    try {
      // NEED TO DO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      let allTemplates = await getAllTemplates();
      let pageId = await getPageId();
      let id = await getTemplateId("sfmcdemo3bot");
      // console.log(id);
      let templateInfo = await getTemplateInfo(id); // 5687849797812224
      // console.log(templateInfo);
      let messageParams = await replaceObject(templateInfo, "Kitt");
      // console.log(messageParams);
      let msgResp = await sendMessage(
        pageId,
        "15754947093",
        "whatsapp",
        id,
        messageParams
      );
      console.log(msgResp);
      res.status(200).send({
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.status(200).send({
        status: false,
      });
    }
  } else {
    console.log("Error Execute in Activity");
    res.status(200).send({
      status: false,
    });
  }

  logData(req);
}

export function publish(req, res) {
  console.log("🚀 Publish");
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function validate(req, res) {
  console.log("🚀 Validate");
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

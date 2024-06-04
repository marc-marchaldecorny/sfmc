"use strict";
import { neru, Messages, Scheduler, State, Voice } from "neru-alpha";
import util from "util";

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
  let phone; // TO_NUMBER
  let senderID; // FROM
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

  if (!phone || !templateText) {
    console.log("❌ Missing required params\n");
    console.log("💡 phone:", phone);
    console.log("💡 senderID:", senderID);
    console.log("💡 templateName:", templateName);
    console.log("💡 templateLanguage:", templateLanguage);
    console.log("💡 templateText:", templateText);
    console.log("💡 templatePlaceholders:", templatePlaceholders);
    res.status(200).send("Missing param!");
  } else {
    console.log("💡 phone:", phone);
    console.log("💡 senderID:", senderID);
    console.log("💡 templateName:", templateName);
    console.log("💡 templateLanguage:", templateLanguage);
    // console.log('💡 templateText:', templateText); // Hi , how are you?
    console.log("💡 templatePlaceholders:", templatePlaceholders); // Kitt Phi
    console.log("💡 templatePlaceholderArray:", templatePlaceholderArray); // [ 'Kitt Phi' ]

    const session = neru.createSession();
    const messages = new Messages(session);

    try {
      let respMsg = await messages
        .send({
          to: phone,
          from: senderID,
          channel: "whatsapp",
          whatsapp: {
            policy: "deterministic",
            locale: templateLanguage,
          },
          message_type: "template",
          template: {
            name: templateName,
            parameters: templatePlaceholderArray,
          },
        })
        .execute();
      console.log("✅ Success sending message:", respMsg);
      res.sendStatus(200);
    } catch (error) {
      console.log("Error trying to send message:", error);
      res.sendStatus(400);
    }
  }

  logData(req);
}
export async function executeNeruMessaging(req, res) {
  console.log("🚀 Execute:", req.body);
  let phone; // TO_NUMBER
  let senderID; // FROM
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

  if (!phone || !templateText) {
    console.log("❌ Missing required params\n");
    console.log("💡 phone:", phone);
    console.log("💡 senderID:", senderID);
    console.log("💡 templateName:", templateName);
    console.log("💡 templateLanguage:", templateLanguage);
    console.log("💡 templateText:", templateText);
    console.log("💡 templatePlaceholders:", templatePlaceholders);
    res.status(200).send("Missing param!");
  } else {
    console.log("💡 phone:", phone);
    console.log("💡 senderID:", senderID);
    console.log("💡 templateName:", templateName);
    console.log("💡 templateLanguage:", templateLanguage);
    // console.log('💡 templateText:', templateText); // Hi , how are you?
    console.log("💡 templatePlaceholders:", templatePlaceholders); // Kitt Phi
    console.log("💡 templatePlaceholderArray:", templatePlaceholderArray); // [ 'Kitt Phi' ]

    const session = neru.createSession();
    const messages = new Messages(session);

    try {
      let respMsg = await messages
        .send({
          to: phone,
          from: senderID,
          channel: "whatsapp",
          whatsapp: {
            policy: "deterministic",
            locale: templateLanguage,
          },
          message_type: "template",
          template: {
            name: templateName,
            parameters: templatePlaceholderArray,
          },
        })
        .execute();
      console.log("✅ Success sending message:", respMsg);
      res.sendStatus(200);
    } catch (error) {
      console.log("Error trying to send message:", error);
      res.sendStatus(400);
    }
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

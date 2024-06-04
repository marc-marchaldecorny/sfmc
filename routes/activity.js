'use strict';
import { neru, Messages, Scheduler, State, Voice } from 'neru-alpha';
import util from 'util';

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
  console.log('✅ logData body: ' + util.inspect(req.body));

  console.log('logData req.body.keyValue: ' + req.body.keyValue);
}

export function edit(req, res) {
  console.log('🚀 Edit');
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function save(req, res) {
  console.log('🚀 Save');

  logData(req);

  res.status(200).send({
    status: true,
  });
}

export async function execute(req, res) {
  console.log('🚀 Execute:', req.body);
  let phone; // TO_NUMBER
  let senderID; // FROM
  let channel = 'mms';
  let imageUrl;
  let imageCaption;
  let inArgumentsArrayObject = req.body.inArguments;

  for (var i = 0; i < inArgumentsArrayObject.length; i++) {
    if (inArgumentsArrayObject[i].phone) {
      phone = inArgumentsArrayObject[i].phone;
    } else if (inArgumentsArrayObject[i].imageUrl) {
      imageUrl = inArgumentsArrayObject[i].imageUrl;
    } else if (inArgumentsArrayObject[i].imageCaption) {
      imageCaption = inArgumentsArrayObject[i].imageCaption;
    } else if (inArgumentsArrayObject[i].senderID) {
      senderID = inArgumentsArrayObject[i].senderID;
    }
  }

  // OVERWRITE PLACEHOLDERS
  inArgumentsArrayObject.forEach((element) => {
    Object.entries(element).forEach(([key, value]) => {
      // console.log(`${key}: ${value}`);
      imageCaption = imageCaption.replace(`{${key}}`, value);
    });
  });

  if (!phone) {
    console.log('❌ Missing required params\n');
    console.log('ℹ️ phone:', phone);
    console.log('ℹ️ channel:', channel);
    console.log('ℹ️ senderID:', senderID);
    console.log('ℹ️ imageUrl:', imageUrl);
    console.log('ℹ️ imageCaption:', imageCaption);
    res.status(200).send('no phone');
  } else {
    console.log('ℹ️ phone:', phone);
    console.log('ℹ️ channel:', channel);
    console.log('ℹ️ senderID:', senderID);
    console.log('ℹ️ imageUrl:', imageUrl);
    console.log('ℹ️ imageCaption:', imageCaption);

    const session = neru.createSession();
    const messaging = new Messages(session);

    console.log('✅ mms');

    const from = { type: 'mms', number: senderID };
    const to = { type: 'mms', number: phone };

    const imageContent = {
      type: 'image',
      image: {
        url: imageUrl,
        caption: imageCaption,
      },
    };
    try {
      let respMsg = await messaging.sendImage(from, to, imageContent).execute();
      console.log('✅ Success sending message:', respMsg);
    } catch (error) {
      console.log('Error trying to send message:', error);
      res.sendStatus(400);
    }
  }

  logData(req);
}

export function publish(req, res) {
  console.log('🚀 Publish');
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function validate(req, res) {
  console.log('🚀 Validate');
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function stop(req, res) {
  console.log('🚀 Stop');

  logData(req);
  res.status(200).send({
    status: true,
  });
}

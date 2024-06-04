import { neru, Messages, Scheduler, State, Voice } from 'neru-alpha';
import express from 'express';
import errorhandler from 'errorhandler';
import { index } from '../routes/index.js';
import { save, validate, publish, execute, stop } from '../routes/activity.js';
import axios from 'axios';

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(errorhandler());

const port = process.env.NERU_APP_PORT;
const URL =
  process.env.ENDPOINT_URL_SCHEME + '/' + process.env.INSTANCE_SERVICE_NAME;
const TO_NUMBER = process.env.TO_NUMBER;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;

if (process.env.DEBUG == 'true') {
  console.log('🚀 DEBUG:', URL);
} else {
  console.log('🚀 DEPLOY URL:', URL);
  if (!WHATSAPP_NUMBER || !TO_NUMBER) {
    console.log('ℹ️ WHATSAPP_NUMBER:', WHATSAPP_NUMBER);
    console.log('ℹ️ TO_NUMBER:', TO_NUMBER);
  }
}

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

app.get('/test', async (req, res) => {
  res.sendStatus(200);
});

app.get('/getWATemplateList', async (req, res) => {
  console.log('/✅ getWATemplateList:', req.body);
  let body = 'this body';
  res.status(200).send({ getWATemplateList: body });
});

app.post('/getWATemplateList', async (req, res) => {
  console.log('/✅ getWATemplateList:', req.body);

  try {
    let body = await req.body;
    let wabaID = '432448094105434';
    let apiKey = '4f2ff535';
    let apiSecret = 'jtYzPbh3MXr8M1Hr';
    var TOKEN = `${apiKey}:${apiSecret}`;
    res.status(200).send({ msg: 'hello back' });
  } catch (error) {
    res.status(400).send(error);
  }

  //   var config = {
  //     method: 'get',
  //     url: `https://api.nexmo.com/v2/whatsapp-manager/wabas/${wabaID}/templates`,
  //     headers: {
  //       Authorization: `Basic ${base64.encode(`${TOKEN}`)}`,
  //     },
  //   };

  //   await axios(config)
  //     .then((response) => {
  //       console.log(
  //         '🟢 Axios - getWATemplateList:',
  //         JSON.stringify(response.data)
  //       );

  //       res.status(200).send(response.data);
  //     })
  //     .catch((error) => {
  //       console.log('🔴 Axios - getWATemplateList:', error);

  //       if (!error.data) {
  //         res.status(403).send(error);
  //       } else {
  //         res.status(403).send(error.data);
  //       }
  //     });
  // } catch (error) {
  //   res.status(400).send({ getWATemplateList: error });
  // }
});

app.get('/watext', async (req, res) => {
  console.log('/✅ watext');
  try {
    const session = neru.createSession();
    const messages = new Messages(session);

    await messages
      .send({
        to: TO_NUMBER,
        from: WHATSAPP_NUMBER,
        channel: 'whatsapp',
        message_type: 'text',
        text: 'Hi',
      })
      .execute();
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/watemplate', async (req, res) => {
  console.log('/✅ watemplate');
  try {
    const session = neru.createSession();
    const messages = new Messages(session);

    await messages
      .send({
        to: TO_NUMBER,
        from: WHATSAPP_NUMBER,
        channel: 'whatsapp',
        whatsapp: {
          policy: 'deterministic',
          locale: 'en_US',
        },
        message_type: 'template',
        template: {
          name: 'kitt_vcr_wa_one',
          parameters: ['{Name}'],
        },
        client_ref: 'string',
      })
      .execute();
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', index);
app.post('/save/', save);
app.post('/validate/', validate);
app.post('/publish/', publish);
app.post('/execute/', execute);
app.post('/stop/', stop);

// WORKS WITH V01
app.post('/onMessage', async (req, res, next) => {
  try {
    console.log('/✅ onMessage', req.body);
    res.sendStatus(200);
  } catch (error) {
    console.log('❌ /onMessage error:', error);
    res.status(500).json({ error: error.message });
    next(error);
  }
});

const session = neru.createSession();
const messaging = new Messages(session);

const to = { type: 'whatsapp', number: WHATSAPP_NUMBER };
const from = { type: 'whatsapp', number: null };

// v0.1 - causes error: "error subscribing to event"
// let inboundMsg = await messaging
// .listenMessages('onMessage', from, to)
// .execute();
// console.log('✅ inboundMsg:', inboundMsg);

// v1 - still works for v0.1
let listeningForInbound = await messaging
  .onMessage('onMessage', from, to)
  .execute();
console.log('ℹ️ listeningForInbound:', listeningForInbound);

app.listen(port, () => {
  console.log(`Neru listening on port ${port}`);
});

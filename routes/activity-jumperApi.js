'use strict';
import { neru, Messages, Scheduler, State, Voice } from 'neru-alpha';
import util from 'util';
import axios from 'axios';
import FormData from 'form-data';

console.log('TOKEN', process.env.TOKEN)

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

      // TypeError: Cannot read properties of undefined (reading 'includes')

      // IF USER ENTERED DE KEY eg. {Name}, THEN REPLACE KEY:VALUE ADD TO PARAM ARRAY
      if (templatePlaceholders.includes(`{${key}}`)) {
        console.log('🟡 Matched:', key); // Matched: Name
        // REPLACE WITH DE VALUES
        templatePlaceholders = templatePlaceholders.replace(`{${key}}`, value);
        // ADD TO PARAMS ARRAY
        templatePlaceholderArray.push(value);
      }
    });
  });

  if (!phone || !templateText) {
    console.log('❌ Missing required params\n');
    console.log('💡 phone:', phone);
    console.log('💡 senderID:', senderID);
    console.log('💡 templateName:', templateName);
    console.log('💡 templateLanguage:', templateLanguage);
    console.log('💡 templateText:', templateText);
    console.log('💡 templatePlaceholders:', templatePlaceholders);
    res.status(200).send('Missing param!');
  } else {
    console.log('💡 phone:', phone);
    console.log('💡 senderID:', senderID);
    console.log('💡 templateName:', templateName);
    console.log('💡 templateLanguage:', templateLanguage);
    // console.log('💡 templateText:', templateText); // Hi , how are you?
    console.log('💡 templatePlaceholders:', templatePlaceholders); // Kitt Phi
    console.log('💡 templatePlaceholderArray:', templatePlaceholderArray); // [ 'Kitt Phi' ]

    const session = neru.createSession();
    const messages = new Messages(session);

    // 4. HELPER TO BUILD MESSAGE_PARAMS BODY WHEN SENDING MESSAGE
    let templateInfo;
    const setMessageParams = () => {
      // GET BODY OBJECT FROM MESSAGE_PARAMS
      let body = templateInfo.data.message_params.BODY[0]
      // console.log(result) // { BODY: [ { '<custom_field_Name>': 'text' } ] }
      body[`KITT`] = body['<custom_field_Name>']
      delete body['<custom_field_Name>']
      body = templateInfo.data.message_params
      // console.log(body) // { BODY: [ { KITT: 'text' } ] }
      
      // REMOVE THE BODY OBJECT FROM MESSAGE
      delete templateInfo.data.message['BODY']
      // console.log(templateInfo.data.message)
      // {
        // BUTTONS: [ { text: 'One Plus', type: 'QUICK_REPLY', payload: '#one' } ]
      // }
      
      // COMPOSE NEW MESSAGE_PARAMS
      // let newBody = body + ',' + templateInfo.data.message // object object
      let newBody = JSON.stringify(body) + ',' + JSON.stringify(templateInfo.data.message);
      // console.log(newBody)
    
      return newBody
    }

    // 3. GET TEMPLATE INFO USING ID
    const getTemplateInfo = async (id) => {
      try {
        // let id = '5687849797812224'
        var config = {
          method: 'get',
        maxBodyLength: Infinity,
          url: `https://api.jumper.ai/chat/get-whatsapp-template?id=${id}\n`,
          headers: { }
        };
        
        axios(config)
        .then(function (response) {
          console.log('templateInfo:', JSON.stringify(response.data));
          templateInfo = JSON.stringify(response.data)
        })
        .catch(function (error) {
          console.log('ERROR:',error);
        });
        
      } catch (error) {
        console.log('getTemplateInfo error:', error)
      }
    }

    // 2. GET TEMPLATE ID USING TEMPLATE NAME
    let tempList;
    const getTemplateId = async () => {
      try {
        console.log('getTemplateId');
        // let tempName =  'sfmcdemo3bot';
      tempList.data.forEach((obj) => {
        if (templateName == obj.template_name) {
          let id = obj.templates[0].id
          console.log('ID:', id)
          return id;
        }
      })
      } catch (error) {
        console.error('getTemplateId:', error);
      }
    };

    // 1. FETCH ALL TEMPLATES
    const fetchTemplates = async () => {
      try {
        console.log('fetchTemplates');
        var config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: 'https://api.jumper.ai/chat/fetch-whatsapp-templates?limit=all',
          headers: {
            Authorization:
              `Bearer ${process.env.TOKEN}`,
          },
        };

        axios(config)
          .then(function (response) {
            console.log(
              '✅ Success fetchTemplates:',
              JSON.stringify(response.data)
            );
            tempList = response.data;
          })
          .catch(function (error) {
            console.log('❌ Failed fetchTemplates:', error);
          });
      } catch (error) {
        console.error('Inside fetchTemplates:', error);
      }
    };

    // 0. GET SOCIAL CHANNEL
    let pageId;
    const getPageId = () => {
      try {
        var config = {
          method: 'get',
        maxBodyLength: Infinity,
          url: 'https://api.jumper.ai/chat/get-social-channels',
          headers: { }
        };
        
        axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          pageId = response.data.whatsapp.id;
          return pageId;
        })
        .catch(function (error) {
          console.log('error social channel:',error);
        });
        
      } catch (error) {
        console.log('getPageId ERROR', error)        
      }
    }

    try {
      var data = new FormData();
      data.append('pageid', await getPageId()); // 4764434781962240
      data.append('conversationid', `${phone}`); // DE Phone field values
      data.append('channel', 'whatsapp');
      data.append('message', `s3ndt3mpl4te_${await getTemplateId()}`); // s3ndt3mpl4te_5687849797812224
      data.append('messagetype', 'template');
      data.append(
        'message_params',
        `{"BODY":[{${templatePlaceholders}:"text"}],"BUTTONS":[{"type":"button","sub_type":"quick_reply","index":0,"parameters":[{"type":"payload","payload":"#one"}]}]}`
      );

      console.log('✅ Success sending message');
      res.sendStatus(200);
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

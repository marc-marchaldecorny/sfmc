import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";
dotenv.config();
const TOKEN = process.env.TOKEN;

export async function getAllTemplates() {
  try {
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.jumper.ai/chat/fetch-whatsapp-templates?limit=all",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    };

    return await axios(config)
      .then(function (response) {
        // console.log("✅ Success fetchTemplates");
        return response.data.data;
      })
      .catch(function (error) {
        console.log("❌ Failed fetchTemplates:", error);
      });
  } catch (error) {
    console.error("Error at fetchTemplates:", error);
  }
}

export async function getPageId() {
  try {
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.jumper.ai/chat/get-social-channels",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    };

    return await axios(config)
      .then(function (response) {
        // console.log("✅ Success getPageId", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.log("❌ Failed getPageId:", error);
      });
  } catch (error) {
    console.error("Error at getPageId:", error);
  }
}

export async function getTemplateInfo(id) {
  try {
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.jumper.ai/chat/get-whatsapp-template?id=${id}\n`,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    };

    return await axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log("getTemplateInfo error:", error);
  }
}

export async function getTemplateId(name) {
  try {
    let id;
    let allTemplates = await getAllTemplates();
    allTemplates.forEach((obj) => {
      if (obj.template_name === name) {
        // console.log(obj);
        // console.log(obj.templates[0].id);
        id = obj.templates[0].id;
      }
    });
    // WORKS. RETURN MUST BE OUTSIDE array function
    return id;
  } catch (error) {
    console.log(error);
  }
}

// IF TYPE, REPLACE
export async function replaceObject(template, name) {
  try {
    let leftBody, rightBody;
    // GET BODY
    if (template.data.message_params) {
      // console.log(template.data.message_params); // { BODY: [ { '<custom_field_Name>': 'text' } ] }
      // REPLACE WITH NAME
      template.data.message_params.BODY[0][`${name}`] =
        template.data.message_params.BODY[0]["<custom_field_Name>"];
      delete template.data.message_params.BODY[0]["<custom_field_Name>"];
      // RETURN PAYLOAD
      leftBody = template.data.message_params;
    }

    // GET TYPES: BUTTONS
    if (template.data.message) {
      delete template.data.message.BODY;
      // console.log(template.data.message);
      // { BUTTONS: [ { text: 'One Plus', type: 'QUICK_REPLY', payload: '#one' } ] }

      // HANDLE TYPES
      if (template.data.message.BUTTONS) {
        // SAVE VALUES
        let btnCnt = template.data.message.BUTTONS.length;
        let text = [];
        let payload = [];
        let typeObject = [];

        template.data.message.BUTTONS.forEach((obj) => {
          text.push(obj.text);
          payload.push(obj.payload);
        });

        for (let i = 0; i < btnCnt; i++) {
          typeObject.push({
            BUTTONS: [
              {
                type: "button",
                sub_type: "quick_reply",
                index: `${i}`,
                parameters: [{ type: "payload", payload: `${payload[i]}` }],
              },
            ],
          });
        }

        rightBody = typeObject;
      }
    }
    let messageParams = JSON.stringify(leftBody) + JSON.stringify(rightBody[0]);
    return messageParams.replace("}{", ",");
  } catch (error) {
    console.log(error);
  }
}

export async function sendMessage(
  pageId,
  toNumber,
  channel,
  id,
  messageParams
) {
  try {
    var data = new FormData();
    data.append("pageid", pageId); // 4764434781962240
    data.append("conversationid", toNumber); // 15754947093
    data.append("channel", channel); // whatsapp
    data.append("message", `s3ndt3mpl4te_${id}`); // s3ndt3mpl4te_5687849797812224
    data.append("messagetype", "template");
    data.append("message_params", messageParams);

    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.jumper.ai/chat/send-message",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        ...data.getHeaders(),
      },
      data: data,
    };

    return await axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
}

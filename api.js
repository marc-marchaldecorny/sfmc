import util from "util";
import axios from "axios";
import FormData from "form-data";

const TOKEN = process.env.TOKEN;
console.info("🚀 TOKEN", TOKEN);
let phone = "15754947093"; // TO_NUMBER
let senderID; // FROM
let templateName = "sfmcdemo3bot";
let templateText = "Hi, how are you?";
let templateLanguage = "en";
let templatePlaceholders = "Kitt Phi";
let templatePlaceholderArray = ["Kitt Phi"];

// 1. FETCH ALL TEMPLATES
export const testApi = (req, res) => {
  try {
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.jumper.ai/chat/fetch-whatsapp-templates?limit=all",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    };

    axios(config)
      .then(function (response) {
        // console.log("✅ Success fetchTemplates:", response.data);
        getTemplateId(response.data);
        res.send(response.data);
      })
      .catch(function (error) {
        console.log("❌ Failed fetchTemplates:", error);
      });
  } catch (error) {
    console.error("Error at fetchTemplates:", error);
    console.log("hi");
  }
};

// 2. GET TEMPLATE ID USING TEMPLATE NAME
const getTemplateId = async (tempList) => {
  try {
    tempList.data.forEach((obj) => {
      if (templateName == obj.template_name) {
        let id = obj.templates[0].id;
        getTemplateInfo(id);
      }
    });
  } catch (error) {
    console.error("getTemplateId:", error);
  }
};

var templateInfo;
// 3. GET TEMPLATE INFO USING ID
const getTemplateInfo = async (id) => {
  try {
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.jumper.ai/chat/get-whatsapp-template?id=${id}\n`,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    };

    await axios(config)
      .then(function (response) {
        templateInfo = response.data;
        // console.log("✅ Success templateInfo:", templateInfo);
        let newBody = setMessageParams(templateInfo);
        // console.log("newBody:", newBody);
        let resp = sendMessage(id, newBody);
      })
      .catch(function (error) {
        console.log("ERROR:", error);
      });
  } catch (error) {
    console.log("getTemplateInfo error:", error);
  }
};

const setMessageParams = (tempInfo) => {
  let leftBody = tempInfo.data.message_params;
  // console.log(leftBody); // { BODY: [ { '<custom_field_Name>': 'text' } ] }

  // RENAME TO: { 'Kitt Phi': 'text' }
  leftBody.BODY[0][`${templatePlaceholders}`] =
    leftBody.BODY[0]["<custom_field_Name>"];
  // DELETE PROPERTY
  delete leftBody.BODY[0]["<custom_field_Name>"];
  // console.log(leftBody);

  let rightBody = templateInfo.data.message;
  // REMOVE THE BODY OBJECT FROM MESSAGE
  delete rightBody["BODY"];
  // REMOVE 1ST CHAR FROM RIGHT BODY
  let newBody =
    JSON.stringify(leftBody).replace("]}", "],") +
    JSON.stringify(rightBody).slice(1);
  // console.log(newBody);
  // console.log(JSON.parse(newBody));
  return newBody;
};

const sendMessage = (id, newBody) => {
  try {
    console.log("✅ pageId:", pageId); // 4764434781962240
    console.log("✅ id:", id);
    console.log("✅ phone:", phone);
    console.log("✅ newBody:", newBody);
    var data = new FormData();
    data.append("pageid", pageId);
    data.append("conversationid", `${phone}`);
    data.append("channel", "whatsapp");
    data.append("message", `s3ndt3mpl4te_${id}`);
    data.append("messagetype", "template");
    data.append("message_params", `${newBody}`);

    //   var config = {
    //     method: "post",
    //     maxBodyLength: Infinity,
    //     url: "https://api.jumper.ai/chat/send-message",
    //     headers: {
    //       Authorization: `Bearer ${TOKEN}`,
    //       ...data.getHeaders(),
    //     },
    //     data: data,
    //   };

    //   axios(config)
    //     .then(function (response) {
    //       console.log("sendMessage:", response.data);
    //     })
    //     .catch(function (error) {
    //       console.log("Error:", error);
    //     });
  } catch (error) {
    console.log("Error:", error);
  }
};

// 0. GET SOCIAL CHANNEL
let pageId;
const getPageId = () => {
  try {
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.jumper.ai/chat/get-social-channels",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    };

    axios(config)
      .then(function (response) {
        pageId = response.data.whatsapp.id;
        return pageId;
      })
      .catch(function (error) {
        console.log("error social channel:", error);
      });
  } catch (error) {
    console.log("getPageId ERROR", error);
  }
};

getPageId();

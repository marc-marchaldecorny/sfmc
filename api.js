import util from "util";
import axios from "axios";
import FormData from "form-data";

const TOKEN = process.env.TOKEN;
let phone = "15754947093"; // TO_NUMBER
let senderID; // FROM
let templateName = "sfmcdemo3bot"; // TO TEST API
let templateText = "Hi, how are you?";
let templateLanguage = "en";
let templatePlaceholders = "Kitt Phi";
let templatePlaceholderArray = ["Kitt Phi"];

// 1. FETCH ALL TEMPLATES
export const testJumperApi = (req, res) => {
  try {
    if (!TOKEN) {
      console.info("🚀 Missing Jumper API TOKEN:", TOKEN);
      res.status(400).end();
    } else {
      var config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://api.jumper.ai/chat/fetch-whatsapp-templates?limit=400",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      };

      axios(config)
        .then(function (response) {
          let allTemplates = response.data;
          console.log("✅ Success GET allTemplates");
          getTemplateId(req, res, allTemplates, templateName);
          // res.send(allTemplates);
        })
        .catch(function (error) {
          console.log("❌ Failed fetchAllTemplates:", error);
        });
    }
  } catch (error) {
    console.error("Error at fetchAllTemplates:", error);
  }
};

// 2. GET TEMPLATE ID USING TEMPLATE NAME
const getTemplateId = async (req, res, tempList, templateName) => {
  try {
    tempList.data.forEach((obj) => {
      if (templateName == obj.template_name) {
        let templateId = obj.templates[0].id;
        getTemplateInfo(req, res, templateId);
      }
    });
  } catch (error) {
    console.error("getTemplateId:", error);
  }
};

// 3. GET TEMPLATE INFO USING ID
const getTemplateInfo = async (req, res, templateId) => {
  try {
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.jumper.ai/chat/get-whatsapp-template?id=${templateId}\n`,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    };

    await axios(config)
      .then(function (response) {
        let templateInfo = response.data;
        console.log("✅ Success GET templateInfo");
        res.send(templateInfo);
        let newBody = setMessageParams(templateInfo);
        let resp = sendMessage(templateId, newBody);
      })
      .catch(function (error) {
        console.log("ERROR:", error);
      });
  } catch (error) {
    console.log("getTemplateInfo error:", error);
  }
};

const setMessageParams = (templateInfo) => {
  let leftBody = templateInfo.data.message_params;
  // TEXT + 1 VARIABLE
  // console.log(leftBody); // { BODY: [ { '<custom_field_Name>': 'text' } ] }
  // RENAME TO: { 'Kitt Phi': 'text' }
  leftBody.BODY[0][`${templatePlaceholders}`] =
    leftBody.BODY[0]["<custom_field_Name>"];
  // { BODY: [ { '<custom_field_Name>': 'text', 'Kitt Phi': 'text' } ] }
  let newBody = leftBody;
  // DELETE PROPERTY
  delete leftBody.BODY[0]["<custom_field_Name>"];

  // let rightBody = templateInfo.data.message;
  // REMOVE THE BODY OBJECT FROM MESSAGE
  // delete rightBody["BODY"];
  // REMOVE 1ST CHAR FROM RIGHT BODY
  // let newBody =
  // JSON.stringify(leftBody).replace("]}", "],") +
  // JSON.stringify(rightBody).slice(1);
  // console.log(newBody);
  // console.log(JSON.parse(newBody));

  // console.log(newBody);
  return newBody;
};

const sendMessage = (templateId, newBody) => {
  try {
    console.log("✅ pageId:", pageId); // 5221350016942080
    console.log("✅ templateId:", templateId);
    console.log("✅ phone:", phone);
    console.log("✅ newBody:", newBody);
    var data = new FormData();
    data.append("pageid", pageId);
    data.append("conversationid", `${phone}`);
    data.append("channel", "whatsapp");
    data.append("message", `s3ndt3mpl4te_${templateId}`);
    data.append("messagetype", "template");
    data.append("message_params", `${newBody}`);

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

    axios(config)
      .then(function (response) {
        console.log("sendMessage:", response.data);
      })
      .catch(function (error) {
        console.log("Error:", error);
      });
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

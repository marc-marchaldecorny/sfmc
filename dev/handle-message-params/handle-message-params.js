import { templateInfo } from "./templateInfo.js";

// if (templateInfo.data.message_params.BODY) {
//   console.log(true);
// } else {
//   console.log(false);
// }

// console.log("data length:" + Object.keys(templateInfo).length);
// console.log(
//   "message_params length:" +
//     Object.keys(templateInfo.data.message_params).length
// );

// CHECK IF MESSAGE_PARAMS
const checkIfMessageParams = (message_params) => {
  let msgParamsLength = Object.keys(message_params).length;
  if (msgParamsLength === 0) {
    console.log("message_params 0");
  } else if (msgParamsLength === 1) {
    console.log("message_params 1");
  } else {
    console.log("message_params other");
  }
  // console.log(templateInfo.data.message_params.BODY.length); // 1
  // console.log(Object.keys(templateInfo.data.message_params.BODY).length); // 1
};
// checkIfMessageParams(templateInfo.data.message_params);

// CHECK IF BODY
const checkIfBody = (BODY) => {
  if (BODY === undefined) {
    console.log("BODY " + undefined);
  } else if (BODY.length === 1) {
    console.log("BODY 1");
  } else {
    console.log("BODY OTHER");
  }
};
// checkIfBody(templateInfo.data.message_params.BODY);

// console.log(templateInfo.data.message_params.BODY[0]); // { '<custom_field_Name>': 'text' }
let body = templateInfo.data.message_params.BODY[0];
// let bodyStr = JSON.stringify(templateInfo.data.message_params.BODY[0]);
// console.log(bodyStr);
// let bodyPar = JSON.parse(bodyStr);
// console.log(bodyPar);

let propsToDelete = ["<custom_field_Name>"];

const removePropertiesFromObject = (object, propsToDelete) => {
  propsToDelete.forEach((property) => {
    for (const key in object) {
      if (key === property) {
        console.log("removed");
        delete object[key];
      }
    }
  });

  return object; // {}
};

// console.log(removePropertiesFromObject(body, propsToDelete));

// CHECK IF MESSAGE BUTTONS
const checkIfMessageButtons = (BUTTONS) => {
  console.log(BUTTONS);
  if (BUTTONS === undefined) {
    console.log("BUTTONS undefined");
  } else {
    console.log("BUTTONS exists");
  }
};
checkIfMessageButtons(templateInfo.data.message.BUTTONS);

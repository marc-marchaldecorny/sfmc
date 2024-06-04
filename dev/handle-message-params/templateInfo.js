export const templateInfo = {
  errorMessage: "",
  data: {
    category: "TRANSACTIONAL",
    status: "APPROVED",
    product: null,
    message_params: {
      BODY: [
        {
          "<custom_field_Name>": "text",
        },
      ],
    },
    language: "en",
    template_name: "sfmcdemo3bot",
    messageinfo: {
      wa_template_name: "sfmcdemo3bot",
      replace_params_key: [
        {
          "<custom_field_Name>": "text",
        },
      ],
      wa_id: "1253005938946123",
    },
    template_id: "1253005938946123",
    collection_id: "6541735198720000",
    message: {
      BODY: {
        text: "Hi  {{1}}   \n\nThis is SFMC Demo with Product Check out ",
        example: ["Romil Shah"],
      },
      BUTTONS: [
        {
          text: "One Plus",
          type: "QUICK_REPLY",
          payload: "#one",
        },
      ],
    },
    id: "5687849797812224",
    rejected_reason: "NONE",
  },
  success: true,
};

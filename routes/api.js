import axios from "axios";
import FormData from "form-data";
let data = new FormData();

export function sendMessage() {
  data.append("pageid", "4885823201869824");
  data.append("conversationid", "15754947093");
  data.append("channel", "whatsapp");
  data.append("message", "s3ndt3mpl4te_6483893391851520");
  data.append("messagetype", "template");
  data.append(
    "message_params",
    '{\n    "HEADER":\n    [\n        {\n            "https://jumper.ai/jump-image/ag9zfmp1bXBlci0xNDc4MDZyGAsSC0p1bXBlcmltYWdlGICA8NP5rrEJDA": "image"\n        }\n    ],\n    "BODY":\n    [\n        {\n            "Demo": "text"\n        }\n    ],\n    "BUTTONS":\n    [\n        {\n            "type": "button",\n            "sub_type": "quick_reply",\n            "index": 0,\n            "parameters":\n            [\n                {\n                    "type": "payload",\n                    "payload": "#one"\n                }\n            ]\n        },\n        {\n            "type": "button",\n            "sub_type": "quick_reply",\n            "index": 1,\n            "parameters":\n            [\n                {\n                    "type": "payload",\n                    "payload": "7@1k704um@9"\n                }\n            ]\n        }\n    ]\n}\n'
  );

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.jumper.ai/chat/send-message",
    headers: {
      Authorization:
        "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ6OHJlQ0ZZdENQWTJCTFpkOE9IQWlPVFR3QXM0IiwiYXVkIjoieGhtSnBSWHlWa2ZHYnUwSmNkRXBiblM1ODlKc2tBU0dVM3hHRTJPYWFGV1dEV2htIiwiaXNzIjoidXJuOlwvXC9hcGlnZWUtZWRnZS1KV1QtcG9saWN5LXRlc3QiLCJtZXJjaGFudF9pZCI6IjYyMjQ2Nzc0MTg2OTY3MDQiLCJleHAiOjE2OTI3ODIxODksImlhdCI6MTY4NTAwNjE4OSwianRpIjoiY2MwMmZkNjUtMTIyYi00NjFjLThkMTctMWZiNmQzMzVlZTlhIn0.afkCe8pc9PutYvnFw2Bg2mA8ec6hOtTvvSROF6VsAMSU7cwAIz9s3B1wf1HOrxGl0lNhKTZnw5ISgLKHBcML-gi0dwXhPTE6mNfTnGU0nwX8fAClQTT9lNWL_FyFBxhDLs2bDnjTvaYQVzePOiqVRZY2ussdnmDiujdwYoegqHgacRQgTkqfnZ5QGns9w_p3kmdh1I2kyzERQrGtTgAAxx9mlVB_k8EKq82AHq70NiatHRpTyo2HJ7PPWTZymWy5gHCwcs0_lrtElG5uzC9FUWTLkwCFSEhe7X0ocjfGWhqATPC8dmhUSW-87ST1w_k7oV_bh-NPtnxsk9vKwP34QQ",
      ...data.getHeaders(),
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}

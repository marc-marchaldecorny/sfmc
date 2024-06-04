import axios from "axios";
const JUMPER_API_JWT =
  process.env.JUMPER_API_JWT ||
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ6OHJlQ0ZZdENQWTJCTFpkOE9IQWlPVFR3QXM0IiwiYXVkIjoieGhtSnBSWHlWa2ZHYnUwSmNkRXBiblM1ODlKc2tBU0dVM3hHRTJPYWFGV1dEV2htIiwiaXNzIjoidXJuOlwvXC9hcGlnZWUtZWRnZS1KV1QtcG9saWN5LXRlc3QiLCJtZXJjaGFudF9pZCI6IjYyMjQ2Nzc0MTg2OTY3MDQiLCJleHAiOjE2OTI3ODIxODksImlhdCI6MTY4NTAwNjE4OSwianRpIjoiY2MwMmZkNjUtMTIyYi00NjFjLThkMTctMWZiNmQzMzVlZTlhIn0.afkCe8pc9PutYvnFw2Bg2mA8ec6hOtTvvSROF6VsAMSU7cwAIz9s3B1wf1HOrxGl0lNhKTZnw5ISgLKHBcML-gi0dwXhPTE6mNfTnGU0nwX8fAClQTT9lNWL_FyFBxhDLs2bDnjTvaYQVzePOiqVRZY2ussdnmDiujdwYoegqHgacRQgTkqfnZ5QGns9w_p3kmdh1I2kyzERQrGtTgAAxx9mlVB_k8EKq82AHq70NiatHRpTyo2HJ7PPWTZymWy5gHCwcs0_lrtElG5uzC9FUWTLkwCFSEhe7X0ocjfGWhqATPC8dmhUSW-87ST1w_k7oV_bh-NPtnxsk9vKwP34QQ";
export const getTemplates = () => {
  var config = {
    method: "get",
    url: `https://api.jumper.ai/chat/fetch-whatsapp-templates?limit=all`,
    headers: {
      Authorization: `Bearer ${JUMPER_API_JWT}`,
    },
  };
  return new Promise((res, rej) => {
    axios(config)
      .then(function (response) {
        // res(response.data.filter((e) => e.templates.status === 'APPROVED'));
        res(response.data);
      })
      .catch(function (error) {
        console.log(error);
        rej(error);
      });
  });
};

export const getTemplate = (id) => {
  if (!id) return;
  var config = {
    method: "get",
    url: `https://api.jumper.ai/chat/get-whatsapp-template?id=${id}`,
    headers: {
      Authorization: `Bearer ${JUMPER_API_JWT}`,
    },
  };
  return new Promise((res, rej) => {
    axios(config)
      .then(function (response) {
        // res(response.data.filter((e) => e.templates.status === 'APPROVED'));
        res(response.data);
      })
      .catch(function (error) {
        console.log(error);
        rej(error);
      });
  });
};

(async function testApi() {
  console.log(await getTemplates());
})();

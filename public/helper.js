import { neru, Messages, Scheduler, State, Voice } from "neru-alpha";
const ENFORCE_SENDER_ID = process.env.ENFORCE_SENDER_ID;

function enforceSenderId() {
  console.log(ENFORCE_SENDER_ID);
  document.getElementById("senderID").value = "12345";
  document.getElementById("senderID").disabled = true;
}

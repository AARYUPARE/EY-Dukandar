import { paymentActions } from "./store";
import store from "./store";


let event = {
  eventType: "",
  data: {}
}

export const backendEventHandler = (msg) => {
  event = JSON.parse(msg.body);
  console.log("Event:", event);

  if (event.eventType == "PAYMENT") {
    store.dispatch(paymentActions.startPayment());
  }
  else if (event.eventType == "ORDER") {
    console.log(event)
  }
}
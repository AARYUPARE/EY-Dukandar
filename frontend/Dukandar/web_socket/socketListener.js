import { Client } from "@stomp/stompjs";
let client = null;

export const connectWS = (eventHandler = () => {}) => {
    if (client) return client; // prevent duplicate

    client = new Client({
    brokerURL: "ws://localhost:8080/ws",
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("WS CONNECTED 🔥");

      client.subscribe("/topic/event", eventHandler);
    },

    onStompError: (frame) => {
      console.error("STOMP ERROR", frame);
    }
  });

  client.activate();
};

let orderClient = null;

export const connectStore = (storeId, eventHandler = () => {}) => {
    if (orderClient) return orderClient; // prevent duplicate

    orderClient = new Client({
    brokerURL: "ws://localhost:8080/ws",
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("WS CONNECTED 🔥");

      orderClient.subscribe("/topic/order/" + storeId, eventHandler);
    },

    onStompError: (frame) => {
      console.error("STOMP ERROR", frame);
    }
  });

  orderClient.activate();
}
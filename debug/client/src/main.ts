import {graphviz} from "d3-graphviz";
import { WebsocketMessage } from "../../messages";

window.addEventListener("DOMContentLoaded", () => {
});

const ws = new WebSocket("ws://localhost:8080");

let lastState = "";

ws.addEventListener("open", () => {
  ws.addEventListener("message", e => {
    const msg: WebsocketMessage = JSON.parse(e.data.toString());
    if (lastState != msg.dot) {
      lastState = msg.dot;
      graphviz("#container")
        .renderDot(msg.dot);
    }
  });
});

export {};

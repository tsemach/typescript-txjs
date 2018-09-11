import { Q2Component } from "./Q2.component";

let Q2 = new Q2Component();

async function run() {
  await Q2.init();
  await Q2.send();
}

run();


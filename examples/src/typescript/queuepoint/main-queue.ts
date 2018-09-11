import { Q1Component } from "./Q1.component";
import { Q2Component } from "./Q2.component";

let Q1 = new Q1Component();
let Q2 = new Q2Component();

async function run() {
  await Q1.init();
  await Q2.init();
  Q2.send();
}

run();


import { Q1Component } from "./Q1.component";
import { Q2Component } from "./Q2.component";

/**
 * Run both component on the same process.
 *
 * Before run the program run rabbitmq docker image:
 *  "docker run -d --hostname rabbitmq --name rabbitmq -p 8080:15672 -p 5671:5671 -p 5672:5672 rabbitmq:3-management"
 *
 * This create two components Q1, Q2 each has a queuepoint able to communicate with between components using
 * RabbitMQ message queue. this program run both component in process, see main-queue-1 and main queue-2 for running
 * on two different processes.
 *
 * @type {Q1Component}
 */
let Q1 = new Q1Component();
let Q2 = new Q2Component();

async function run() {
  await Q1.init();
  await Q2.init();
  await Q2.send();
}

run();


import { Container } from "inversify";

import { TxTYPES } from "./tx-injection-types";
import { TxConnector } from "./tx-connector";
import { TxConnectPoint } from "./tx-connectpoint";
import { TxConnectorRabbitMQ } from './tx-connector-rabbitmq';

const TxContainer = new Container();
TxContainer.bind<TxConnectPoint>(TxTYPES.TxConnectPoint).to(TxConnectPoint);
TxContainer.bind<TxConnector>(TxTYPES.TxConnector).to(TxConnectorRabbitMQ);

export { TxContainer };

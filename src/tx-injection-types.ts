/**
 * Define types names of invesify library.
 *
 * TxQueuePoint - use as binding to create the class TxQueuePoint.
 * TxRoutePoint - use as binding to create the class TxRoutePoint.
 * TxConnector - use as binding between the interface TxConnector and the real implement connection class (queue, express etc).
 *
 * @type {{TxQueuePoint: symbol; TxRoutePoint: symbol; TxConnector: symbol; TxServiceName: symbol; TxPointName: symbol}}
 */
const TxTYPES = {
  TxQueuePoint: Symbol.for('TxQueuePoint'),
  TxRoutePoint: Symbol.for('TxRoutePoint'),
  TxConnector: Symbol.for("TxConnector"),
  TxServiceName: Symbol.for("TxServiceName"),
  TxPointName: Symbol.for("TxPointName")
};

export { TxTYPES };

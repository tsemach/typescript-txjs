"use strict";
exports.__esModule = true;
var logging_1 = require("logging");
var logger = logging_1["default"]('C3');
var tx_singlepoint_registry_1 = require("../../src/tx-singlepoint-registry");
var tx_task_1 = require("../../src/tx-task");
var C3Component = /** @class */ (function () {
    function C3Component() {
        var _this = this;
        this.mountpoint = tx_singlepoint_registry_1.TxSinglePointRegistry.instance.create('GITHUB::GIST::C3');
        this.method = '';
        this.mountpoint.tasks().subscribe(function (task) {
            logger.info('[C3Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));
            _this.method = task['method'];
            // just send the reply to whom is 'setting' on this reply subject
            task.reply().next(new tx_task_1.TxTask({ method: 'from C3', status: 'ok' }, task['data']));
        }, function (error) {
            logger.info('[C3Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
            _this.method = error['method'];
            // just send the reply to whom is 'setting' on this reply subject
            error.reply().error(new tx_task_1.TxTask({ method: 'from C3', status: 'ERROR' }, error['data']));
        });
        this.mountpoint.undos().subscribe(function (task) {
            logger.info('[C3Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
            _this.method = task['method'];
            // just send the reply to whom is 'setting' on this reply subject
            _this.mountpoint.reply().next(new tx_task_1.TxTask({ method: 'undo from C3', status: 'ok' }, task['data']));
        });
    }
    return C3Component;
}());
exports.C3Component = C3Component;

"use strict";
exports.__esModule = true;
var logging_1 = require("logging");
var logger = logging_1["default"]('C2');
var tx_singlepoint_registry_1 = require("../../src/tx-singlepoint-registry");
var tx_task_1 = require("../../src/tx-task");
var C2Component = /** @class */ (function () {
    //task: any;
    function C2Component() {
        var _this = this;
        this.mountpoint = tx_singlepoint_registry_1.TxSinglePointRegistry.instance.create('GITHUB::GIST::C2');
        this.method = '';
        this.mountpoint.tasks().subscribe(function (task) {
            logger.info('[C2Component:task] got task = ' + JSON.stringify(task.get(), undefined, 2));
            _this.method = task['method'];
            // this.task = task;
            // just send the reply to whom is 'setting' on this reply subject
            task.reply().next(new tx_task_1.TxTask({ method: 'from C2', status: 'ok' }, task['data']));
        }, function (error) {
            logger.info('[C2Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
            _this.method = error['method'];
            // just send the reply to whom is 'setting' on this reply subject
            error.reply().error(new tx_task_1.TxTask({ method: 'from C2', status: 'ERROR' }, error['data']));
        });
        this.mountpoint.undos().subscribe(function (task) {
            logger.info('[C2Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
            _this.method = task['method'];
            // just send the reply to whom is 'setting' on this reply subject
            _this.mountpoint.reply().next(new tx_task_1.TxTask({ method: 'undo from C2', status: 'ok' }, task['data']));
        });
    }
    return C2Component;
}());
exports.C2Component = C2Component;
import createLogger from 'logging';
const logger = createLogger('TxRouteServiceExpressGet');

import * as express from 'express';
import * as URL from 'url-parse';
import axios from 'axios';

import { TxRouteApplication } from './tx-route-application';
import { TxRouteService } from './tx-route-service';
import { TxRouteServiceConfig } from './tx-route-service-config';
import { TxRouteServiceTask } from './tx-route-service-task';
import { TxRouteServiceExpress } from './tx-route-service-express';
import { TxRouteHeaders } from './tx-route-headers';
import { TxTask } from './tx-task';

export class TxRouteServiceExpressGet<H, D> extends TxRouteServiceExpress<H,D> implements TxRouteService {

  constructor(application: TxRouteApplication, config: TxRouteServiceConfig) {
    super(config)
    application.register('/' + config.service, this, config);
  }

  /**
   * this method is called by TxRouteApplication app wrapper druing TxRoutePointRegistry.instance.setApplication(app) method
   * 
   * @param config is the rooutepoint config object as user define on TxRoutePointRegistry.instance.route(..)
   */
  public add(config: TxRouteServiceConfig): express.Router {
    let router = express.Router();

    logger.info('[TxRouteServiceExpressGet::get] add is called, config.route = ', config.service + '/' + config.route);``
    router.get('/' + config.route, (req, res, next) => {
      logger.info(`[TxRouteServiceExpressGet] GET:${config.service+'/'+config.route} query:${JSON.stringify(req.query, undefined, 2)}`);

      const task = 
        new TxRouteServiceTask<TxRouteHeaders>(req.headers, req.query)
        .setService(this)
        .setRequest(req)
        .setRespone(res);
  
      // this forward the task to the subscribers
      this.callbacks.next(task);
    });
    
    return router;
  }

  /**
   * Use to send reply back to client use express response object.
   * This trigger by task.reply().next(..)
   * 
   * The task body in the format of:
   * {
   *    headers: {
   *      source: 'back-application-main',
   *      token: '123456780ABCDEF'
   *    },
   *    response: {
   *      status: 200,
   *      type: 'json'
   *    }},
   *    {
   *      source: 'back-application-main', status: "ok"
   *    }
   * }
   * 
   * @param from a task coming from the express.Route API, implement in this,add method
   * @param task a task from subscriber need to reply it back client using response
   */
  send(from: TxRouteServiceTask<any>, task: TxRouteServiceTask<any>) {
    console.log('[TxRouteServiceExpressGet::send] is called, task = ', JSON.stringify(task.get(), undefined, 2));
    
    let head = task.getHead();
    if (head) {
      for (let name in head.headers) {
        if (name !== undefined && head[name]) {
          from.response.setHeader(name, head[name]);
        }
      }
      if (head.reponse && head.reponse.type === 'json') {
        from.response.json(task.get());

        return;
      }
    }
    from.response.json(task.get());
  }

  /**
   * client side: use to send request to service using axios 
   * 
   * @param task - tast need to send to service
   */
  async next(task: TxTask<any>) {
    console.log('[TxRouteServiceExpressGet::next] is called, task = ', JSON.stringify(task.get(), undefined, 2));      

    let options = {
      method: this.config.method,
      headers: task.getHead(),      
    };

    const url = new URL()
      .set('protocol', 'http')
      .set('hostname', this.config.host)
      .set('port', this.config.port)
      .set('pathname', this.config.service+'/'+this.config.route)
      .set('query', task.getData())
      .toString();

    console.log(":UUUUUUUUUUUUUUUU : ", url.toString());

    // const url = this.buildUrl('http://localhost:3100/sanity/save', task);

    console.log("[TxRouteServiceExpressGet::next] NEXT: OPTION + " + JSON.stringify(options, undefined, 2));
    console.log("[TxRouteServiceExpressGet::next] NEXT: URL + " + url);  
  
    const reply = await axios.get(url, options);

    console.log("[TxRouteServiceExpressGet::next] NEXT: REPLY = " + JSON.stringify(reply.data, undefined, 2));
    // console.log("[TxRouteServiceExpressGet::next] NEXT: REPLY = " + JSON.stringify(new TxRouteServiceTask<any>(reply.data.head, reply.data.data).get(), undefined, 2));

    //this.callbacks.next(new TxRouteServiceTask<any>(reply.data.head, reply.data.data));

    return reply;
  }

  /**
   * @deprecated - use URL.parse
   * @param base 
   * @param task 
   */
  buildUrl(base: string, task: TxTask<any>) {
    const { data } = task.get();

    let first = true;
    for (let name in data) {
      console.log(`${name}: ${data[name]}`);      
      if (name === undefined || data[name] === undefined) {
          continue;
      }
      if (first) {      
        base = `${base}?${name}=${data[name]}`;
        first = false;
        
        continue;
      }
      base = `${base}&${name}=${data[name]}`;
    }

    return base;
  }

  // async next(data: TxRouteServiceTask<any>) {
  //   let options = {
  //     method: this.config.method,
  //     //headers: data.getHead().headers,      
  //   };
  //   console.log("[TxRouteServiceExpressGet::next] NEXT: OPTION + " + JSON.stringify(options, undefined, 2));
  
  //   await axios.get('http://localhost:3100/sanity/save', options);
  // }  
}

export default TxRouteServiceExpressGet;
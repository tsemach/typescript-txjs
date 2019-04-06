
import { TxJobPersistAdapter, TxJobJSON } from 'rx-txjs';

const repository = require('../../../../models');
const Jobs = repository.sequelize.import('../../../../models/jobs');

class JobRepository implements TxJobPersistAdapter {
  constructor() {
    console.log('[JobRepository:cos\'t]');
  }
        
  save(uuid: string, data: TxJobJSON, name?: string) {    
    return repository.sequelize.transaction((transaction: any) => {            
      return Jobs.upsert({
        jobId: uuid,
        name: name,
        data: data,
      }, {transaction: transaction})
    });
  }

  read(uuid: string) {
    return new Promise<TxJobJSON>( (jsonResolve, jsonReject) => {
      Jobs.findOne({
        where: {
          jobId: uuid
        }
                 })
      .then( (job) => {
        if ( ! job ) {
          jsonResolve(null)

          return;
        }
        jsonResolve(job.data)
      })            
      .catch( (err) => {        
        jsonReject(err);
      });
    });      
  }

  delete(jobId: string) {
    return repository.sequelize.transaction((transaction: any) => {            
      return Jobs.destroy({
        where: {
          jobId: jobId
        }
      }, {transaction: transaction});
    });
  }

}

export default new JobRepository();


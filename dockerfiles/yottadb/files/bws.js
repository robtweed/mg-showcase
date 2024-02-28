import { Router } from '@stricjs/router';
import {QOper8_Plugin} from 'qoper8-stric';
import { randomUUID } from 'crypto';
import { createClient } from 'redis';

let router =  new Router({port: 3001});

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();


const options = {
  mode: 'child_process',
  logging: false,
  poolSize: 8,
  exitOnStop: true,
  workerHandlersByRoute: [
    {
      method: 'get',
      url: '/uuidYdb',
      handlerPath: 'uuidYdb.mjs'
    }
  ],
  mgdbx: {
    open: {
      type: "YottaDB",
      path: "/usr/local/lib/yottadb/r138",
      env_vars: {
        ydb_dir: '/opt/yottadb',
        ydb_gbldir: '/opt/yottadb/yottadb.gld',
        ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so',
        ydb_ci: '/usr/local/lib/yottadb/r138/zmgsi.ci'
      }
    }
  }
};

let qoper8 = await QOper8_Plugin(router, options);

let counts = {};

qoper8.on('workerStarted', function(id) {
  console.log('worker ' + id + ' started');
});

qoper8.on('workerStopped', function(id) {
  console.log('worker ' + id + ' stopped');
  delete counts[id];
});

qoper8.on('replyReceived', function(res) {
  let id = res.workerId;
  if (!counts[id]) counts[id] = 0;
  counts[id]++;
});

let countTimer = setInterval(() => {
  console.log('messages handled:');
  for (let id in counts) {
    console.log(id + ': ' + counts[id]);
  }
  console.log('-----');
}, 20000);

qoper8.on('stop', () => {
  clearInterval(countTimer);
});

router.get('/local', (req) => {
  return Response.json({hello: 'local from Bun.js'});
});

router.get('/uuid', (req) => {
  return Response.json({uuid: randomUUID()});
});

router.get('/uuidRedis', async (req) => {

  let uuid = randomUUID();
  await client.HSET('redistest', uuid, 'hello world');

  return Response.json({uuid: uuid});
});


router.use(404, (req) => {
  return Response.json({error: 'Unrecognised request'}, {status: 401});
});

export default router;


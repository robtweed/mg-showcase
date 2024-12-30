import {Router} from 'mg-bun-router';
import { writeFileSync } from 'fs';

let prefix = process.env.urlprefix || '';
let data = 'let urlPrefix = "' + prefix + '"; export {urlPrefix}';
writeFileSync('/opt/mgateway/www/js/urlprefix.js', data, 'utf8');
let logging = (process.argv[2] === 'true') || false;
let poolSize = process.argv[3] || 2;

let router = new Router({
  logging: logging,
  poolSize: poolSize,
  workerHandlersByRoute: [
    {
      method: 'get',
      url: '/helloworld',
      handlerPath: 'handlers/getHelloWorld.mjs'
    },
    {
      method: 'post',
      url: '/user',
      handlerPath: 'handlers/addUser.mjs'
    },
    {
      method: 'get',
      url: '/user/:id',
      handlerPath: 'handlers/getUser.mjs'
    },
    {
      method: 'get',
      url: '/viewer/globaldirectory',
      handlerPath: 'handlers/getGlobalDirectory.mjs'
    },
    {
      method: 'get',
      url: '/viewer/documentNode/:documentName',
      handlerPath: 'handlers/getDocumentNode.mjs'
    },
    {
      method: 'post',
      url: '/viewer/getChildNodes',
      handlerPath: 'handlers/getChildNodes.mjs'
    },
    {
      method: 'post',
      url: '/benchmark',
      handlerPath: 'handlers/benchmark.mjs'
    },
  ],
  mgdbx: {
    open: {
      type: "YottaDB",
      path: "/usr/local/lib/yottadb/r202",
      env_vars: {
        ydb_dir: '/opt/yottadb',
        ydb_gbldir: '/opt/yottadb/yottadb.gld',
        ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r202/libyottadbutil.so',
        ydb_ci: '/usr/local/lib/yottadb/r202/zmgsi.ci'
      }
    }
  }
});

router.get('/local', (req) => {
  return Response.json({
    ok: true,
    hello: 'from Bun.serve'
  });
});

router.static('/opt/mgateway/www/');

Bun.serve({
  port: 3000,
  async fetch(Req) {
    return await router.useRoutes(Req);
  }
});


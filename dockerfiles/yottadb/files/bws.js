import {Router} from 'mg-bun-router';
import { writeFileSync } from 'fs';

let prefix = process.env.urlprefix || '';
let data = 'let urlPrefix = "' + prefix + '"; export {urlPrefix}';
writeFileSync('/opt/mgateway/www/js/urlprefix.js', data, 'utf8');
let logging = process.argv[2] || false;

let router = new Router({
  logging: logging,
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
      path: "/usr/local/lib/yottadb/r138",
      env_vars: {
        ydb_dir: '/opt/yottadb',
        ydb_gbldir: '/opt/yottadb/yottadb.gld',
        ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so',
        ydb_ci: '/usr/local/lib/yottadb/r138/zmgsi.ci'
      }
    }
  }
});

router.static('/opt/mgateway/www/');

Bun.serve({
  port: 3000,
  async fetch(Req) {
    return await router.useRoutes(Req);
  }
});


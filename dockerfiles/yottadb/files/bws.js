import { App, routes } from '@stricjs/app';
import { html } from '@stricjs/app/send';
import {QOper8_Plugin} from 'qoper8-stric';
import { writeFileSync } from 'fs';

let prefix = process.env.urlprefix || '';
let data = 'let urlPrefix = "' + prefix + '"; export {urlPrefix}';
writeFileSync('/opt/mgateway/www/js/urlprefix.js', data, 'utf8');
let logging = process.argv[2] || false;

let app = new App({
  serve: {
    port: 8080,
    hostname: '0.0.0.0'
  }
});

let router = routes();

const options = {
  mode: 'child_process',
  logging: logging,
  poolSize: 2,
  exitOnStop: true,
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
};

let qoper8 = await QOper8_Plugin(router, options);;

router.get('/*', async (ctx) => {
  console.log(ctx);
  let path = '/opt/mgateway/www/' + ctx.path;
  try {
    const page = await Bun.file(path).text();
    return html(page);
  }
  catch(err) {
    return Response.json({error: 'Unrecognised request'}, {status: 401});
  }
});

app.routes.extend(router);
app.build(true);


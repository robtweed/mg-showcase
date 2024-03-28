import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import QOper8 from 'qoper8-fastify';
import { writeFileSync } from 'fs';

let prefix = process.env.urlprefix || '';
let data = 'let urlPrefix = "' + prefix + '"; export {urlPrefix}';
writeFileSync('/opt/mgateway/www/js/urlprefix.js', data, 'utf8');

const fastify = Fastify({
  logger: false
});

fastify.register(fastifyStatic, {
  root: '/opt/mgateway/www',
  prefix: '/',
  maxAge: '23h'
});

let logging = (process.argv[2] === 'true') || false;
let poolSize = process.argv[3] || 2;

const options = {
  mode: 'child_process',
  logging: logging,
  poolSize: poolSize,
  exitOnStop: true,
  mgdbx: {
    open: {
      type: "YottaDB",
      path: "/usr/local/lib/yottadb/r138",
      env_vars: {
        ydb_gbldir: '/opt/yottadb/yottadb.gld',
        ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so',
        ydb_ci: '/usr/local/lib/yottadb/r138/zmgsi.ci'
      }
    }
  },
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
  ]
};

fastify.register(QOper8, options);

fastify.get('/local', function (req, reply) {
  reply.send({
    ok: true,
    hello: 'from Fastify'
  });
});

fastify.setNotFoundHandler((request, reply) => {
  let error = {error: 'Not found: ' + request.url};
  reply.code(404).type('application/json').send(JSON.stringify(error));
});

await fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});


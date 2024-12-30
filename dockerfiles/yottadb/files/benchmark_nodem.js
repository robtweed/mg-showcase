process.env.ydb_gbldir = '/opt/yottadb/yottadb.gld';
process.env.ydb_dir = '/opt/yottadb';
process.env.ydb_routines = '/opt/mgateway/m /usr/local/lib/yottadb/r202/libyottadbutil.so';
process.env.ydb_dist = '/usr/local/lib/yottadb/r202';
process.env.GTMCI = '/opt/mgateway/node_modules/nodem/resources/nodem.ci';

const ydb = require('nodem').Ydb()

let x = ydb.open();

console.log(ydb.version());

ydb.kill({global: 'ydbtest'});

let max = process.argv[2] || 1000000;

console.log('Nodem performance test');
console.log('Insert and read back ' + max.toLocaleString() + ' key/value pairs');
console.log('Global name used is ^ydbtest');
console.log('Please wait...')
console.log('-----');

let start = Date.now();

for (let key = 1; key < max; key++) {
  ydb.set({global: 'ydbtest', subscripts: [key], data: 'hello world'});
}
let finish = Date.now();
let elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' inserts in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');
console.log('------');

start = Date.now();
for (let key = 1; key < max; key++) {
  let value = ydb.get({global: 'ydbtest', subscripts: [key]});
}
finish = Date.now();
elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' gets in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');

ydb.close();

import {server, mglobal, mclass} from 'mg-dbx-napi';

let db = new server();

var open = db.open({
  type: "YottaDB",
  path: "/usr/local/lib/yottadb/r202",
  env_vars: {
    ydb_gbldir: '/opt/yottadb/yottadb.gld',
    ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r202/libyottadbutil.so',
    ydb_ci: '/usr/local/lib/yottadb/r202/zmgsi.ci'
  }
});

let ydbTest = new mglobal(db, "ydbtest");

ydbTest.delete();

let max = process.argv[2] || 10000000;

console.log('mg-dbx-napi performance test');
console.log('Insert and read back ' + max.toLocaleString() + ' key/value pairs');
console.log('Global name used is ^ydbtest');
console.log('Please wait...')
console.log('-----');

let start = Date.now();

for (let key = 1; key < max; key++) {
  ydbTest.set(key,"hello world");
}
let finish = Date.now();
let elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' inserts in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');
console.log('------');

start = Date.now();
for (let key = 1; key < max; key++) {
  let x = ydbTest.get(key);
}
finish = Date.now();
elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' gets in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');

db.close();


import {server, mglobal, mclass} from 'mg-dbx-napi';

let db = new server();

var open = db.open({
  type: "IRIS",
  path:"/usr/irissys/mgr",
  username: "_SYSTEM",
  password: "secret",
  namespace: "USER"
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


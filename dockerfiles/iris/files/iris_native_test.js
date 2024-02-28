const IRISNative = require('intersystems-iris-native');
let connectionInfo = {
  host: 'localhost',
  port: 1972,
  ns: 'USER',
  user: '_SYSTEM',
  pwd: 'secret',
  sharedmemory: true,
  timeout: 500,
  logfile: './mylogfile.log'
};
const conn = IRISNative.createConnection(connectionInfo);
const irisjs = conn.createIris();


irisjs.kill('intest');
let start = Date.now();
let max = +process.argv[2] || 1000000;

for (let key = 1; key < max; key++) {
  irisjs.set('hello world', 'intest', key);
}
let finish = Date.now();
let elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' inserts in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');
console.log('------');


start = Date.now();
for (let key = 1; key < max; key++) {
  let value = irisjs.get('intest', key);
}
finish = Date.now();
elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' gets in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');
console.log('------');


conn.close();
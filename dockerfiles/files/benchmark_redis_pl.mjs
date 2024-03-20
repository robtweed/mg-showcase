import { createClient } from 'redis';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

let max = 500000;
console.log('Redis performance test: pipelined');
console.log('Insert and read back ' + max.toLocaleString() + ' key/value pairs using HSET and HGET');
console.log('Please wait...')
console.log('-----');

let start = Date.now();

let arr = [];
for (let key = 1; key < max; key++) {
  arr.push(client.HSET('redistest', key, 'hello world'));
}
await Promise.all(arr);

let finish = Date.now();
let elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' inserts in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');
console.log('------');

start = Date.now();
arr = [];
for (let key = 1; key < max; key++) {
  arr.push(client.HGET('redistest', key.toString()));
}
await Promise.all(arr);
finish = Date.now();
elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' gets in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');

console.log('-----------');
console.log(' ');


await client.disconnect();
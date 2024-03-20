import { createClient } from 'redis';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

let max = 100000;
console.log('Redis performance test');
console.log('Insert and read back ' + max.toLocaleString() + ' key/value pairs using HSET and HGET');
console.log('Please wait...')
console.log('-----');

let start = Date.now();

for (let key = 1; key < max; key++) {
  await client.HSET('redistest', key, 'hello world');
}
let finish = Date.now();
let elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' inserts in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');
console.log('------');

start = Date.now();

for (let key = 1; key < max; key++) {
  let value = await client.HGET('redistest', key.toString());
}
finish = Date.now();
elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' gets in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');


console.log('-----------');
console.log(' ');

console.log('Redis performance test');
console.log('Insert and read back ' + max.toLocaleString() + ' key/value pairs using SET and GET');
console.log('Please wait...')
console.log('-----');

start = Date.now();

for (let key = 1; key < max; key++) {
  await client.SET('redistest:' + key, 'hello world');
}
finish = Date.now();
elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' inserts in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');
console.log('------');

start = Date.now();

for (let key = 1; key < max; key++) {
  let value = await client.GET('redistest:' + key);
}
finish = Date.now();
elap = (finish - start)/1000;
console.log('finished ' + max.toLocaleString() + ' gets in ' + Math.trunc(elap) + ' seconds');
console.log('rate: ' + Math.trunc((max / elap)).toLocaleString() + ' /sec');


await client.disconnect();
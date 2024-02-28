import {glsdb} from './glsdb_loader.mjs';

let dirarr = glsdb.directory;

console.log('*** Global Directory ***');
console.log('------------------------');
for (let name of dirarr) {
  console.log('^' + name);
}
console.log('------------------------');

glsdb.close();
import {glsdb} from './glsdb_loader.mjs';
import fs from 'fs';
import events from 'events';
import readline from 'readline';

let filename = process.argv[2] || 'backup.txt';

console.log('restoring Globals from ' + filename);

async function processLineByLine(filename) {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(filename),
      crlfDelay: Infinity
    });

    let count = 0;
    let subcount = 0;
    let lastName = '';
    let doc;
    let name;
    let subscripts;

    rl.on('line', (line) => {
      count++;
      if (count > 1) {
        subcount++;
        if (subcount === 1) {
          name = line;
          if (name !== lastName) {
            doc = new glsdb.node(name);
            lastName = name;
          }
        }
        if (subcount === 2) subscripts = JSON.parse(line);
        if (subcount === 3) {
          doc.$(subscripts).value = line;
          subcount = 0;
        }
      }
    });

    await events.once(rl, 'close');

  } 
  catch (err) {
    console.error(err);
  }
}

await processLineByLine(filename);


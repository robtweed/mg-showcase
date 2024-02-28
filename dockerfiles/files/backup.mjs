import fs from 'fs';
import events from 'events';
import readline from 'readline';

let Backup = class {

  constructor(glsdb) {
    this.glsdb = glsdb;
  }

  now(ignore, filename) {

    ignore = ignore || [];
    filename = filename || 'backup.txt';

    let docs = this.glsdb.directory;
    console.log(docs);

    console.log('backup system to ' + filename);
    fs.writeFileSync(filename, 'Backup at ' + new Date().toUTCString() + '\n', {encoding: "utf8"});

    for (let docname of docs) {
      if (!ignore.includes(docname)) {
        let doc = new this.glsdb.node(docname);
        console.log('Backing up ' + docname);
        doc.forEachLeafNode({getdata: true}, function(keys, data) {
          let name = keys[0];
          keys.shift();
          fs.writeFileSync(filename, name + '\n', {encoding: "utf8", flag: "a+"});
          fs.writeFileSync(filename, JSON.stringify(keys) + '\n', {encoding: "utf8", flag: "a+"});
          fs.writeFileSync(filename, data + '\n', {encoding: "utf8", flag: "a+"});
        });
      }
    }

    console.log('Backup complete');
  }

  async restore(filename) {
    filename = filename || 'backup.txt';

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
              name = line + 'Test';
              if (name !== lastName) {
                doc = new this.glsdb.node(name);
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
  }

};

export {Backup};

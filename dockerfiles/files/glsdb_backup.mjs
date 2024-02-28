import {glsdb} from './glsdb_loader.mjs';
import {Backup} from './backup.mjs';

let backup = new Backup(glsdb);

let docName = process.argv[2];
let ignore = [];
if (docName && docName !== 'all') ignore = [docName];
let file = process.argv[3];

backup.now(ignore, file);

glsdb.close();

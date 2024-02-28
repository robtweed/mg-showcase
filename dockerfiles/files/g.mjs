import {glsdb} from './glsdb_loader.mjs';

let gloref = process.argv[2] || '';

if (gloref) {
  let doc = new glsdb.node(gloref);
  let subs = doc.subscripts;
  let pre;
  if (doc.subscripts.length === 0) {
    pre = '^' + doc.name + '[ ';
  }
  else {
    subs = subs + ', ';
    pre = '^' + doc.name + '[ ' + subs;
  }

  let spaces = ' '.repeat(pre.length );
  doc.forEachChildNode(function(child) {
    let s = pre + child.key + ' ]';
    if (child.hasValue) s = s + ' = "' + child.value +'"';
    console.log(s);
    pre = spaces;
  });
}


glsdb.close();

import JSON5 from 'json5';

let loaded = false;

const handler = function(messageObj, finished) {

  if (!messageObj.data.body) {
    return finished({error: 'Invalid request'});
  }

  let documentName = messageObj.data.body.documentName;

  if (!documentName || documentName === '') {
    documentName = 'bmTest';
  }
  let noOfRecords = +messageObj.data.body.noOfRecords;

  if (!noOfRecords || noOfRecords === '') {
    noOfRecords = 100;
  }
  // set upper limit to 10 million

  if (noOfRecords > 10000000) noOfRecords = 10000000;

  let max = noOfRecords + 1;

  let value = messageObj.data.body.json;
  let json;

  try {
    json = JSON5.parse(value);
  }
  catch(err) {
    json = value;
  }

  let start;
  let finish;
  let elapsed;

  let counts_set = 0;
  let counts_get = 0;
  let counts_inc = 0;
  let counts_def = 0;
  let counts_nxt = 0;
  let counts_nxq = 0;

  this.glsdb.on('get', () => {
    counts_get++;
  });

  this.glsdb.on('set', () => {
    counts_set++;
  });

  this.glsdb.on('increment', () => {
    counts_inc++;
  });

  this.glsdb.on('defined', () => {
    counts_def++;
  });

  this.glsdb.on('next', () => {
    counts_nxt++;
  });
  this.glsdb.on('cursor_next', () => {
    counts_nxq++;
  });


  /*

  // ==== low-level mg-dbx-napi comparison

  let dbx = this.glsdb.dbx;
  let ydbTest = new dbx.mglobal(dbx.db, "ydbTest");
  ydbTest.delete();
  start = Date.now();
  for (let key = 1; key < max; key++) {
    ydbTest.set(key,"hello world");
  }
  finish = Date.now();
  elapsed = (finish - start)/1000;
  let raw_set = {
    noOfRecords: noOfRecords.toLocaleString(),
    totalTime: elapsed.toFixed(2),
    rate: Math.trunc((noOfRecords / elapsed)).toLocaleString()
  }


  start = Date.now();
  let data;
  for (let key = 1; key < max; key++) {
    data = ydbTest.get(key);
  }
  finish = Date.now();
  elapsed = (finish - start)/1000;
  let raw_get = {
    noOfRecords: noOfRecords.toLocaleString(),
    totalTime: elapsed.toFixed(2),
    rate: Math.trunc((noOfRecords / elapsed)).toLocaleString()
  }

  // ==== end of low-level mg-dbx-napi comparison

  */

  let doc = new this.glsdb.node(documentName);

  doc.delete();
  start = Date.now();

  for (let key = 1; key < max; key++) {
    doc.$(key).document = json;
  }

  finish = Date.now();
  elapsed = (finish - start)/1000;

  let set = {
    noOfRecords: noOfRecords.toLocaleString(),
    totalTime: elapsed.toFixed(2),
    rate: Math.trunc((noOfRecords / elapsed)).toLocaleString(),
    dbxCounts: {
      set: counts_set,
      get: counts_get,
      inc: counts_inc,
      def: counts_def,
      nxt: counts_nxt,
      nxq: counts_nxq
    }
  }

  counts_set = 0;
  counts_get = 0;
  counts_inc = 0;
  counts_def = 0;
  counts_nxt = 0;
  counts_nxq = 0;

  start = Date.now();
  for (let key = 1; key < max; key++) {
    let data = doc.$(key).document;
  }
  finish = Date.now();
  elapsed = (finish - start)/1000;

  let get = {
    noOfRecords: noOfRecords.toLocaleString(),
    totalTime: elapsed.toFixed(2),
    rate: Math.trunc((noOfRecords / elapsed)).toLocaleString(),
    dbxCounts: {
      set: counts_set,
      get: counts_get,
      inc: counts_inc,
      def: counts_def,
      nxt: counts_nxt,
      nxq: counts_nxq
    }
  }

  // get using mcursor / query

  counts_set = 0;
  counts_get = 0;
  counts_inc = 0;
  counts_def = 0;
  counts_nxt = 0;
  counts_nxq = 0;

  start = Date.now();
  for (let key = 1; key < max; key++) {
    let data = doc.$(key).document_q;
  }
  finish = Date.now();
  elapsed = (finish - start)/1000;

  let get_q = {
    noOfRecords: noOfRecords.toLocaleString(),
    totalTime: elapsed.toFixed(2),
    rate: Math.trunc((noOfRecords / elapsed)).toLocaleString(),
    dbxCounts: {
      set: counts_set,
      get: counts_get,
      inc: counts_inc,
      def: counts_def,
      nxt: counts_nxt,
      nxq: counts_nxq
    }
  }

  this.glsdb.off('set');
  this.glsdb.off('get');
  this.glsdb.off('increment');
  this.glsdb.off('defined');
  this.glsdb.off('next');
  this.glsdb.off('cursor_next');

  finished({
    //dbx_set: raw_set,
    //dbx_get: raw_get,
    set: set,
    get: get,
    get_q: get_q
  });
};

export {handler};
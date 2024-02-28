const handler = function(messageObj, finished) {
  let now = Date.now();
  let hello = this.use('hello');
  hello.set(now, 'world');

  finished({
    ok: true,
    hello: 'world',
    at: now,
    handledByWorker: this.id
  });
};

export {handler};
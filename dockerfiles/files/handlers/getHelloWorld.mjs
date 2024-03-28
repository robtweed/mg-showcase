const handler = function(messageObj, finished) {

  finished({
    ok: true,
    hello: 'from QOper8 Worker ' + this.id
  });
};

export {handler};
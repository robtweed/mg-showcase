const handler = function(messageObj, finished) {

  let names = this.glsdb.directory;

  finished({
    names: names
  });
};

export {handler};
const handler = function(messageObj, finished) {

  /*

    // using the native mg-dbx-napi APIs

  let person = this.use("Person");
  let key = person.increment('nextId', 1);
  person.set('data', key, 'firstName', messageObj.data.body.firstName);
  person.set('data', key, 'lastName', messageObj.data.body.lastName);

  */

    // same thing, but using glsdb's abstraction

  let personId = new this.glsdb.node('Person.nextId');
  let person = new this.glsdb.node('Person.data');
  let id = personId.increment();
  person.$(id).document = messageObj.data.body;

  finished({
    ok: true,
    id: id,
    handledByWorker: this.id
  });
};

export {handler};
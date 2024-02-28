const handler = function(messageObj, finished) {

  let id = messageObj.data.params.id;
  let person = new this.glsdb.node('Person.data.' + id);

  if (person.exists) {
    return finished({
      document: person.document
    });
  }
  else {
    return finished({error: 'No record exists with id ' + id});
  }

};

export {handler};
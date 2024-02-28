const handler = function(messageObj, finished) {

  /*
  if (!session.authenticated) {
    return finished({error: 'Unauthenticated'});
  }
  */

  if (!messageObj.data.params) {
    return finished({error: 'Invalid request'});
  }

  let documentName = messageObj.data.params.documentName;
  if (!documentName || documentName === '') {
    return finished({error: 'Invalid request'});
  }

  let doc = new this.glsdb.node(documentName);
  let value = '';
  let isLeafNode = doc.isLeafNode;
  if (isLeafNode) value = doc.value;
  let node = {
    documentName: documentName,
    path: documentName,
    parent: false,
    subscript: documentName,
    leafNode: isLeafNode,
    value: value,
    id: 1
  };

  finished({
    node: node,
    idCounter: 1
  });

};

export {handler};

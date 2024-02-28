const handler = function(messageObj, finished) {


  if (!messageObj.data.body) {
    return finished({error: 'Invalid request'});
  }

  let path = messageObj.data.body.path;
  //if (!path || !Array.isArray(path)) {
  if (!path) {
    return finished({error: 'Invalid request'});
  }

  let idCounter = messageObj.data.body.idCounter;
  if (!idCounter || idCounter === '') {
    return finished({error: 'Invalid request'});
  }

  let parentId = messageObj.data.body.parentId;
  if (!parentId || parentId === '') {
    return finished({error: 'Invalid request'});
  }

  let doc = new this.glsdb.node(path);

  let nodes = [];
  let max = messageObj.data.body.maxSubscripts || 50;
  let count = 0;
  let node;

  if (messageObj.data.body.moreSiblings) {

    let seedNode = doc.getChild(messageObj.data.body.seed);
    let prevNode = seedNode.previousSibling;

    idCounter++;
    node = {
      id: idCounter,
      path: path,
      morePreviousSiblings: true,
      seed: prevNode.key,
      parent: parentId,
    };
    nodes.push(node);

    doc.forEachChildNode({from: messageObj.data.body.seed}, function(child) {
      idCounter++;
      count++;
      if (count > max) {
        node = {
          id: idCounter,
          path: path,
          moreSiblings: true,
          seed: child.key,
          parent: parentId
        };
        nodes.push(node);
        return false;
      }
      node = {
        path: child.path,
        subscript: child.key,
        leafNode: !child.hasChildren,
        parent: parentId,
        id: idCounter
      };
      if (node.leafNode) {
        node.value = child.value;
      }
      nodes.push(node);
    });

    return finished({
      nodes: nodes,
      idCounter: idCounter
    });
  }

  if (messageObj.data.body.morePreviousSiblings) {

    let seedNode = doc.getChild(messageObj.data.body.seed);
    let nextNode = seedNode.nextSibling;

    idCounter++;
    node = {
      id: idCounter,
      path: path,
      moreSiblings: true,
      seed: nextNode.key,
      parent: parentId,
    };
    nodes.push(node);

    doc.forEachChildNode({direction: 'reverse', from: messageObj.data.body.seed}, function(child) {
      idCounter++;
      count++;
      if (count > max) {
        node = {
          id: idCounter,
          path: path,
          morePreviousSiblings: true,
          seed: child.key,
          parent: parentId
        };
        nodes.unshift(node);
        return false;
      }
      node = {
        path: child.path,
        subscript: child.key,
        leafNode: !child.hasChildren,
        parent: parentId,
        id: idCounter
      };
      if (node.leafNode) {
        node.value = child.value;
      }
      nodes.unshift(node);
    });

    return finished({
      nodes: nodes,
      idCounter: idCounter
    });
  }

  doc.forEachChildNode(function(child) {
    idCounter++;
    count++;

    if (count > max) {
      node = {
        id: idCounter,
        path: path,
        moreSiblings: true,
        parent: parentId,
        seed: child.key
      };
      nodes.push(node);
      return false; // stop the forEachChild loop
    }
    node = {
      path: child.path,
      subscript: child.key,
      leafNode: !child.hasChildren,
      parent: parentId,
      id: idCounter
    };
    if (node.leafNode) {
      node.value = child.value;
    }
    nodes.push(node);
  });

  console.log('*** response: nodes ***');
  console.log(nodes);

  finished({
    nodes: nodes,
    idCounter: idCounter
  });

};
export {handler};

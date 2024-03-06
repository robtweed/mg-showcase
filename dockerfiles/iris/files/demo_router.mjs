import {Router} from 'mgw-router';
import {glsdb} from 'mgw-router/glsdb';

const router = new Router({logging: true});

router.register(glsdb, {
  type: "IRIS",
  path:"/usr/irissys/mgr",
  username: "_SYSTEM",
  password: "secret",
  namespace: "USER"
});


router.get('/mgweb/helloworld', (Request, ctx) => {
  //ctx.time = Date.now();

  return {
    payload: {
      hello: 'world 123',
      //Request: Request
    }
  };

});

// parametric route:

//curl -v http://localhost:8080/mgweb/user/12

router.get('/mgweb/user/:userId', (Request, ctx) => {

  let person = new ctx.glsdb.node('Person.data');
  let data = person.$(Request.params.userId).document;

  return {
    payload: {
      key: Request.params.userId,
      data: data
    }
  };

});


// post route
// if applcation.json content-type, body is parsed automatically as jSON

//  3 versions using various levels of mg-dbx-napi abstraction

// curl -v -X POST -H "Content-Type: application/json" -d "{\"name\": \"Chris Munt\"}" http://localhost:8080/mgweb/save


router.post('/mgweb/save', (Request, ctx) => {

  let personId = new ctx.glsdb.node('Person.nextId');
  let person = new ctx.glsdb.node('Person.data');

  let id = personId.increment();
  person.$(id).document = {
    name: Request.body.name,
  };

  return {
    payload: {
      saved: true
    }
  };

});

// proxied glsdb abstraction using _increment

router.post('/mgweb/savep', (Request, ctx) => {

  let person = new ctx.glsdb.node('Person').proxy;
  let id = person.nextId._increment();

  person.data[id] = {
    name: Request.body.name
  }

  return {
    payload: {
      saved: true
    }
  };

});

// proxied glsdb abstraction using ++ and lock/unlock

router.post('/mgweb/savep2', (Request, ctx) => {

  let person = new ctx.glsdb.node('Person').proxy;
  person.nextId._lock();
  person.nextId++;
  person.nextId._unlock();
  let id = person.nextId.valueOf();

  person.data[id] = {
    name: Request.body.name
  }

  return {
    payload: {
      saved: true
    }
  };

});



let handler = router.handler;

export {handler};
import {glsDB} from 'glsdb';
const glsdb = new glsDB();

glsdb.open({
  type: "IRIS",
  path:"/usr/irissys/mgr",
  username: "_SYSTEM",
  password: "secret",
  namespace: "USER"
});

export {glsdb};

import {server, mglobal, mclass, mcursor} from 'mg-dbx-napi';

let db = new server();

const envvars = {
  ydb_gbldir: '/opt/yottadb/yottadb.gld',
  ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r202/libyottadbutil.so',
  ydb_ci: '/usr/local/lib/yottadb/r202/zmgsi.ci'
};

var open = db.open({
  type: "YottaDB",
  path: "/usr/local/lib/yottadb/r202",
  env_vars: envvars
});

//let rob = new mglobal(db, "rob");
//console.log(rob.get(123));

let query = new mcursor(db, {global: ""}, {globaldirectory: true});
let result;
console.log(1111);
while ((result = query.next()) !== null) {
  console.log("result: " + result);
}

db.close();
import {glsDB} from 'glsdb';
const glsdb = new glsDB();

glsdb.open({
  type: "YottaDB",
  path: "/usr/local/lib/yottadb/r202",
  env_vars: {
    ydb_gbldir: '/opt/yottadb/yottadb.gld',
    ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r202/libyottadbutil.so',
    ydb_ci: '/usr/local/lib/yottadb/r202/zmgsi.ci'
  }
});

export {glsdb};

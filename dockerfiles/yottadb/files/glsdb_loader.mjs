import {glsDB} from 'glsdb';
const glsdb = new glsDB();

glsdb.open({
  type: "YottaDB",
  path: "/usr/local/lib/yottadb/r138",
  env_vars: {
    ydb_gbldir: '/opt/yottadb/yottadb.gld',
    ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so',
    ydb_ci: '/usr/local/lib/yottadb/r138/zmgsi.ci'
  }
});

export {glsdb};

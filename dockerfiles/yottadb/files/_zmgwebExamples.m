buildRoutes ;
 i $$buildAPIs^%zmgwebUtils("/opt/mgateway/mgweb-routes.json")
 QUIT
 ;
helloworld(req) ;
 n res
 s res("hello")="world"
 QUIT $$response^%zmgweb(.res)
 ;
 ;
save(req) ;
 n errors,id,res
 ;
 i '$d(req("body")) d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="Missing or empty body"
 ;
 i '$d(req("body","firstName")) d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="Missing or empty firstName"
 ;
 i '$d(req("body","lastName")) d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="Missing or empty lastName"
 ;
 s id=$increment(^Person("nextId"))
 m ^Person("data",id)=req("body")
 s res("id")=id
 s res("ok")="true"
 QUIT $$response^%zmgweb(.res)
 ;
getUser(req) ;
 n errors,id,res
 ;
 s userId=$g(req("params","userId"))
 i userId="" d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="User Id not defined"
 ;
 i '$D(^Person("data",userId)) d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="No such user in the database"
 ;
 m res("data")=^Person("data",userId)
 s res("key")=userId
 QUIT $$response^%zmgweb(.res)
 ;

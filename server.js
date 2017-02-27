var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(process.env.PWD)).listen(process.env.PORT || 8080, function(){
  console.log('Server running on 8080...');
});

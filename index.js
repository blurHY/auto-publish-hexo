// Generated by CoffeeScript 1.7.1
(function() {
  var http, shelljs;

  http = require("http");

  shelljs = require("shelljs");

  http.createServer(function(request, response) {
    var currentDir, hexoPostsDir, result;
    response.writeHead(200, {
      "Content-Type": "text/plain"
    });
    currentDir = '' + shelljs.pwd();
    hexoPostsDir = "" + currentDir + "/";
    result = shelljs.exec("cd " + hexoPostsDir + "../source/_posts & git pull origin master ").output;
    result = '' + result;
    response.write(result);
    response.end();
  }).listen(8888);

}).call(this);

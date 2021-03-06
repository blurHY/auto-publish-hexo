(function() {
  var bl, config, crypto, currentDir, getTime, hexoDir, hexoSourceDir, http, key, listenPort, moment, shelljs, timezone;

  http = require("http");

  shelljs = require("shelljs");

  crypto = require("crypto");

  bl = require('bl');

  config = require('./config');

  moment = require('moment-timezone');

  key = config.webhook_secret;

  currentDir = '' + shelljs.pwd();

  hexoSourceDir = `${currentDir}/${config.path.hexo_source_path}`;

  hexoDir = `${currentDir}/${config.path.hexo_path}`;

  listenPort = config.listen_port;

  timezone = config.time_zone;

  getTime = function() {
    var datetime;
    //datetime = moment().format 'MMMM Do YYYY, h:mm:ss a'
    datetime = moment().tz(timezone).format('MMMM Do YYYY, h:mm:ss a');
    return datetime;
  };

  http.createServer(function(request, response) {
    request.pipe(bl(function(err, blob) {
      var event, hexoCmd, id, pullCmd, result, sig, signBlob, statusCode;
      signBlob = function(key) {
        return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex');
      };
      sig = request.headers['x-hub-signature'];
      event = request.headers['x-github-event'];
      id = request.headers['x-github-delivery'];
      statusCode = 200;
      result = {
        success: true,
        errMsg: ''
      };
      if (!(sig && id && event && signBlob(key) === sig + '')) {
        statusCode = 401;
        result = {
          success: false,
          errMsg: 'vertify failed'
        };
      } else {
        console.log(`Repo: ${hexoSourceDir}`);
        //pull posts
        shelljs.cd(hexoSourceDir);
        pullCmd = shelljs.exec("git pull");
        if (pullCmd.code === 0) {
          console.log(`Hexo: ${hexoDir}`);
          shelljs.cd(hexoDir);
          response.writeHead(statusCode, {
            "Content-Type": "application/json"
          });
          response.end(JSON.stringify(result));
          hexoCmd = shelljs.exec("hexo generate");
        } else {
          statusCode = 500;
          response.writeHead(statusCode, {
            "Content-Type": "application/json"
          });
          response.end(JSON.stringify(result));
        }
      }
      shelljs.cd(currentDir);
    }));
  }).listen(listenPort);

}).call(this);


//# sourceMappingURL=index.js.map
//# sourceURL=coffeescript
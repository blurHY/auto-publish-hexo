http = require "http"
shelljs=require "shelljs"
crypto = require "crypto"
bl = require 'bl'
config = require './config'
moment = require 'moment-timezone'

key = config.webhook_secret
currentDir = ''+shelljs.pwd()
hexoSourceDir = "#{currentDir}/#{config.path.hexo_source_path}"
hexoDir = "#{currentDir}/#{config.path.hexo_path}"
listenPort = config.listen_port
timezone = config.time_zone

getTime = ()->
	#datetime = moment().format 'MMMM Do YYYY, h:mm:ss a'
	datetime = moment().tz(timezone).format 'MMMM Do YYYY, h:mm:ss a'
	return datetime


http.createServer (request, response)->
	request.pipe bl (err, blob)->
		signBlob = (key) ->
			return 'sha1=' + crypto.createHmac 'sha1', key
				.update blob
				.digest 'hex'

		sig = request.headers['x-hub-signature']
		event = request.headers['x-github-event']
		id = request.headers['x-github-delivery']
		statusCode = 200
		result =
			success:true
			errMsg: ''

		if not (sig and id and event and signBlob(key) is sig+'')
			statusCode = 401
			result = {
				success:false
				errMsg: 'vertify failed'
			}
		else
			console.log "Repo: #{hexoSourceDir}"
			#pull posts
			shelljs.cd hexoSourceDir
			pullCmd = shelljs.exec "git pull"

			if pullCmd.code is 0
				console.log "Hexo: #{hexoDir}"
				shelljs.cd hexoDir

				response.writeHead statusCode, {"Content-Type": "application/json"}
				response.end JSON.stringify result

				hexoCmd = shelljs.exec "hexo generate"
			else
				statusCode = 500

				response.writeHead statusCode, {"Content-Type": "application/json"}
				response.end JSON.stringify result

		shelljs.cd currentDir
		return
	return
.listen listenPort

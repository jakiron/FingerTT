var express=require('express'), fs=require('fs'),path=require('path');

//App variables
var app=express(),port=9876,localPath=__dirname,viewPath=path.join(localPath,'www'),indexPath=path.join(viewPath,'index.html'),
mimeType={".html":"text/html",".js":"application/javascript",".css":"text/css",".txt":"text/plain",".jpg":"image/jpeg",".gif":"image/gif",".png":"image/png",".json":"application/json"};

//Functions for app

function getFile(path,res,mimeType){
fs.readFile(path,function(err,contents){
if(!err){res.writeHead(200,{'Content-Type':mimeType,'Content-Length':contents.length});res.end(contents);}else{errMessage='<p class="fail">Internal Server Error</p><p>Contact the <i>Webmaster</i></p>';res.writeHead(500,{'Content-Type':'text/html','Content-Length':errMessage.length});res.end(errMessage);}
});
}

//Configuring app server
app.use(express.static(viewPath));app.use(express.bodyParser());app.use(express.json());

//Defining routes for app
app.get('/',function(req,res){getFile(indexPath,res,mimeType[".html"])});

//Starting the app server
app.listen(port);
console.log('Listening on port '+port);

//socket listeners
var io = require('socket.io').listen(3691,'127.0.0.1');

io.sockets.on('connection',function(socket){
	console.log('Received connection');
	socket.on('message_to_server',function(data){
		io.sockets.emit("message_to_client",{message: data["message"],paddle: data["paddle"]});
		console.log()
	});
})
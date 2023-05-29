var http = require('http'); //http module 호출
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHTML = require('sanitize-html');

var app = http.createServer(function(request, response) {
	var _url = request.url;
	var queryData = url.parse(_url,true).query;
	var pathname = url.parse(_url,true).pathname;
	
	if(pathname ==='/'){ //루트일 때
		if(queryData.id === undefined){ //쿼리스트링이 없을 때(홈일 때))	
			fs.readdir('./data', function(error, filelist){
				var title = "Welcome";
				var description = "Hello, Node.js";
				var list = template.list(filelist);
				var body = `
				<h2>${title}</h2>
				<p>${description}</p>
				`;
				var control = `
				<a href = "/create">create</a>						
				`;
				var html = template.HTML(title, list, body, control);
				response.writeHead(200);		
				response.end(html);						
			});			
		} else{ //쿼리스트링이 있을 때(홈이 아닐 때)
			var filteredId = path.parse(queryData.id).base;
			fs.readFile(`data/${filteredId}`, 'UTF8', function(err, description){
				fs.readdir('./data', function(error, filelist){					
					var list = template.list(filelist);
					var title = queryData.id;	
					title = sanitizeHTML(title);
					description = sanitizeHTML(description);
					
					var body = `
					<h2>${title}</h2>
					<p>${description}</p>
					`;
					var control = `
					<a href = "/update?id=${title}">update</a>
					<form action = "delete_process" method = "post">
						<input type = "hidden" name = "id" value = "${title}">
						<input type = "submit" value = "delete">
					</form>
					`;					
					var html = template.HTML(title, list, body,control);

					response.writeHead(200);				
					response.end(html);		
				});
			});	
		}
	} else if(pathname ==='/create'){
		fs.readdir('./data', function(error, filelist){
			var title = "Web-Create";
			var list = template.list(filelist);
			var body = `
			<form action = "/create_process" method = "post">
				<p><input type = "text" name = "title" placeholder = "title"></p>
				<p><textarea name = "description" placeholder = "description"></textarea>
				<p><input type = "submit"></p>
			</form>
			`;
			var html = template.HTML(title, list, body,'');
			response.writeHead(200);
			response.end(html);
		});
	} else if(pathname === '/create_process'){
		
		var body = '';
		request.on('data', function(data) {
			body += data;
			console.log(data);
		});
		request.on('end', function() {
			var post = qs.parse(body);
			var title = post.title;
			var description = post.description;
			fs.writeFile(`data/${title}`, description, 'utf8',function(err){
				response.writeHead(302, {Location: `/?id=${title}`});									
				response.end();
			});
		});
	} else if(pathname === '/update'){
		fs.readdir('./data', function(error, filelist){
			fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
				var title = queryData.id;
				var list = template.list(filelist);
				var body = `
				<form action="/update_process" method="post">
					<input type="hidden" name = "id" value = "${title}">
					<p><input type = "text" name = "title" placeholder = "title" value = "${title}"></p>
					<p>
						<textarea name = "description" placeholder = "decription">${description}</textarea>
					</p>
					<p>
						<input type="submit">
					</p>
				</form>
				`;
				var control = `
				<a href = "/create">create</a>
				<a href = "/update?id=${title}">update</a>
				`;
				var html = template.HTML(title, list, body, control);
				response.writeHead(200);
				response.end(html);
			})
		})
	} else if(pathname === '/update_process'){
		var body = "";
		request.on('data', function(data){
			body = body + data;
		});
		request.on('end', function(){
			var post = qs.parse(body);
			var id = post.id;
			var title = post.title;
			var description = post.description;
			fs.rename(`data/${id}`, `data/${title}`, function(error){
				fs.writeFile(`data/${title}`, description, 'utf8', function(err){
					response.writeHead(302, {Location: `/?id=${title}`});
					response.end();
				})
			});
		});
	} else if(pathname === '/delete_process'){
		var body = "";
		request.on("data", function(data){
			body = body + data;
		});
		request.on("end", function(){
			var post = qs.parse(body);
			var id = post.id;
			fs.unlink(`data/${id}`, function(error){
				response.writeHead(302, {Location: "/"});
				response.end();
			});			
		});

	} else{ //루트가 아닐 때
		response.writeHead(404);
		var html = `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset = 'utf-8'>
				<title>error</title>
			</head>
			<body>
				<h1>404</h1>
				<p>페이지를 찾을 수 없습니다.<p>
				<a href = "/">루트로 돌아가기</a>
			</body>
		</html>
		`
		response.end(html);
	}

});
app.listen(3000);
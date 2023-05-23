var http = require('http'); //http module 호출
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var app = http.createServer(function(request, response) {
	var _url = request.url;
	var queryData = url.parse(_url,true).query;
	var pathname = url.parse(_url,true).pathname;
	
	if(pathname ==='/'){ //루트일 때
		if(queryData.id === undefined){ //쿼리스트링이 없을 때(홈일 때))	
			fs.readdir('./data', function(error, filelist){
				var title = "Welcome";
				var description = "Hello, Node.js";
				var list = templateList(filelist);
				var body = `
				<h2>${title}</h2>
				<p>${description}</p>
				`;
				var control = `
				<a href = "/create">create</a>						
				`;
				var template = templateHTML(title, list, body, control);
				response.writeHead(200);		
				response.end(template);						
			});			
		} else{ //쿼리스트링이 있을 때(홈이 아닐 때)
			fs.readFile(`data/${queryData.id}`, 'UTF8', function(err, description){
				fs.readdir('./data', function(error, filelist){
					var title = "Welcome";
					var list = templateList(filelist);
					var title = queryData.id;	
					var body = `
					<h2>${title}</h2>
					<p>${description}</p>
					`;
					var control = `
					<a href = "/update?id=${title}">update</a>
					`;					
					var template = templateHTML(title, list, body,control);

					response.writeHead(200);				
					response.end(template);		
				});
			});	
		}
	} else if(pathname ==='/create'){
		fs.readdir('./data', function(error, filelist){
			var title = "Web-Create";
			var list = templateList(filelist);
			var body = `
			<form action = "https://node-js-practice-fqcyc.run.goorm.site/create_process" method = "post">
				<p><input type = "text" name = "title" placeholder = "title"></p>
				<p><textarea name = "description" placeholder = "description"></textarea>
				<p><input type = "submit"></p>
			</form>
			`;
			var template = templateHTML(title, list, body,'');
			response.writeHead(200);
			response.end(template);
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
	} else if(pathname === 'update'){
		
	} else{ //루트가 아닐 때
		response.writeHead(404);
		var template = `
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
		response.end(template);
	}

});
app.listen(3000);

function templateHTML(title, list, body, control){	
	return `
	<!DOCTYPE html>
	<html>
		<head>
			<title>WEB: ${title}</title>
			<meta charset = 'utf-8'>
		</head>
		<body>
			<h1><a href = "/">WEB</a></h1>
			${list}
			${control}
			${body}
		</body>
	</html>
	`;	
}

function templateList(filelist){
	list = '<ul>'
	for(var i = 0; i<filelist.length; i++){
		list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
	}
	list += '</ul>';
	return list;
}
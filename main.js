var http = require('http'); //http module 호출
var fs = require('fs');
var url = require('url');

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
				var template = templateHTML(title, list, body);
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
					var template = templateHTML(title, list, body);

					response.writeHead(200);		
					response.end(template);		
				});
			});	
		}
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

function templateHTML(title, list, body){	
	return `
	<!DOCTYPE html>
	<html>
		<head>
			<title>WEB1 = ${title}</title>
			<meta charset = 'utf-8'>
		</head>
		<body>
			<h1><a href = "/">WEB</a></h1>
			${list}
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
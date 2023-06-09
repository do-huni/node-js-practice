var template = {
	HTML: function(title, list, body, control){
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
	},
	list: function(filelist){
		var list = '<ul>';
		for(var i = 0; i<filelist.length; i++){
			list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
		}
		list += '</ul>';
		return list;		
	}
};
module.exports = template;
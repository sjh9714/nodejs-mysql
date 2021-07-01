var http = require('http');
var qs = require('querystring');
var topic = require('./lib/topic');
var author = require('./lib/author');

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryDataId = new URL('http://localhost:3000' + _url).searchParams.get('id');
    var pn = new URL('http://localhost:3000' + _url);
    if (pn.pathname === '/') {
        if (queryDataId === null) {
            topic.home(request, response);
        } else {
            topic.page(request, response);
        }
    } else if (pn.pathname === '/create') {
        topic.create(request, response);
    } else if (pn.pathname === '/create_process') {
        topic.create_process(request, response);
    } else if (pn.pathname === '/update') {
        topic.update(request, response);
    } else if (pn.pathname === '/update_process') {
        topic.update_process(request, response);
    } else if (pn.pathname === '/delete_process') {
        topic.delete_process(request, response);
    } else if (pn.pathname === '/author') {
        author.home(request, response);
    } else if (pn.pathname === '/author/create_process') {
        author.create_process(request, response);
    } else if (pn.pathname === '/author/update') {
        author.update(request, response);
    } else if (pn.pathname === '/author/update_process') {
        author.update_process(request, response);
    } else if (pn.pathname === '/author/delete_process') {
        author.delete_process(request, response);
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);

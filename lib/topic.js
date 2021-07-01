var db = require('./db');
var qs = require('querystring');
var template1 = require('./template.js');
var sanitizeHtml = require('sanitize-html');

exports.home = function (request, response) {
    db.query(`SELECT * FROM topic`, function (error, topics) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template1.list(topics);
        var html = template1.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
    });
};

exports.page = function (request, response) {
    var _url = request.url;
    var queryDataId = new URL('http://localhost:3000' + _url).searchParams.get('id');
    db.query(`SELECT * FROM topic`, function (error, topics) {
        if (error) {
            throw error;
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryDataId], function (error2, topic) {
            if (error2) {
                throw error2;
            }
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template1.list(topics);
            var html = template1.HTML(
                title,
                list,
                `<h2>${sanitizeHtml(title)}</h2>
                ${sanitizeHtml(description)}
                <p>by ${sanitizeHtml(topic[0].name)}</p>`,
                ` <a href="/create">create</a>
                <a href="/update?id=${queryDataId}">update</a>
                <form action="delete_process" method="post">
                    <input type="hidden" name="id" value="${queryDataId}">
                    <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
        });
    });
};
exports.create = function (request, response) {
    db.query(`SELECT * FROM topic`, function (error, topics) {
        db.query('SELECT * FROM author', function (error2, authors) {
            var title = 'Create';
            var list = template1.list(topics);
            var html = template1.HTML(
                sanitizeHtml(title),
                list,
                `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                ${template1.authorSelect(authors)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
                `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        });
    });
};
exports.create_process = function (request, response) {
    var body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        var post = qs.parse(body);
        db.query(
            `
            INSERT INTO topic (title, description, created, author_id) 
                VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, 1],
            function (error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/?id=${result.insertId}` });
                response.end();
            }
        );
    });
};

exports.update = function (request, response) {
    var _url = request.url;
    var queryDataId = new URL('http://localhost:3000' + _url).searchParams.get('id');
    db.query('SELECT * FROM topic', function (error, topics) {
        if (error) {
            throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [queryDataId], function (error2, topic) {
            if (error2) {
                throw error2;
            }
            db.query('SELECT * FROM author', function (error2, authors) {
                var list = template1.list(topics);
                var html = template1.HTML(
                    sanitizeHtml(topic[0].title),
                    list,
                    `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
                <p>
                  <textarea name="description" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea>
                </p>
                <p>
                  ${template1.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
                    `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    });
};
exports.update_process = function (request, response) {
    var body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        var post = qs.parse(body);
        db.query('UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?', [post.title, post.description, post.id], function (error, result) {
            response.writeHead(302, { Location: `/?id=${post.id}` });
            response.end();
        });
    });
};
exports.delete_process = function (request, response) {
    var body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        var post = qs.parse(body);
        db.query('DELETE FROM topic WHERE id = ?', [post.id], function (error, result) {
            if (error) {
                throw error;
            }
            response.writeHead(302, { Location: `/` });
            response.end();
        });
    });
};
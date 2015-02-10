var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

var id = 0;
var books = {};

app.post('/books/update', function (req, res) {
  var changeset = req.body;

  changeset.create = changeset.create.map(function (model) {
    model.id = ++id;
    books[model.id] = model;
    return model;
  });

  changeset.update = changeset.update.map(function (model) {
    books[model.id] = model;
    return model;
  });

  changeset.delete = changeset.delete.forEach(function (model) {
    delete books[model.id];
  });

  res.json(changeset);
});

app.get('/books', function (req, res) {
  res.json(Object.keys(books).map(function (id) {
    return books[id];
  }));
});

app.get('/books/:id', function (req, res) {
  var id = parseInt(req.params.id, 10);
  res.json(books[id]);
});

app.post('/books', function (req, res) {
  var book = req.body;
  book.id = ++id;
  books[book.id] = book;
  res.json(book);
});

app.put('/books/:id', function (req, res) { 
  var id = parseInt(req.params.id, 10);
  books[id] = req.body;
  res.json(books[id]);
});

app.delete('/books/:id', function (req, res) {
  var id = parseInt(req.params.id, 10);
  delete books[id];
  res.json(null);
});

app.get('*', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});


app.listen(3000);

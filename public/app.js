var Book = Backbone.Model.extend({
  defaults: {
    chapters: 5,
    current: 1
  },
  parse: function (res) {
    console.log(res);
    return res;
  },
  validate: function (attrs) {
    if (attrs.published && typeof attrs.published !== 'number') {
      return '`published` should be a number';
    }
  },
  read: function () {
    var curr = this.get('current');
    if (curr < this.get('chapters')) {
      this.set('current', curr + 1);
    }
  },
  isFinished: function () {
    return this.get('chapters') === this.get('current');
  }
});

var Books = Backbone.Collection.extend({
  model: Book,
  url: '/books'
});

var BookView = Backbone.View.extend({
  template: _.template($("#BookViewTemplate").html()),
  tagName: 'li',
  events: {
    'click .remove' : 'removeModel',
    'click .edit': 'editModel'
  },
  render: function () {
    this.el.innerHTML = this.template(this.model.toJSON()); 
    return this;
  },
  removeModel: function (evt) {
    this.model.destroy();
  },
  editModel: function (evt) {
    Backbone.history.navigate('edit/' + this.model.id, { trigger: true });
  }
});

var BooksView = Backbone.View.extend({
  initialize: function () {
    this.listenTo(this.collection, 'remove', this.removeBook); 
    this.listenTo(this.collection, 'add', this.addBook);

    this.listenTo(this.collection, 'remove', this.updateNumber);
    this.listenTo(this.collection, 'add', this.updateNumber);
  },
  events: {
    'click .nav': 'handleClick' 
  },
  template: _.template($("#BooksViewTemplate").html()), 
  children: {},
  render: function () {
    this.el.innerHTML = this.template(this.collection);
    this.collection.each(this.addBook.bind(this));
    return this;
  },
  addBook: function (model) {
    this.children[model.cid] = new BookView({ model: model });
    this.$('ul').append(this.children[model.cid].render().el);
  },
  removeBook: function (model) {
    this.children[model.cid].remove();
  },
  updateNumber: function () {
    this.$('span').text(this.collection.length);
  },
  handleClick: function (evt) {
    Backbone.history.navigate(evt.target.getAttribute('href'), { trigger: true });
    evt.preventDefault();
  }
});

var AddBookView = Backbone.View.extend({
  template: _.template($("#AddBookViewTemplate").html()), 
  events: {
    'click .add' : 'addBook' 
  },
  render: function () {
    this.el.innerHTML = this.template(); 
    return this;
  },
  addBook: function (evt) { 
    this.collection.create({
      title: this.$('#title').val(),
      author: this.$('#author').val()
    });
    Backbone.history.navigate('', { trigger: true });
  }
});

var EditBookView = Backbone.View.extend({
  template: _.template($("#EditBookViewTemplate").html()), 
  events: {
    'click .update': 'updateModel'
  },
  render: function () {
    this.el.innerHTML = this.template(this.model.toJSON());
    return this;
  },
  updateModel: function (evt) {
    this.model.save({
      title: this.$('#title').val(),
      author: this.$('#author').val()
    });
    Backbone.history.navigate('', { trigger: true });
  }
});

var BookRouter = Backbone.Router.extend({
  initialize: function (opts) {
    this.books = opts.books; 
  },
  routes: {
    '': 'list',
    'add': 'add',
    'edit/:id': 'edit'
  },
  list: function () {
    var booksView = new BooksView({ collection: this.books });
    $("#main").empty().append(booksView.render().el);
  },
  add: function (id) {
    var addBookView = new AddBookView({ collection: this.books });
    $("#main").empty().append(addBookView.render().el);
  },
  edit: function (id) {
    id = parseInt(id, 10);
    var editBookView = new EditBookView({ model: this.books.get(id) });
    $("#main").empty().append(editBookView.render().el);
  }
});

var books = new Books();

books.fetch().then(function () {
  var router = new BookRouter({
    books: books 
  });
  Backbone.history.start({ pushState: true });
});

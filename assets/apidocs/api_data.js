define({ "api": [
  {
    "type": "post",
    "url": "/api/books",
    "title": "Add a new book",
    "name": "createBook",
    "group": "BookResource",
    "description": "<p>Add a new book</p> ",
    "version": "1.0.0",
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "type": "String",
            "optional": false,
            "field": "location",
            "description": "<p>The location of the book; sent in header</p> "
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"isbn\":null,\n  \"title\":\"Romeo and Juliet\",\n  \"author\":\"William Shakespeare\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "/Users/admin/Work/Repos/book-inventory-boot/src/main/java/org/talangsoft/bookinventory/web/BookResource.java",
    "groupTitle": "BookResource"
  },
  {
    "type": "get",
    "url": "/api/books",
    "title": "Find all books",
    "name": "getAll",
    "group": "BookResource",
    "description": "<p>Find all books</p> ",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "List",
            "optional": false,
            "field": "books",
            "description": "<p>The books in the database</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n      \"isbn\":\"isbn1235\",\n      \"title\":\"Romeo and Juliet\",\n      \"author\":\"William Shakespeare\"\n    },\n    {\n      \"isbn\":\"isbn1236\",\n      \"title\":\"Kill a Mockingbird\",\n      \"author\":\"Harper lee\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "/Users/admin/Work/Repos/book-inventory-boot/src/main/java/org/talangsoft/bookinventory/web/BookResource.java",
    "groupTitle": "BookResource"
  },
  {
    "type": "get",
    "url": "/api/books/?author={author}",
    "title": "Find books by author",
    "name": "getByAuthor",
    "group": "BookResource",
    "description": "<p>Retrieve books by author</p> ",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "author",
            "description": "<p>The author of the book</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "List",
            "optional": false,
            "field": "books",
            "description": "<p>The books of the given author</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n      \"isbn\":\"isbn1236\",\n      \"title\":\"To Kill a Mockingbird\",\n      \"author\":\"Harper lee\"\n    },\n    {\n      \"isbn\":\"isbn1237\",\n      \"title\":\"Resurrect a Mockingbird\",\n      \"author\":\"Harper lee\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "400": [
          {
            "group": "400",
            "optional": false,
            "field": "UrlEncodingNotSupported",
            "description": "<p>The url encoding was not supported</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Not found\n{\"errorCode\":\"URL_ENCODING_NOT_SUPPORTED\",\n \"errorMessage\":\"Url encoding not supported.\",\n \"params\":{\n  \"text\":\"...\"\n }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "/Users/admin/Work/Repos/book-inventory-boot/src/main/java/org/talangsoft/bookinventory/web/BookResource.java",
    "groupTitle": "BookResource"
  },
  {
    "type": "get",
    "url": "/api/books/{isbn}",
    "title": "Get book by isbn code",
    "name": "getByIsbn",
    "group": "BookResource",
    "description": "<p>Get a book by isbn</p> ",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "isbn",
            "description": "<p>The isbn that identifies the book</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "BookDTO",
            "optional": false,
            "field": "book",
            "description": "<p>The book for the isbn</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n    {\n      \"isbn\":\"isbn1236\",\n      \"title\":\"To Kill a Mockingbird\",\n      \"author\":\"Harper lee\"\n    }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "BookNotFound",
            "description": "<p>The book was not found</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not found\n{\"errorCode\":\"BOOK_NOT_FOUND\",\n \"errorMessage\":\"The book was not found.\",\n \"params\":{\n  \"isbn\":\"not-existing-isbn\"\n }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "/Users/admin/Work/Repos/book-inventory-boot/src/main/java/org/talangsoft/bookinventory/web/BookResource.java",
    "groupTitle": "BookResource"
  },
  {
    "type": "get",
    "url": "/api/books/?title={title}",
    "title": "Find books by title",
    "name": "getByTitle",
    "group": "BookResource",
    "description": "<p>Retrieve books by title</p> ",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>The title of the book</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "List",
            "optional": false,
            "field": "books",
            "description": "<p>The books with the given title</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n      \"isbn\":\"isbn1236\",\n      \"title\":\"To Kill a Mockingbird\",\n      \"author\":\"Harper lee\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "400": [
          {
            "group": "400",
            "optional": false,
            "field": "UrlEncodingNotSupported",
            "description": "<p>The url encoding was not supported</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Not found\n{\"errorCode\":\"URL_ENCODING_NOT_SUPPORTED\",\n \"errorMessage\":\"Url encoding not supported.\",\n \"params\":{\n  \"text\":\"...\"\n }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "/Users/admin/Work/Repos/book-inventory-boot/src/main/java/org/talangsoft/bookinventory/web/BookResource.java",
    "groupTitle": "BookResource"
  },
  {
    "type": "put",
    "url": "/api/books/isbn",
    "title": "Update  book",
    "name": "updateBook",
    "group": "BookResource",
    "description": "<p>Update the book with the given isbn</p> ",
    "version": "1.0.0",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"isbn\":null,\n  \"title\":\"Romeo and Juliet\",\n  \"author\":\"William Shakespeare\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "BookNotFound",
            "description": "<p>The book was not found</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not found\n{\"errorCode\":\"BOOK_NOT_FOUND\",\n \"errorMessage\":\"The book was not found.\",\n \"params\":{\n  \"isbn\":\"not-existing-isbn\"\n }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "/Users/admin/Work/Repos/book-inventory-boot/src/main/java/org/talangsoft/bookinventory/web/BookResource.java",
    "groupTitle": "BookResource"
  }
] });
---
layout: post
title: Microservice Module Architecture with Spring boot
---

## Microservice modules
<blockquote>
<p>
A microservice architecture is the natural consequence of applying the single responsibility principle at the architectural level.<br/>
This results in a number of benefits over a traditional monolithic architecture such as independent deployability,
language, platform and technology independence for different components, distinct axes of scalability
and increased architectural flexibility.
</p>
</blockquote>
(From: <a href="http://www.martinfowler.com/articles/microservice-testing/#definition" target="_blank">Martin Fowler:    microservice testing</a>).

![placeholder]({{ site.url }}/assets/module_architecture.png "Module Architecture")

## Book Inventory app
The Spring implementation is presented in a minimalist book inventory app.
This app offers basic CRUD functionality and some search functionality for handling books via book title and author.<br/>
The book entities are persisted in an underlying SQL database (in memory) for the sake of simplicity.
On the creation of a new Book it is registered via an imaginary 3rd party "register book" endpoint returning with an isbn number.

The full source is available in <a href="https://github.com/tamaslang/book-inventory-boot" target="_blank">book-inventory-boot</a> repository

The book inventory app relies on my rest-devtools library,
mentioned in a previous <a href="2015/02/16/rest-devtools-introduction/" target="_blank">blog post</a>.<br/>
Classes, Interfaces like Loggable, DTO, CommonGateway are all coming from the library.

![placeholder]({{ site.url }}/assets/book_inventory_app.png "Book inventory")

The layers presented in the module architecture present in the Spring application as the following:

## Resource:
Spring allows easy rest endpoint definition in @RestControllers.
In the example the "GET" action is defined on /api/book/{isbn} which expects isbn as a path parameter and in case of success a JSON object is returned and a 200OK status.

{% highlight java %}
@RestController
@RequestMapping("/api/books")
public class BookResource implements Loggable{

    @Autowired
    BookService bookService;

    @RequestMapping(value = "/{isbn}",
            method = RequestMethod.GET,
            produces = APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public BookDTO getByIsbn(@PathVariable String isbn) {
        logger().info("Find book by isbn '{}'",isbn);
        return bookService.findByIsbn(isbn);
    }

    /** more endpoint definitions **/

}
{% endhighlight %}

## Service:
In the service the gateway and the repo are injected.
A mapping also happens here as we have a Book domain which is the JPA annotated ORM and we need to transform it to our Domain, called BookDTO.
The mapping is done with a lightweight java 8 function reference,
the same example is used in another <a href="/2015/02/19/model-mapping-with_java8/" target="_blank">blog post</a>.

{% highlight java %}
@Service
public class BookServiceImpl implements Loggable, BookService {

    @Autowired
    IsbnGateway isbnGateway;

    @Autowired
    BookRepository bookRepo;

    private Function<Book,BookDTO> bookToBookDTO = new Function<Book, BookDTO>() {
        public BookDTO apply(Book book) { return new BookDTO(book.getIsbn(), book.getTitle(),book.getAuthor());}
    };

    private BiFunction<String, BookDTO, Book> bookDTOToBook = new BiFunction<String, BookDTO, Book>() {
        public Book apply(String isbn, BookDTO bookDTO) { return new Book(isbn,bookDTO.getTitle(),bookDTO.getAuthor());}
    };

    @Override
    @Transactional
    public String createNew(BookDTO bookDTO){
        logger().debug("Create new book {}",bookDTO);
        String isbn = isbnGateway.registerBook(bookDTO);
        bookRepo.save( bookDTOToBook.apply(isbn, bookDTO));
        return isbn;
    }

    @Override
    public BookDTO findByIsbn(String isbn){
        logger().debug("Find by isbn '{}'",isbn);
        Book retrievedBook = bookRepo.findByIsbn(isbn);
        if(retrievedBook == null){
            throw new RestException(RestErrors.BOOK_NOT_FOUND.toRestError(),
                    RestUtils.createParams(PNV.toPNV("isbn",isbn)));
        }
        return bookToBookDTO.apply(retrievedBook);

    }

    /** more service definition **/

}
{% endhighlight %}

## Repository:
The repository is powered by Spring Data. This means basic CRUD-like operations are supported out of the box,
and for most of the functionality we need no repository implementation is needed as Spring manages to translate method names into queries.
See: <a href="http://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods.query-creation" target="_blank">Supported keywords inside method names</a>

{% highlight java %}
public interface BookRepository extends JpaRepository<Book,String> {
    /* inherited:
     * List<T> findAll();
     * T getOne(ID var1);
     * etc...*/

    List<Book> findByAuthor(String author);
    List<Book> findByTitleLike(String title);
}
{% endhighlight %}

## Domain:
Having a small module we can afford our inner domain to be also what we are exposing via the Rest services.
A book entity might anyway have several representations, let's say this one is a book summary containing only some basic data.<br/>
Implemented as an immutable data object.

{% highlight java %}
public class BookDTO extends DTO{
    private String isbn;
    private String title;
    private String author;

    @JsonCreator
    public BookDTO(@JsonProperty("isbn") String isbn,
                   @JsonProperty("title") String title,
                   @JsonProperty("author") String author) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
    }

    public String getIsbn() {
        return isbn;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

}
{% endhighlight %}

## Gateway:
As our module needs to communicate with an external service we hide that external service details behind a gateway.
The gateway is inherited form a Gateway common class (rest-devtools). The spring restTemplate is @Autowired in the parent class,
also convenient methods for Rest operations are defined there.
Here

{% highlight java %}
@Service
public class IsbnGateway extends GatewayCommon {

    public static final String ISBN_GATEWAY_ENDPOINT = "http://some_3rd_party_org/api/register";

    public String registerBook(BookDTO book) {
        return genericPost(ISBN_GATEWAY_ENDPOINT, book, String.class);
        // real call in gateway common:
        // return getRestTemplate().postForEntity("http://some_3rd_party_org/api/register", book, String.class);
    }

}
{% endhighlight %}

## Data mapping (ORM):
The data mapping contains a plain JPA annotated class representing a book and using isbn as id.

{% highlight java %}
@Entity
@Table(name = "book")
public class Book {

    @Id
    @Column(name = "isbn")
    private String isbn;
    @Column(name = "title")
    private String title;
    @Column(name = "author")
    private String author;

/*..*/
}
{% endhighlight %}


## Summary
In this blog you saw a possible modularisation and layering of a simple application with Spring boot.
There are many different ways to structure an app, some people would not define service interface,
some might access the repository directly from the resource layer
or even not converting from JPA entity to another model (DTO) at all (I would not recommend that though).
This is just a way I structure it, and usually it works well for me, especially when a module starting to grow.

In an upcoming post I will go into details of behaviour driven testing of the book inventory endpoints.

Browse the full source, available in <a href="https://github.com/tamaslang/book-inventory-boot" target="_blank">book-inventory-boot</a> repository.

T.

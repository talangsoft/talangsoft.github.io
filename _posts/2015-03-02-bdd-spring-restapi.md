---
layout: post
title: Behaviour driven REST API development with Spring
tags:
- cucumber
- gherkin
- springboot
- java
- REST API
---
### The case
Bob was sitting desperately in front of a bunch of failing JUnit tests intended to verify the part of the application he just refactored.<br/>
The one who wrote them - to be honest it could have been any of us at a certain stage of our life - had the idea that JUnit is
somewhat different from production Java:
there is no need for code conventions, clean code, comments or whatever that could make the maintainer's life easier.<br/>

Well, Bob spending the past twenty minutes of his life reverse engineering the code, silently looked around,
realised that nobody is watching him and put a sad @Ignore annotation before a test.
He was thinking about removing the tests, but he just didn't want to hurt the inner feelings of any fellow developer.

### BDD is here to help
Behaviour Driven Development was introduced by Dan North back in 2003.<br/>
BDD focuses on obtaining a clear understanding of desired software behavior through writing test cases in a natural language
that non-programmers can read:

<blockquote>
<p>
Given some initial context,<br/>
When an event occurs,<br/>
Then ensure some outcomes.
</p>
</blockquote>

It proved to be really useful in the following topics:
<ul>
    <li>test definitions can serve as functional documentations</li>
    <li>writing test first is easier</li>
    <li>better APIs come from writing testable code</li>
    <li>help maintainers understand the intention behind the code</li>
    <li>defining test steps involves having fewer parts to change (low duplication)</li>
    <li>etc...</li>
</ul>

### Integration test
In the integration tests it needs to be verified that all of the code works correctly,
all of the combined code units work well in their environment and the module is ready to be integrated
with external systems and resources.<br/>
The external connections should be mocked for these tests to cut the dependencies and to avoid side effects of the tests.<br/>
I reuse the component structure <a href="{{ site.url }}//2015/02/21/module_architecture/" target="_blank">from the previous post</a> and mark the mocked components with orange:
![placeholder]({{ site.url }}/assets/integration_testing.png "Integration Testing")

### Rest API
Defining a REST API as application interface is what everybody is doing nowadays, it comes with certain benefits:
<ul>
    <li>simplifies a very complex functionality around resources</li>
    <li>reduces client server coupling</li>
    <li>provides stateless communication</li>
    <li>is easy to use / implement</li>
    <li>etc...</li>
</ul>

As the provided REST interface will be the one which determines the behaviour of the application towards a consumer.

So why not BDD it?

## Example in book inventory app
For my example <a href="https://github.com/tamaslang/book-inventory-boot" target="_blank">book inventory app</a> I implemented automatic behaviour driven tests
 to verify the REST APIs in a full application context embedded into Spring's
<a href="http://docs.spring.io/spring/docs/3.2.x/spring-framework-reference/html/testing.html#spring-mvc-test-framework" target="_blank">Mock MVC</a>.<br/>
I set up a full application context but mocked the RestTemplate to cut external service calls and used an in memory (hsql) db.

Under the hood <a href="https://cukes.info/" target="_blank">Cucumber</a> library provides the framework for defining the expected behaviour.
The testcases are using Cucumber's plain text DSL:
<a href="https://github.com/cucumber/cucumber/wiki/Gherkin" target="_blank">Gherkin</a> and defining given-when-then steps for the scenarios.
<blockquote>
<p>
Gherkin is a business readable, Domain Specfic DSL that lets you describe software's behaviour without detailing how that behaviour is implemented.
</p>
</blockquote>

The REST API tests are located under src/test/rest/resources/bookinventory/integration folder as .feature files.<br/>
Running them are part of the JUnit execution that is hooked by BookInventoryIntegrationTest.java
to execute all the features annotated with @restApiIntegration.

{% highlight java %}
@RunWith(Cucumber.class)
@CucumberOptions(features = "classpath:bookinventory.integration",
        tags = {"@restApiIntegration", "~@ignore"},
        format = {"html:target/cucumber-report/bookInventoryIntegration",
                "json:target/cucumber-report/bookInventoryIntegration.json"})
public class BookInventoryIntegrationTest {
}

{% endhighlight %}

Common step definitions are defined to verify the REST calls in <strong>CommonRestCallStepDefs.java</strong>.

{% highlight java %}
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = Application.class, loader = SpringApplicationContextLoader.class)
@WebAppConfiguration
public class CommonRestCallStepDefs {

    @Autowired
    private volatile WebApplicationContext webApplicationContext;

    private volatile MockMvc mockMvc;

    @Given("^the web context is set$")
    public void givenServerIsUpAndRunning() {
        this.mockMvc = webAppContextSetup(this.webApplicationContext).build();
    }

    @When("^client request GET ([\\S]*)$")
    public void performGetOnResourceUri(String resourceUri) throws Exception {
        resultActions = this.mockMvc.perform(get(resourceUri).headers(httpHeaders));
    }
    /*...*/
}
{% endhighlight %}
<a href="https://github.com/tamaslang/book-inventory-boot/blob/master/src/test/java/org/talangsoft/bookinventory/integration/CommonRestCallStepDefs.java"
  target="_blank">Full source</a>.

The book inventory business specific test steps are defined in <strong>BookInventoryStepDefs.java</strong>.

{% highlight java %}
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = Application.class, loader = SpringApplicationContextLoader.class)
@WebAppConfiguration
public class BookInventoryStepDefs {
    /*...*/
    @Given("^the following books exist:$")
    public void createBooks(DataTable books) throws Throwable {
        List<Book> bookList = books.asList(Book.class);
        bookRepo.save(bookList);
    }

  /*...*/
}
{% endhighlight %}

<a href="https://github.com/tamaslang/book-inventory-boot/blob/master/src/test/java/org/talangsoft/bookinventory/integration/BookInventoryStepDefs.java"
  target="_blank">Full source</a>.

{% highlight java %}
@RunWith(Cucumber.class)
@Cucumber.Options(features = "classpath:rest.api.integration",
        tags = {"@restApiIntegration", "~@ignore"},

        format = {"html:target/cucumber-report/restApiIntegration",
                "json:target/cucumber-report/restApiIntegration.json"})
public class APITest {
}
{% endhighlight %}

## REST API testcase definitions

The testcases for the book inventory resource are defined in the <strong>BookInventoryIntegrationTest.feature</strong> file.

#### Test: Create a book
{% highlight gherkin %}
  Scenario: create a book
    Given the web context is set
    Given the db is empty
    Given the isbn gateway is mocked to success
    When client request POST /api/books with json data:
    """
    {"isbn":null,"title":"my book","author":"me"}
    """
    Then the response code should be 201
    Then the following header should present "Location" with value "http://localhost/api/books/isbn1234"
{% endhighlight %}

#### Test: Find a book by isbn
{% highlight gherkin %}
  Scenario: find by isbn
    Given the web context is set
    Given the db is empty
    Given the following books exist:
    | isbn     | title                 |  author              |
    | isbn1234 | Hamlet                |  William Shakespeare |
    | isbn1235 | Romeo and Juliet      |  William Shakespeare |
    | isbn1236 | To Kill a Mockingbird |  Harper lee          |
    When client request GET /api/books/isbn1236
    Then the response code should be 200
    Then the result json should be:
    """
    {"isbn":"isbn1236","title":"To Kill a Mockingbird","author":"Harper lee"}
    """
{% endhighlight %}

#### Test: Find a book by a not existing isbn
{% highlight gherkin %}
  Scenario: find by isbn -> no result
    Given the web context is set
    Given the db is empty
    When client request GET /api/books/not-existing-isbn
    Then the response code should be 404
    Then the result json should be:
    """
    {"errorCode":"BOOK_NOT_FOUND","errorMessage":"The book was not found.","params":{"isbn":"not-existing-isbn"}}
    """
{% endhighlight %}

#### Test: Find a book by author
{% highlight gherkin %}
  Scenario: find by author
    Given the web context is set
    Given the db is empty
    Given the following books exist:
    | isbn     | title                 |  author              |
    | isbn1234 | Hamlet                |  William Shakespeare |
    | isbn1235 | Romeo and Juliet      |  William Shakespeare |
    | isbn1236 | To Kill a Mockingbird |  Harper lee          |
    When client request GET /api/books?author=William%20Shakespeare
    Then the response code should be 200
    Then the result json should be:
    """
    [
     {"isbn":"isbn1234","title":"Hamlet","author":"William Shakespeare"},
     {"isbn":"isbn1235","title":"Romeo and Juliet","author":"William Shakespeare"}
    ]
    """
{% endhighlight %}

#### Test: Find a book by title
{% highlight gherkin %}
  Scenario: find by title
    Given the web context is set
    Given the db is empty
    Given the following books exist:
    | isbn     | title                 |  author              |
    | isbn1234 | Hamlet                |  William Shakespeare |
    | isbn1235 | Romeo and Juliet      |  William Shakespeare |
    | isbn1236 | To Kill a Mockingbird |  Harper lee          |
    When client request GET /api/books?title=Romeo%20and%20Juliet
    Then the response code should be 200
    Then the result json should be:
    """
    [{"isbn":"isbn1235","title":"Romeo and Juliet","author":"William Shakespeare"}]
    """
{% endhighlight %}

#### Test: Find all books
{% highlight gherkin %}
  Scenario: find all
    Given the web context is set
    Given the db is empty
    Given the following books exist:
    | isbn     | title                 |  author              |
    | isbn1234 | Hamlet                |  William Shakespeare |
    | isbn1235 | Romeo and Juliet      |  William Shakespeare |
    | isbn1236 | To Kill a Mockingbird |  Harper lee          |
    When client request GET /api/books
    Then the response code should be 200
    Then the result json should be:
    """
    [
     {"isbn":"isbn1234", "title":"Hamlet","author":"William Shakespeare"},
     {"isbn":"isbn1235", "title":"Romeo and Juliet","author":"William Shakespeare"},
     {"isbn":"isbn1236", "title":"To Kill a Mockingbird","author":"Harper lee"}
    ]
    """
{% endhighlight %}

#### Test: Create a book
{% highlight gherkin %}
  Scenario: create a book gateway error
    Given the web context is set
    Given the db is empty
    Given the isbn gateway is mocked to error
    When client request POST /api/books with json data:
    """
    {"isbn":null,"title":"my book","author":"me"}
    """
    Then the response code should be 500
    Then the result json should be:
    """
    {
     "errorCode":"GENERAL_GATEWAY_ERROR",
     "errorMessage":"Internal Server Error",
     "params":{"statusText":"Internal Server Error","message":"500 Internal Server Error"}
    }
    """
{% endhighlight %}

## Summary
Behaviour driven integration testing of the REST API helps in rapid application development, facilitates test driven and
contract first interface design. Using the described approach makes it really quick to verify the REST endpoints and application context set up.

See the full source code <a href="https://github.com/tamaslang/book-inventory-boot" target="_blank">on my github </a>.

T.

##Further reading:
<a href="http://dannorth.net/introducing-bdd/">Introducing BDD</a><br/>
<a href="http://gojko.net/2015/02/25/how-to-get-the-most-out-of-given-when-then/" target="_blank">How to get the most out of Given-When-Then</a><br/>
<a href="https://github.com/cucumber/cucumber/wiki/Gherkin" target="_blank">Gherkin reference</a><br/>
<a href="http://zsoltfabok.com/blog/2012/09/cucumber-jvm-web-with-spring-mvc/" target="_blank">Cucumber JVM: Web Application with Spring MVC</a><br/>
<a href="http://martinfowler.com/bliki/GivenWhenThen.html">Given When Then</a>

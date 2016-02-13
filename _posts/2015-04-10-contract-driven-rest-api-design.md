---
layout: post
title: Contract Driven REST API Design
author_name: Tamas Lang
author_email: tamas.lang@talangsoft.org
author_initials: TL

tags:
- rest
- contract driven
- restapi

description: '<a href="http://apidocjs.com/" target="_blank">Apidoc.js</a> is a great inline documentation tool for RESTful web APIs.<br/>
             It goes really well with Spring REST applications, you just define your API documentation as inline comments in your classes
             and execute the <b>apidoc</b> command to parse the source files
             and generate a static HTML documentation out of them.'

---

### Introduction
<a href="http://apidocjs.com/" target="_blank">Apidoc.js</a> is a great inline documentation tool for RESTful web APIs.<br/>
It goes really well with Spring REST applications, you just define your API documentation as inline comments in your classes
and execute the <b>apidoc</b> command to parse the source files
and generate a static HTML documentation out of them.

![placeholder]({{ site.url }}/assets/apidoc_html_generation.png "Apidoc html generation")

With this lightweight technology it is easy to follow a contract driven REST API design that I found really
useful in my past project. <br/>
The process we followed was to design the API for the resource, document the API using the Apidoc annotations
and generate a HTML documentation out of it.<br/>
The generated documentation was then published to a server and before starting the implementation we reviewed it
together with fellow team members and other possible customers of the future API.<br/>
The implementation could only begin when the API was reviewed, adjusted and accepted.

![placeholder]({{ site.url }}/assets/api_design_process.png "Api design process")

### Installation
To install Apidoc you need npm package manager to be installed first. <br/>
Assume you are using mac with <a href="http://brew.sh/" target="_blank">brew</a> it goes as easy as:

{% highlight sh %}
brew install npm
{% endhighlight %}

After the successful installation the npm command should work in the terminal giving you the "usage..." page.<br/>
Npm installation guide can be found here:
<a href="http://blog.nodeknockout.com/post/65463770933/how-to-install-node-js-and-npm" target="_blank">node &amp; npm</a>

###Configure Apidoc

Apidoc needs to be configured by creating an apidoc.json file in your project root directory.

{% highlight json %}
{
  "name": "Book Invetory REST API",
  "version": "1.0.0",
  "description": "Rest API for book-inventory-boot app",
  "title": "Book Inventory Rest API",
  "url" : "http://www.talangsoft.org/book-inventory-boot"
}
{% endhighlight %}
### Configure Maven
To generate the documentation you need to configure maven to execute the apidoc command.
The minimum configuration for apidoc command execution requires configuring the input and output folders.

 {% highlight xml %}
     <plugins>
             <plugin>
                 <groupId>org.codehaus.mojo</groupId>
                 <artifactId>exec-maven-plugin</artifactId>
                 <executions>
                     <execution>
                         <phase>site</phase>
                         <goals>
                             <goal>exec</goal>
                         </goals>
                     </execution>
                 </executions>
                 <configuration>
                     <executable>apidoc</executable>
                     <arguments>
                         <argument>-i</argument>
                         <argument>${project.basedir}/src/main/java/</argument>
                         <argument>-o</argument>
                         <argument>${project.build.directory}/apidocs/</argument>
                     </arguments>
                 </configuration>
             </plugin>
     </plugin>
 {% endhighlight %}

 You also need maven reports plugin to generate reports as part of the site phase.

 {% highlight xml %}
    <reporting>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-project-info-reports-plugin</artifactId>
                <version>${maven.reports.plugin.version}</version>
                <reportSets>
                    <reportSet>
                        <reports>
                        </reports>
                    </reportSet>
                </reportSets>
            </plugin>
        </plugins>
    </reporting>
 {% endhighlight %}

 At this point the mvn clean site should trigger Apidoc execution, however it will not generate output by default without
 having Apidoc documentation embedded in your code.


### Document API with Apidoc
You can now start documenting your api with using the available
<a href="http://apidocjs.com/#params" target="_blank">params</a>.


{% highlight java %}
public interface BookResource {

    /**
     * @api {get} /api/books/{isbn} Get book by isbn code
     * @apiName getByIsbn
     * @apiGroup BookResource
     * @apiDescription Get a book by isbn
     * @apiVersion 1.0.0
     *
     * @apiParam {String} isbn The isbn that identifies the book
     *
     * @apiSuccess {BookDTO} book The book for the isbn
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *         {
     *           "isbn":"isbn1236",
     *           "title":"To Kill a Mockingbird",
     *           "author":"Harper lee"
     *         }
     *
     * @apiError (404) BookNotFound The book was not found
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not found
     *     {"errorCode":"BOOK_NOT_FOUND",
     *      "errorMessage":"The book was not found.",
     *      "params":{
     *       "isbn":"not-existing-isbn"
     *      }
     *     }
     *
     */
    BookDTO getByIsbn(String isbn);

    /*...*/
}
{% endhighlight %}

See a complete class configuration working in the book-inventory-boot project:
<a href="https://github.com/tamaslang/book-inventory-boot/blob/master/src/main/java/org/talangsoft/bookinventory/web/BookResource.java" target="_blank">BookResource.java</a>.


### The Generated Documentation

The generated configuration will be in the target/apidoc directory as configured in the pom.xml.
It looks like this:

![placeholder]({{ site.url }}/assets/apidoc_example.png "Apidoc example")
See the full documentation: <a href="{{ site.url }}/assets/apidocs/" target="_target">Book Inventory API</a>

### Summary
Documentation is one of the key factor of determining how usable your API will be.
Without it even the best designed API will cause headache to the users need to rely on it. <br/>
Furthermore generating the documentation before implementation, agree in the contract upfront, minimises the changes you need to make in your code.

See the complete example in <a href="https://github.com/tamaslang/book-inventory-boot" target="_blank">book-inventory-boot</a> repository.

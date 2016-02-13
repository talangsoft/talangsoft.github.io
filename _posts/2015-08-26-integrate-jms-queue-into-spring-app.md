---
layout: post
title: Integrate JMS queue into a Spring Application
author_name: Tamas Lang
author_email: tamas.lang@talangsoft.org
author_initials: TL

tags:
- spring boot
- jms queue

description: 'In this blog entry I describe a basic configuration you need to add to your Spring application for listening to jms messages on a queue.<br/>
              I extend the <a href="https://github.com/tamaslang/book-inventory-boot" target="_blank">book-inventory-boot</a> example with a Jms Listener
              that receives messages on a queue and based on the Operation header in the message a Delete, Update or a Create is executed.'


---

### Introduction
In this blog entry I describe a basic configuration you need to add to your Spring application for listening to jms messages on a queue.<br/>
I extend the <a href="https://github.com/tamaslang/book-inventory-boot" target="_blank">book-inventory-boot</a> example with a Jms Listener
that receives messages on a queue and based on the Operation header in the message a Delete, Update or a Create is executed.

The following figure visualizes the architecture we will implement. <br/>
The <strong>BookMgrQueueListener</strong> will be listening on a queue that receives messages with an "Operation" header and a BookDTO payload. <br/>
When a message arrives the listener executes the appropriate service on <strong>BookService</strong> component.

![placeholder]({{ site.url }}/assets/book_manager_queue.png "Book Manager Queue")

### Dependencies

To support Jms messaging we need the javax.jms.jms-api dependency and Spring's spring-jms library.<br/>
Our solution will be tested by adding Activemq-core broker as a concrete implementation of the jms messaging.

{% highlight xml %}
<!-- JMS -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jms</artifactId>
</dependency>
<dependency>
    <groupId>javax.jms</groupId>
    <artifactId>jms-api</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.activemq</groupId>
    <artifactId>activemq-core</artifactId>
    <version>${activemq-core.version}</version>
</dependency>
{% endhighlight %}

### JMS Configuration
The basic Jms configuration (<strong>JmsConfiguration.java</strong>) sets up a containerFactory and a jmsTemplate.

{% highlight java %}
@EnableJms
@Configuration
public class JmsConfiguration {

    @Autowired
    private BeanFactory springContextBeanFactory;

    @Bean
    public DefaultJmsListenerContainerFactory containerFactory(ConnectionFactory connectionFactory) {
        DefaultJmsListenerContainerFactory factory =
                new DefaultJmsListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setDestinationResolver(new BeanFactoryDestinationResolver(springContextBeanFactory));
        factory.setConcurrency("3-10");
        return factory;
    }

    @Bean
    public JmsTemplate jmsTemplate(ConnectionFactory connectionFactory) throws JMSException {
        return new JmsTemplate(connectionFactory);
    }

}
{% endhighlight %}


### Listening to queue messages


The destination name is defined in the configuration file <strong>application.yml</strong>.

{% highlight java %}
jms:
  bookmgrqueue:
    name: book-mgr-queue
{% endhighlight %}

The listener component (<strong>BookMgrQueueListener.java</strong>) is using Spring's @JmsListener annotation with selectors to read the messages with a given Operation header.


{% highlight java %}
@Component
public class BookMgrQueueListener implements Loggable{

    private final BookService bookService;

    @Autowired
    public BookMgrQueueListener(BookService bookService) {
        this.bookService = bookService;
    }

    @JmsListener(containerFactory = "containerFactory",
                 destination = "bookMgrQueueDestination",
                 selector = "Operation = 'Create'")
    public void processCreateBookMessage(BookDTO book) throws JMSException{
        bookService.createNew(book);
    }

    @JmsListener(containerFactory = "containerFactory",
                 destination = "bookMgrQueueDestination",
                 selector = "Operation = 'Update'")
    public void processUpdateBookMessage(BookDTO book) throws JMSException{
        bookService.update(book.getIsbn(), book);
    }

    @JmsListener(containerFactory = "containerFactory",
                 destination = "bookMgrQueueDestination",
                 selector = "Operation = 'Delete'")
    public void processDeleteBookMessage(BookDTO book) throws JMSException{
        bookService.delete(book.getIsbn());
    }

}
{% endhighlight %}

### Active MQ for test

To test the configuration we are setting up activeMq broker in a new configuration file, <strong>ActiveMqConfiguration.java</strong>.

{% highlight java %}
@Configuration
public class ActiveMqConfiguration {

    public static final String ADDRESS = "vm://localhost";

    private BrokerService broker;

    @Bean(name="bookMgrQueueDestination")
    public Destination bookMgrQueueDestination(@Value("${jms.bookmgrqueue.name}") String bookMgrQueueName)
            throws JMSException {
        return new ActiveMQQueue(bookMgrQueueName);
    }

    @PostConstruct
    public void startActiveMQ() throws Exception {
        broker = new BrokerService();
        // configure the broker
        broker.setBrokerName("activemq-broker");
        broker.setDataDirectory("target");
        broker.addConnector(ADDRESS);
        broker.setUseJmx(false);
        broker.setUseShutdownHook(false);
        broker.start();
    }

    @PreDestroy
    public void stopActiveMQ() throws Exception {
        broker.stop();
    }

    @Bean
    public ConnectionFactory connectionFactory() {
        return new ActiveMQConnectionFactory(ADDRESS + "?broker.persistent=false");
    }
}
{% endhighlight %}

We are setting up a full application context in the testcase but we are replacing the BookService reference in the listener to a MockedBookService
which we will use to verify whether the correct calls were executed.

![placeholder]({{ site.url }}/assets/book_manager_queue_mock.png "Book Manager Queue with Mock Service layer")

{% highlight java %}
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = Application.class, loader = SpringApplicationContextLoader.class)
@WebAppConfiguration
public class BookMgrQueueListenerIntegrationTest {

    @Autowired(required = false)
    private JmsTemplate jmsTemplate;

    @Autowired
    private BookMgrQueueListener bookMgrQueueListener;


    @Autowired(required = false)
    @Qualifier("bookMgrQueueDestination")
    private Destination bookMgrQueueDestination;

    @Mock
    private BookService mockBookService;

    @Captor
    private ArgumentCaptor<BookDTO> bookArgumentCaptor;

    @Before
    public void setUp(){
        MockitoAnnotations.initMocks(this);
        ReflectionTestUtils.setField(bookMgrQueueListener, "bookService", mockBookService);
    }

    /* ... tests */
}
{% endhighlight %}

Finally we add tests for all operations and verify whether the service layer was called with the correct operations and parameters.

{% highlight java %}
/* ... */
public class BookMgrQueueListenerIntegrationTest {
    /* ... */
    @Test
    public void testSendCreateBookMessage(){
        BookDTO book =  new BookDTO("isbn", "title", "author");
        jmsTemplate.convertAndSend(bookMgrQueueDestination, book, Message -> {
            return OperationHeader.CREATE.applyToMessage(Message);
        });
        // verify
        verify(mockBookService).createNew(bookArgumentCaptor.capture());
        assertEquals(book.getIsbn(), bookArgumentCaptor.getValue().getIsbn());
        assertEquals(book.getTitle(), bookArgumentCaptor.getValue().getTitle());
        assertEquals(book.getAuthor(), bookArgumentCaptor.getValue().getAuthor());
    }

    @Test
    public void testSendUpdateBookMessage(){
        BookDTO book =  new BookDTO("isbn", "title", "author");
        jmsTemplate.convertAndSend(bookMgrQueueDestination, book, Message -> {
            return OperationHeader.UPDATE.applyToMessage(Message);
        });
        // verify
        verify(mockBookService).update(eq(book.getIsbn()), bookArgumentCaptor.capture());
        assertEquals(book.getIsbn(), bookArgumentCaptor.getValue().getIsbn());
        assertEquals(book.getTitle(),bookArgumentCaptor.getValue().getTitle());
        assertEquals(book.getAuthor(),bookArgumentCaptor.getValue().getAuthor());
    }

    @Test
    public void testSendDeleteBookMessage(){
        BookDTO book =  new BookDTO("isbn", "title", "author");
        jmsTemplate.convertAndSend(bookMgrQueueDestination, book, Message -> {
            return OperationHeader.DELETE.applyToMessage(Message);
        });
        // verify
        verify(mockBookService).delete(book.getIsbn());
    }
{% endhighlight %}

### Summary
That is all we need to support the management of books via a Jms Queue.<br/>
See the full example on a feature branch  <a href="https://github.com/tamaslang/book-inventory-boot/tree/feature/handling_books_via_jms-queue" target="_blank">feature/handling&#95;books&#95;via&#95;jms-queue</a>

T.

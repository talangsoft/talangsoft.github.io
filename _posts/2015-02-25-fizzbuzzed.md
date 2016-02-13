---
layout: post
title: Fizz Buzz with Java 8 streams
author_name: Tamas Lang
author_email: tamas.lang@talangsoft.org
author_initials: TL

description: 'The famous FizzBuzz interview question is used to filter out most of the programmers on a job interview.<br/>
              It goes like this:'

---

The famous FizzBuzz interview question is used to filter out most of the programmers on a job interview.<br/>
It goes like this:
<blockquote>
<p>
Write a program that prints the numbers from 1 to 100.<br/>
But for multiples of three print “fizz” instead of the number and for the multiples of five print “buzz”.<br/>
For numbers which are multiples of both three and five print “fizzbuzz”.
</p>
</blockquote>


Here is my java 8 solution for the basic problem:

{% highlight java %}
import java.io.PrintStream;
import static java.util.stream.IntStream.rangeClosed;

public class FizzBuzzWithStreams {
    public static void main(String... arguments) {
      new FizzBuzzWithStreams().fizzBuzz(1, 100, System.out);
    }

    public void fizzBuzz(int from, int to, PrintStream out){
        rangeClosed(from,to)
                .mapToObj(FizzBuzzWithStreams::transformNr)
                .forEach(out::println);
    }

    public static String transformNr(int nr) {
        if (nr % 15 == 0) return "fizzbuzz";
        if (nr % 3 == 0) return "fizz";
        if (nr % 5 == 0) return "buzz";
        return Integer.toString(nr);
    }
}
{% endhighlight %}

Despite the simplicity of this coding task it is not only about the basic algorithm of the division
but also to see how one structures and tests the code she writes.

It becomes more interesting when you spice it up with some new requirements:<br/>
- If the number contains a three you must output the text 'lucky'.<br/>
- Produce statistics at the end of the program showing how many times the following were output: fizz, buzz, fizzbuzz, lucky, an integer.

Check out my <a href="https://github.com/tamaslang/codingtest-fizzbuzz">github repository</a> to see the spiced up version
with proper testing and code structuring;<br/>
A good friend of mine wrote <a href="http://benedekfazekas.github.io/2015/02/06/java8-fizzbuzzed/">a good comparison</a> between java 8 and clojure solutions.<br/>
Finally if you haven't already solved this problem, try yourself! c|;-)

Cheers,
T.

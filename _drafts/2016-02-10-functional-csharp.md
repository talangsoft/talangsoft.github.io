---
layout: post
title: Functional approach in  C#
category: code
author_name: Tamas Lang
author_email: tamas.lang@talangsoft.org
author_initials: TL

tag: code,problem,csharp
description: 2016 found me at a new company with brand-new teams and at the beginning of an agile transformation, which means that I will face with
             a lot of new challenges that will hopefully lead to new accomplishments as well.
             <br/>Watch out for the blog posts about my recent impressions!
---

Coming across <a href="http://thedailywtf.com/articles/keeping-regular">this blog post</a> about an unefficient C# code written somewhere and somewhen:

{% highlight csharp %}
  for (int i = 0; i <= name.Length - 1; i++) {
      String sTemp = "";

      for (int j = 0; j <= name[i].Length - 1; j++)
      {
          if ("QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789_".Contains(name[i][j]))
          {
              sTemp += name[i][j];
          }
      }

      name[i] = sTemp;
  }
{% endhighlight %}

The article argues about how regexp is useful and efficient instead of character matching and new String creation. <br/>

I think the main problem is that the code is not testable/reusable at all and contains error possibilities, like:

- for loop exit conditions: ```i <= name.Length - 1```
- accessing of array elements with indexes: ```name[i][j]```
- maintaining states like: ```sTemp += name[i][j]```

With using a bit more functional approach the above code could easily be rewritten like this:

{% highlight csharp %}
private static List<String> simplifyNames(List<String> names) {
    return names.Select(name => new String((name.Where(validChar)).ToArray())).ToList();
}
{% endhighlight %}


{% highlight csharp %}
private static bool validChar(char c) {
    return "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789_".Contains(c);
}
{% endhighlight %}

<blockquote>
Pardon my C#, I have never used this language before, so there might be more efficient ways for stuff like creating Strings.<br/> Feel free to comment :-)
</blockquote>

Less code, less error.
<a href="http://rextester.com/AVTMMP67746">See full example here.</a>



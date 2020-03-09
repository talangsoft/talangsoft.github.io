---
date: 2016-02-12T11:00:59-04:00
description: ""
featured_image: "/images/blog/functional.jpg"
tags: [programming, "functional programming", coding]
title: "Functional approach in C#"
---

Coming across this blog post about an inefficient C# code written somewhere and somewhen:

```for (int i = 0; i <= name.Length - 1; i++) {
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
  ```

The code meant to take a list of names and remove every not allowed character from them.

`{"John Smith","Not-Allowed"}` will become `{"JohnSmith","NotAllowed"}`

The blog post suggests to use regexp instead of character matching and to avoid new String creation.
However it seems to be a bigger problem that the code presented here is neither testable nor reusable and its structure is not protected against easy to make failures at places like:

- for loop exit conditions: `i <= name.Length - 1`
- accessing of array elements with indexes: `name[i][j]`
- maintaining states like: `sTemp += name[i][j]`

But that makes it a good example for how to overcome these issues with a more functional approach.

The above code could easily be rewritten like this:

```public List<String> simplifyNames(List<String> names) {
    return names.Select(name => new String((name.Where(validChar)).ToArray())).ToList();
}
```
```
private bool validChar(char c) {
    return "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789_".Contains(c);
}
```

>Pardon my C#, I have never used this language before, so there might be more efficient ways for stuff like creating Strings.


The main advantage of this approach is that it requires no states to be maintained, it is expressed using less code and additionally it has a well isolated space for the business logic (the valid characters).

See full example [here](https://rextester.com/AVTMMP67746).

TL

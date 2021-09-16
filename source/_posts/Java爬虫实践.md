---
title: Java爬虫实践
date: 2021-09-16 18:01:55
cover: https://i.loli.net/2019/07/21/5d33d5dc1531213134.png
coverWidth: 1200
coverHeight: 750
---

### 1、我的见解

爬虫，我的理解就是，首先要可以获取大量数据，然后在大量数据中筛选出自己想要的数据，并且能对数据进行修饰。接下来，将会给大家介绍，两种爬取数据的方式：JSoup和WebClient。

### 2、JSoup

#### ①是什么

Jsoup是用于解析HTML，就类似XML解析器用于解析XML。 Jsoup它解析HTML成为真实世界的HTML。 它与jquery选择器的语法非常相似，并且非常灵活容易使用以获得所需的结果。 在本教程中，我们将介绍很多Jsoup的例子。

#### ②它能做什么

* 从URL，文件或字符串中刮取并解析HTML
* 查找和提取数据，使用DOM遍历或CSS选择器
* 操纵HTML元素，属性和文本
* 根据安全的白名单清理用户提交的内容，以防止XSS攻击
* 输出整洁的HTML

#### ③下载依赖

```java
<dependency>
  <!-- jsoup HTML parser library @ http://jsoup.org/ -->
  <groupId>org.jsoup</groupId>
  <artifactId>jsoup</artifactId>
  <version>1.10.2</version>
</dependency>
```

#### ④Jsoup用法

* 从URL获取HTML

  * ```java
    Document doc = Jsoup.connect("http://www.baidu.com/").get();
    String title = doc.title();
    ```

  * 其中其中JSoup.connet("http://xxx")方法返回了一个Connection对象

  * 在Connection对象可以调用get()或post()方法执行请求，也可以在Connection对象中设置一些请求信息。比如：头信息，cookie ,请求等待时间，代理等。

  * ```java
    Document doc = Jsoup.connect("http://example.com")
      .data("query", "Java")
      .userAgent("Mozilla")
      .cookie("auth", "token")
      .timeout(3000)
      .post();
    
    ```

    发送请求后，就会获取一个Document文档对象，内容是当前链接的html

* 获得Document对象后，接下来就是解析Document对象，并从中获取我们想要的元素了。

  * ```java
    //doucment对象中获取相应标签的方法
    getElementById(String id)：通过id来获取
    getElementsByTag(String tagName)：通过标签名字来获取
    getElementsByClass(String className)：通过类名来获取
    getElementsByAttribute(String key)：通过属性名字来获取
    getElementsByAttributeValue(String key, String value)：通过指定的属性名字，属性值来获取
    getAllElements()：获取所有元素
    ```

    Jsoup的强大在于它对文档元素的检索，Select方法将返回一个Elements集合，并提供一组方法来抽取和处理结果，即Jsoup的选择器语法。

    1、Selector选择器基本语法

    - tagname: 通过标签查找元素，比如：a

    - ns|tag: 通过标签在命名空间查找元素，比如：可以用 fb|name 语法来查找 <fb:name> 元素

    - \#id: 通过ID查找元素，比如：#logo

    - .class: 通过class名称查找元素，比如：.masthead

    - [attribute]: 利用属性查找元素，比如：href

    - [^attr]: 利用属性名前缀来查找元素，比如：可以用[^data-] 来查找带有HTML5 Dataset属性的元素

    - [attr=value]: 利用属性值来查找元素，比如：width=500

    - [attr^=value], [attr$=value], [attr*=value]: 利用匹配属性值开头、结尾或包含属性值来查找元素，比如：[href*=/path/]

    - [attr~=regex]: 利用属性值匹配正则表达式来查找元素，比如： img[src~=(?i)\.(png|jpe?g)]

    - *: 这个符号将匹配所有元素

    2、Selector选择器组合使用语法

    - el#id: 元素+ID，比如： div#logo
    - el.class: 元素+class，比如： div.masthead
    - el[attr]: 元素+class，比如： a[href]
    - 任意组合，比如：a[href].highlight
    - ancestor child: 查找某个元素下子元素，比如：可以用.body p 查找在”body”元素下的所有 p元素
    - parent > child: 查找某个父元素下的直接子元素，比如：可以用div.content > p 查找 p 元素，也可以用body > * 查找body标签下所有直接子元素
    - siblingA + siblingB: 查找在A元素之前第一个同级元素B，比如：div.head + div
    - siblingA ~ siblingX: 查找A元素之前的同级X元素，比如：h1 ~ p
    - el, el, el:多个选择器组合，查找匹配任一选择器的唯一元素，例如：div.masthead, div.logo

    3、Selector伪选择器语法

    - :lt(n): 查找哪些元素的同级索引值（它的位置在DOM树中是相对于它的父节点）小于n，比如：td:lt(3) 表示小于三列的元素
    - :gt(n):查找哪些元素的同级索引值大于n，比如： div p:gt(2)表示哪些div中有包含2个以上的p元素
    - :eq(n): 查找哪些元素的同级索引值与n相等，比如：form input:eq(1)表示包含一个input标签的Form元素
    - :has(seletor): 查找匹配选择器包含元素的元素，比如：div:has(p)表示哪些div包含了p元素
    - :not(selector): 查找与选择器不匹配的元素，比如： div:not(.logo) 表示不包含 class=logo 元素的所有 div 列表
    - :contains(text): 查找包含给定文本的元素，搜索不区分大不写，比如： p:contains(jsoup)
    - :containsOwn(text): 查找直接包含给定文本的元素
    - :matches(regex): 查找哪些元素的文本匹配指定的正则表达式，比如：div:matches((?i)login)
    - :matchesOwn(regex): 查找自身包含文本匹配指定正则表达式的元素

    注意：上述伪选择器索引是从0开始的，也就是说第一个元素索引值为0，第二个元素index为1等。

#### ⑤实例

* 使用`Jsoup.connect()` 方法从URL加载HTML

  * ```java
    try{
        Document document=Jsoup.connect("http://www.baidu.com").get();
        System.out.println(document);
    }
    catch (IOException e) 
    {
        e.printStackTrace();
    }
    
    
    ```

* 从文件加载HTML,使用`Jsoup.parse()` 方法

  * ```java
    try
    {
        Document document = Jsoup.parse( new File( "D:/temp/index.html" ) , "utf-8" );
        System.out.println(document.title());
    } 
    catch (IOException e) 
    {
        e.printStackTrace();
    }
    ```

* 使用`Jsoup.parse()` 方法从字符串加载HTML

  * ```java
    try
    {
        String html = "<html><head><title>First parse</title></head>"
                        + "<body><p>Parsed HTML into a doc.</p></body></html>";
        Document document = Jsoup.parse(html);
        System.out.println(document.title());
    } 
    catch (IOException e) 
    {
        e.printStackTrace();
    }
    ```

* 获取HTML页面的图标

  * ```java
    String favImage = "Not Found";
    try {
        Document document = Jsoup.parse(new File("D:/temp/index.html"), "utf-8");
        Element element = document.head().select("link[href~=.*\\.(ico|png)]").first();
        if (element == null) 
        {
            element = document.head().select("meta[itemprop=image]").first();
            if (element != null) 
            {
                favImage = element.attr("content");
            }
        } 
        else
        {
            favImage = element.attr("href");
        }
    } 
    catch (IOException e) 
    {
        e.printStackTrace();
    }
    System.out.println(favImage);
    ```

* 获取HTML页面的所有链接

  * ```java
    try
    {
        Document document = Jsoup.parse(new File("D:/temp/index.html"), "utf-8");
        Elements links = document.select("a[href]");  
        for (Element link : links) 
        {
             System.out.println("link : " + link.attr("href"));  
             System.out.println("text : " + link.text());  
        }
    } 
    catch (IOException e) 
    {
        e.printStackTrace();
    }
    ```

* 获取HTML页面中所有的图像

  * ```java
    try
    {
        Document document = Jsoup.parse(new File("D:/temp/index.html"), "utf-8");
        Elements images = document.select("img[src~=(?i)\\.(png|jpe?g|gif)]");
        for (Element image : images) 
        {
            System.out.println("src : " + image.attr("src"));
            System.out.println("height : " + image.attr("height"));
            System.out.println("width : " + image.attr("width"));
            System.out.println("alt : " + image.attr("alt"));
        }
    } 
    catch (IOException e) 
    {
        e.printStackTrace();
    }
    
    ```

* 修改获取的HTML标签

  * ```java
    try
    {
        Document document = Jsoup.parse(new File("C:/Users/zkpkhua/Desktop/yiibai.com.html"), "utf-8");
        //将所有div标签替换为p标签
        document.select("div").tagName("p");
        Elements links = document.select("a[href]");  
        //给所有a标签添加属性rel="nofollow"
        links.attr("rel", "nofollow");
    } 
    catch (IOException e) 
    {
        e.printStackTrace();
    }
    ```

* 消除不信任的HTML（防止XSS攻击）

  * Jsoup在提供强大的API的同时，人性化方面也做得很好。在做网站的时候，经常会提供用户的评论的功能。有些用户比较淘气，会搞一些脚本到评论内容中，而这些脚本可能会破坏整个页面的功能，更严重的是获取一些机要信息，例如XSS跨站攻击之类的。

  * ```java
    String dirtyHTML = "<p><a href='http://www.yiibai.com/' onclick='sendCookiesToMe()'>Link</a></p>";
    String cleanHTML = Jsoup.clean(dirtyHTML, Whitelist.basic());
    System.out.println(cleanHTML);
    
    //执行后输出结果
    <p><a href="http://www.yiibai.com/" rel="nofollow">Link</a></p>
    ```

  * Jsoup使用一个Whitelist类来对HTML文档进行过滤，该类提供了几个常用的方法

  * | 方法名           | 简介                                                         |
    | ---------------- | ------------------------------------------------------------ |
    | none()           | 只允许包含文本信息                                           |
    | basic()          | 允许的标签包括：a,b,blockquote,br,cite, code,dd,dl,dt,em,i,li,ol,p.pre,q,small,strong,sub,sujp,u,ul,以及合适的属性 |
    | simpel(）        | 只允许b，em，i，strong，u，这些标签                          |
    | basicWithImage() | 在basic()基础上增加了图片                                    |
    | relax()          | 这个过滤器允许的标签最多，包括：a，b，blockquote，br，caption，cite，code，col，colgroup，dd，dl，dt，em，h1-h6，i，img，li，ol，p，pre，q，small，strike，strong，sub，sup， table，tbody，td，tfoot，th，thead，tr，u，ul |

    如果这五个过滤器都无法满足你的需求，例如你允许用户插入flase动画，没关系，Whitelist提供扩展功能，例如`whitelist.addTags("embed","object","param","span","div")`，也可以调用`addAttributes`为某些元素增加属性


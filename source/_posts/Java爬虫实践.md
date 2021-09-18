---
title: Java爬虫实践
date: 2021-09-16 18:01:55
cover: https://i.loli.net/2019/07/21/5d33d5dc1531213134.png
coverWidth: 1200
coverHeight: 750  
disableNunjucks: {% include_code lang:javascript codeBlock.js %}
---  


### 1、我的见解

爬虫，我的理解就是，首先要可以获取大量数据，然后在大量数据中筛选出自己想要的数据，并且能对数据进行修饰。接下来，将会给大家介绍，两种爬取数据的方式：JSoup和WebClient。

<!--more-->

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

``` java
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
    

  * 发送请求后，就会获取一个Document文档对象，内容是当前链接的html

* 获得Document对象后，接下来就是解析Document对象，并从中获取我们想要的元素了。

  * ``` 
    //doucment对象中获取相应标签的方法
    getElementById(String id)：通过id来获取
    getElementsByTag(String tagName)：通过标签名字来获取
    getElementsByClass(String className)：通过类名来获取
    getElementsByAttribute(String key)：通过属性名字来获取
    getElementsByAttributeValue(String key, String value)：通过指定的属性名字，属性值来获取
    getAllElements()：获取所有元素
    ```

  * Jsoup的强大在于它对文档元素的检索，Select方法将返回一个Elements集合，并提供一组方法来抽取和处理结果，即Jsoup的选择器语法。

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

  * ```
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

  * ``` 
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

  * ``` 
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

  * ```
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

  * ```
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

  * ```
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

  * ```
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

  * ```
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

  * 如果这五个过滤器都无法满足你的需求，例如你允许用户插入flase动画，没关系，Whitelist提供扩展功能，例如`whitelist.addTags("embed","object","param","span","div")`，也可以调用`addAttributes`为某些元素增加属性

### 3、WebClient

ps：它比jsoup好在哪，在我的需求中，它比jsoup获取更深的数据，有时页面的链接并不会直接显式放到a标签中的href属性中，而是放到了js文件中，利用用户点击事件触发执行。webclient相当于一个能模拟浏览器的工具，比如你可以用它在页面中提交表单，发起请求等。

#### ①是什么

WebClient是从Spring WebFlux 5.0版本开始提供的一个非阻塞的基于响应式编程的进行Http请求的客户端工具。它的响应式编程的基于Reactor的。WebClient中提供了标准Http请求方式对应的get、post、put、delete等方法，可以用来发起相应的请求。

#### ②怎么用

* 用maven引入依赖，或者直接下载jar包	

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>	
```

* 一个例子

通过`WebClient.create()`创建一个WebClient的实例，之后可以通过get()，post() 等选择调用方式，uri() 指定需要请求的路径，retrieve（） 用来发起请求并获得响应，`bodyToMono(String.class) `用来指定请求结果需要处理为String，并包装为Reactor的Mono对象。

```
WebClient webClient=WebClient.create();
Mono<String> mono=webClient.get().uri("https://www.baidu.com").retrieve().bodyToMono(String.class);
System.out.println(mono.block());
```

#### ③实例

* URL中使用路径变量

  * URL中也可以使用路径变量，路径变量的值可以通过uri方法的第2个参数指定。下面的代码中就定义了URL中拥有一个路径变量id，然后实际访问时该变量将取值1。

    * ```
      webClient.get().uri("http://localhost:8081/user/{id}", 1);
      ```

  * URL中也可以使用多个路径变量，多个路径变量的赋值将依次使用uri方法的第2个、第3个、第N个参数。下面的代码中就定义了URL中拥有路径变量p1和p2，实际访问的时候将被替换为var1和var2。所以实际访问的URL是`http://localhost:8081/user/var1/var2`。

    * ```
      webClient.get().uri("http://localhost:8081/user/{p1}/{p2}", "var1", "var2");
      ```

  * 使用的路径变量也可以通过Map进行赋值。面的代码中就定义了URL中拥有路径变量p1和p2，实际访问的时候会从uriVariables中获取值进行替换。所以实际访问的URL是`http://localhost:8081/user/var1/1`

    * ```
      Map<String, Object> uriVariables = new HashMap<>();
      uriVariables.put("p1", "var1");
      uriVariables.put("p2", 1);
      webClient.get().uri("http://localhost:8081/user/{p1}/{p2}", uriVariables);
      ```

* 使用uriBuilder传递参数

  * ```
    String baseUrl = "http://192.1681.5.9:8989";
    WebClient webClient = WebClient.create(baseUrl);
    WebClient.RequestBodyUriSpec request = webClient.method(HttpMethod.POST);
    request.uri(uriBuilder -> uriBuilder
                .scheme("http")
                .host("192.168.5.9")
                .path("/mxtest4")
                .port(8989)
                .path("/mxtest4")
                .queryParam("name1", "啊")
                .queryParam("name2", "是")
                .build());
    ```

* 指定baseUrl

  * 在应用中使用WebClient时也许你要访问的URL都来自同一个应用，只是对应不同的URL地址，这个时候可以把公用的部分抽出来定义为baseUrl，然后在进行WebClient请求的时候只指定相对于baseUrl的URL部分即可。这样的好处是你的baseUrl需要变更的时候可以只要修改一处即可。下面的代码在创建WebClient时定义了baseUrl为`http://localhost:8081`，在发起Get请求时指定了URL为`/user/1`，而实际上访问的URL是`http://localhost:8081/user/1`。

    * ```
      String baseUrl = "http://localhost:8081";
      WebClient webClient = WebClient.create(baseUrl);
      Mono<User> mono = webClient.get().uri("user/{id}", 1).retrieve().bodyToMono(User.class);
      ```

* 表单提交

  * 当传递的请求体对象是一个MultiValueMap对象时，WebClient默认发起的是Form提交。下面的代码中就通过Form提交模拟了用户进行登录操作，给Form表单传递了参数username，值为u123，传递了参数password，值为p123。

    *  ```
      String baseUrl = "http://localhost:8081";
      WebClient webClient = WebClient.create(baseUrl);
      
      MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
      map.add("username", "u123");
      map.add("password", "p123");
      
      Mono<String> mono = webClient.post().uri("/login").syncBody(map).retrieve().bodyToMono(String.class);
       ```

* 请求时携带JSON参数

  * 假设现在拥有一个新增User的接口，按照接口定义客户端应该传递一个JSON对象，格式如下：

    * ```
      {
          "name":"张三",
          "username":"zhangsan"
      }
      ```

  * 客户端可以建立一个满足需要的JSON格式的对象，然后直接把该对象作为请求体，WebClient会帮我们自动把它转换为JSON对象。

    * ```
      String baseUrl = "http://localhost:8081";
      WebClient webClient = WebClient.create(baseUrl);
      
      User user = new User();
      user.setName("张三");
      user.setUsername("zhangsan");
      
      Mono<Void> mono = webClient.post().uri("/user/add").syncBody(user).retrieve().bodyToMono(Void.class);
      mono.block();
      
      //如果没有建立对应的对象，直接包装为一个Map对象也是可以的。
      String baseUrl = "http://localhost:8081";
      WebClient webClient = WebClient.create(baseUrl);
      
      Map<String, Object> user = new HashMap<>();
      user.put("name", "张三");
      user.put("username", "zhangsan");
      
      Mono<Void> mono = webClient.post().uri("/user/add").syncBody(user).retrieve().bodyToMono(Void.class);
      mono.block();
      ```

  * 直接传递一个JSON字符串也是可以的，但是此时需要指定contentType为`application/json`，也可以加上charset。默认情况下WebClient将根据传递的对象在进行解析处理后自动选择ContentType。直接传递字符串时默认使用的ContentType会是`text/plain`。其它情况下也可以主动指定ContentType。

    * ```
      String baseUrl = "http://localhost:8081";
      WebClient webClient = WebClient.create(baseUrl);
      
      String userJson = 
              "{" + 
              "    \"name\":\"张三\",\r\n" + 
              "    \"username\":\"zhangsan\"\r\n" + 
              "}";
      
      Mono<Void> mono = webClient.post().uri("/user/add").contentType(MediaType.APPLICATION_JSON_UTF8).syncBody(userJson).retrieve().bodyToMono(Void.class);
      mono.block();
      ```

* 处理WebClient错误

  * ``` java
    WebClient.ResponseSpec retrieve = request.retrieve();
    
    Mono<String> mono = retrieve
            .onStatus(e -> e.is4xxClientError(), resp -> {
                System.out.println(resp.statusCode().value() + "," + resp.statusCode().getReasonPhrase());
                return Mono.error(new RuntimeException(resp.statusCode().value() + " : " + resp.statusCode().getReasonPhrase()));
            })
            .bodyToMono(String.class)
            .doOnError(WebClientResponseException.class, err -> {
                System.out.println(err.getRawStatusCode() + "," + err.getResponseBodyAsString());
                throw new RuntimeException(err.getMessage());
            })
            .onErrorReturn("fallback");
    
    System.out.println("result:" + mono.block());
    ```

* 上传和下载文件

  * ```
    //上传
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.IMAGE_PNG);
    HttpEntity<ClassPathResource> entity = new HttpEntity<>(new ClassPathResource("parallel.png"), headers);
    MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
    parts.add("file", entity);
    Mono<String> resp = WebClient.create().post()
            .uri("http://localhost:8080/upload")
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .body(BodyInserters.fromMultipartData(parts))
            .retrieve().bodyToMono(String.class);
    LOGGER.info("result:{}",resp.block());
    
    //下载图片
    Mono<Resource> resp = WebClient.create().get()
                .uri("http://www.toolip.gr/captcha?complexity=99&size=60&length=9")
                .accept(MediaType.IMAGE_PNG)
                .retrieve().bodyToMono(Resource.class);
    Resource resource = resp.block();
    BufferedImage bufferedImage = ImageIO.read(resource.getInputStream());
    ImageIO.write(bufferedImage, "png", new File("captcha.png"));
    
    //下载文件
    Mono<ClientResponse> resp = WebClient.create().get()
            .uri("http://localhost:8080/file/download")
            .accept(MediaType.APPLICATION_OCTET_STREAM)
            .exchange();
    ClientResponse response = resp.block();
    String disposition = response.headers().asHttpHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
    String fileName = disposition.substring(disposition.indexOf("=")+1);
    Resource resource = response.bodyToMono(Resource.class).block();
    File out = new File(fileName);
    FileUtils.copyInputStreamToFile(resource.getInputStream(),out);
    LOGGER.info(out.getAbsolutePath());
    ```

* 异步调用

  * ```
    Flux<String> flux = request.retrieve().bodyToFlux(String.class);
    Disposable subscribe = flux.subscribe(tweet -> {
        //如果jvm结束了，就不能显示了
        System.out.println(tweet.toString());
    });
    System.out.println("result:exit");
    Thread.sleep(5000);
    ```

* 获取响应头信息

  * 前面介绍的示例都是直接获取到了响应的内容，可能你会想获取到响应的头信息、Cookie等。那就可以在通过WebClient请求时把调用`retrieve()`改为调用`exchange()`，这样可以访问到代表响应结果的`org.springframework.web.reactive.function.client.ClientResponse`对象，通过它可以获取响应的状态码、Cookie等。下面的代码先是模拟用户进行了一次表单的登录操作，通过ClientResponse获取到了登录成功后的写入Cookie的sessionId，然后继续请求了用户列表。在请求获取用户列表时传递了存储了sessionId的Cookie。

  * ```
    String baseUrl = "http://localhost:8081";
    WebClient webClient = WebClient.create(baseUrl);
    
    MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
    map.add("username", "u123");
    map.add("password", "p123");
    
    Mono<ClientResponse> mono = webClient.post().uri("login").syncBody(map).exchange();
    ClientResponse response = mono.block();
    if (response.statusCode() == HttpStatus.OK) {
        Mono<Result> resultMono = response.bodyToMono(Result.class);
        resultMono.subscribe(result -> {
            if (result.isSuccess()) {
                ResponseCookie sidCookie = response.cookies().getFirst("sid");
                Flux<User> userFlux = webClient.get().uri("users").cookie(sidCookie.getName(), sidCookie.getValue()).retrieve().bodyToFlux(User.class);
                userFlux.subscribe(System.out::println);
            }
        });
    }
    ```

* WebClient.Builder

  * 除了可以通过`WebClient.create()`创建WebClient对象外，还可以通过`WebClient.builder()`创建一个`WebClient.Builder`对象，再对Builder对象进行一些配置后调用其`build()`创建WebClient对象。下面的代码展示了其用法，配置了baseUrl和默认的cookie信息。

  * ```
    String baseUrl = "http://localhost:8081";
    WebClient webClient = WebClient.builder().baseUrl(baseUrl).defaultCookie("cookieName", "cookieValue").build();
    //使用WebClient构建器，可以自定义选项：包括过滤器、默认标题、cookie、客户端连接器等
    WebClient webClient = WebClient.builder()
            .baseUrl("https://api.github.com")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/vnd.github.v3+json")
            .defaultHeader(HttpHeaders.USER_AGENT, "Spring 5 WebClient")
            .build()
    ```

  * Builder还可以通过`clientConnector()`定义需要使用的ClientHttpConnector，默认将使用`org.springframework.http.client.reactive.ReactorClientHttpConnector`，其底层是基于netty的，如果你使用的是Maven，需要确保你的pom.xml中定义了如下依赖。

  * ```
    <dependency>
        <groupId>io.projectreactor.ipc</groupId>
        <artifactId>reactor-netty</artifactId>
        <version>0.7.8.RELEASE</version>
    </dependency>
    ```

  * 如果对默认的发送请求和处理响应结果的编解码不满意，还可以通过exchangeStrategies()定义使用的ExchangeStrategies。ExchangeStrategies中定义了用来编解码的对象，其也有对应的build()方法方便我们来创建ExchangeStrategies对象。

    *WebClient也提供了Filter，对应于org.springframework.web.reactive.function.client.ExchangeFilterFunction接口，其接口方法定义如下。*

  * ```
    Mono<ClientResponse> filter(ClientRequest request, ExchangeFunction next)
    ```

  * 在进行拦截时可以拦截request，也可以拦截response。下面的代码定义的Filter就拦截了request，给每个request都添加了一个名为header1的header，值为value1。它也拦截了response，response中也是添加了一个新的header信息。拦截response时，如果新的ClientResponse对象是通过`ClientResponse.from(response)`创建的，新的response是不会包含旧的response的body的，如果需要可以通过`ClientResponse.Builder`的`body()`指定，其它诸如header、cookie、状态码是会包含的。

  * ```
    String baseUrl = "http://localhost:8081";
    WebClient webClient = WebClient.builder().baseUrl(baseUrl).filter((request, next) -> {
        ClientRequest newRequest = ClientRequest.from(request).header("header1", "value1").build();
        Mono<ClientResponse> responseMono = next.exchange(newRequest);
        return Mono.fromCallable(() -> {
            ClientResponse response = responseMono.block();
            ClientResponse newResponse = ClientResponse.from(response).header("responseHeader1", "Value1").build();
            return newResponse;
        });
    }).build();
    ```

  * 如果定义的Filter只期望对某个或某些request起作用，可以在Filter内部通过request的相关属性进行拦截，比如cookie信息、header信息、请求的方式或请求的URL等。也可以通过`ClientRequest.attribute(attrName)`获取某个特定的属性，该属性是在请求时通过`attribute("attrName", "attrValue")`指定的。这跟在HttpServletRequest中添加的属性的作用范围是类似的。

* 配置连接池，超时时间等

  * ```
    @Configuration
    public class WebClientConfig {
        @Bean
        ReactorResourceFactory resourceFactory() {
            ReactorResourceFactory factory = new ReactorResourceFactory();
            factory.setUseGlobalResources(false);
            factory.setConnectionProvider(ConnectionProvider.fixed("httpClient", 50, 10));
            factory.setLoopResources(LoopResources.create("httpClient", 50, true));
            return factory;
        }
    
        @Bean
        WebClient webClient() {
            Function<HttpClient, HttpClient> mapper = client ->
                    client.tcpConfiguration(c ->
                            c.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10)
                                    .option(TCP_NODELAY, true)
                                    .doOnConnected(conn -> {
                                        conn.addHandlerLast(new ReadTimeoutHandler(10));
                                        conn.addHandlerLast(new WriteTimeoutHandler(10));
                                    }));
    
            ClientHttpConnector connector =
                    new ReactorClientHttpConnector(resourceFactory(), mapper);
    
            return WebClient.builder().clientConnector(connector).build();
        }
    }
    ```

### 3、参考

[JSoup快速入门 - JSoup教程™ (yiibai.com)](https://www.yiibai.com/jsoup/jsoup-quick-start.html)

[Spring的WebClient基本使用 - xuanm - 博客园 (cnblogs.com)](https://www.cnblogs.com/grasp/p/12179906.html)
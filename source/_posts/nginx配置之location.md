---
title: nginx配置之location
categories: nginx
abbrlink: 35269
date: 2022-05-25 10:13:57
tags: nginx
---

nginx学习location的使用

<!-- more -->

### 1、location介绍

location是Nginx中的块级指令(block directive),location指令的功能是用来匹配不同的url请求，进而对请求做不同的处理和响应，这其中较难理解的是多个location的匹配顺序。

开始之前先明确一些约定，我们输入的网址叫做请求URI，nginx用请求URI与location中配置的URI做匹配。

### 2、location 语法

location有两种匹配规则：

* 匹配URL类型，有四种参数可选，当然也可以不带参数。 location [ = | ~ | ~* | ^~ ] uri { … } 
* 命名location，用@标识，类似于定于goto语句块。 location @name { … } 

location匹配参数解释：

（1） “=” ，精确匹配

*   内容要同表达式完全一致才匹配成功

```nginx
location =/abc{
    proxy_pass http://www.baidu.com/;
}
#访问 http://117.50.162.61:88/abc->http://www.baidu.com
```

（2） “~”，执行正则匹配，区分大小写

```nginx
location ~ /Abc {
    proxy_pass http://www.baidu.com;
}
#访问http://117.50.162.61:88/Abc->
http://www.baidu.com/Abc
```

（3）“~*”，执行正则匹配，忽略大小写

```nginx
location ~*/Def{
     proxy_pass http://www.baidu.com;
}
#访问http://117.50.162.61:88/def|Def->
http://www.baidu.com/def|Def
```

（4）“^~”，表示普通字符串匹配上以后不再进行正则匹配。

```nginx
location ^~ /index {
    proxy_pass http://www.baidu.com/;
}
#访问http://117.50.162.61:88/index->
http://www.baidu.com
```

（5）不加任何规则时，默认是大小写敏感，前缀匹配，相当于加了“~”与“^~”

（6）“@”，nginx内部跳转

```nginx
location /index/ {
  error_page 404 @index_error;
}
location @index_error {
  .....
}
#以 /index/ 开头的请求，如果链接的状态为 404。则会匹配到 @index_error 这条规则上。
```

### 3、location URI结尾带不带 /

(1)结尾不带/

```nginx
location /test {
    proxy_proxy http://www.baidu.com;
}
#访问：http://117.50.162.61:88/test->
http://www.baidu.com/test
即此种情况会把所有的路径加uri中
```

(1)结尾带/

```nginx
location /test {
    proxy_proxy http://www.baidu.com/;
}
#访问：http://117.50.162.61:88/test/index->
http://www.baidu.com/index
即此种情况会把除了匹配路径之外的地址加到uri中
```


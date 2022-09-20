---
title: RPC原理
categories: 微服务
tags: RPC
abbrlink: 12447
date: 2022-09-20 14:24:58
---
### RPC通信的演化

* 从单机到分布式->分布式通信->最基本：二进制传输 TCP/IP
  * 最古老也是最有效，并且永不过时，TCP/UDP的二进制传输。事实上所有的通信方式归根结底都是TCP/UDP
  * CORBA Common Ojbect Request Broker Architecture 。古老而复杂，支持面向对象的通信协议
  * Web Service （SOA SOAP RDDI WSDL 等）
    基于HTTP+xml的标准化Web API
  * RestFul （Representational State Transfer）
    回归简单化本源的Web API 的事实标准，HTTP+JSON
  * RMI Remote Message Service
    JavaEE 中的消息框架标准，为很多MQ提供支持
  * RPC（Remote Procedure Call）
    远程方法调用，这只是一个统称，重点在于方法调用（不支持对象的概念），具体实现甚至可以用RMI RestFul 等去实现，但一般不用，因为RMI不能跨语言，而RestFul效率太低。
    多用于服务器集群间通信，因此使用更加高效，短小精悍的传输模式以提高效率。
<!-- more -->


#### 1、什么是RPC

* RPC的概念与技术早在1981年由Nelson提出。1984年，Birrell和Nelson把其用于支持异构型分布式系统间的通讯。Birrell的RPC模型引入存根进程（stub）作为远程的本地代理，调用RPC运行时库来传输网络中的调用。Stub和RPC runtime屏蔽了网络调用所涉及的许多细节，特别是，参数的编码/译码及网络通讯是由stub和RPC runtime完成的，因此这一模式被各类RPC所采用。——百度百科
* 对于RPC框架来说，有两个核心部分，一个被称为Stub，还有一个RPCRuntime。
  * 这个存根进程主要是在作为服务的提供方和调用方的代理来屏蔽底层的实现细节，包括：调用参数的序列化和网络传输的一些过程。
  * RPC运行时值承担服务提供方和调用之间的进行网络传输的网络调用。
  * ![image-20220920103141918](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202209201031116.png)

#### 2、RPC的使用场景

* RPC：内部系统、同步调用
* MQ：内部系统、异步调用
* REST/GraphQL：外部系统调用

![image-20220920103451642](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202209201034717.png)

#### 3、RPC的核心流程

本地调用—>User Stub（打包参数：服务的名称、调用的方法、参数列表，以及返回参数等信息）—>RPCRuntime—>Server Stub接收打包好的参数—>调用方法，得到响应的信息—>将信息进行打包（序列化）—>RPC Runtime—>User Stub对信息进行反序列化—>本地

![image-20220920103628173](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202209201036278.png)

RPC所做的事情就是对User Stub到Server  Stub的过程，对这个过程进行包装后形成的就是一个RPC框架，对于调用方而言，所感知的就是一个本地调用的过程，而底层的一些网络传输和各种实现细节就被RPC框架所屏蔽了。
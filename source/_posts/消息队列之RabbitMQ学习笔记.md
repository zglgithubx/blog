---
title: 消息队列之RabbitMQ学习笔记
categories: 消息队列
tags: RabbitMQ
cover: 'https://blog.fundebug.com/2018/04/20/rabbitmq_tutorial/rabbitmq.png'
abbrlink: 49673
date: 2021-11-07 11:30:11
permalink:
---

### 什么是消息队列

消息是两个应用间传递的数据。消息队列简单的来讲是将消息在传输的过程中用来存储消息的容器。

在消息队列中，通常会有生产者和消费者，生产者将消息放到队列中，消费者从中取出消息。

### 为什么要使用消息队列

* 解藕：
  * 假如消息的接收方有多个，需要单独给每个接收方都要发送消息，如果又新增一个接收方，则需要增加新代码才能实现。为了降低这种耦合，使用MQ，发送方只需要把消息放到队列中，接受方只需要在队列中取消息，这样就避免了每次新增接收方而去增加新代码，从而实现解藕。
* 异步：
  * 个客户端请求发送进来，系统A会调用系统B、C、D三个系统，同步请求的话，响应时间就是系统A、B、C、D的总和，也就是800ms。如果使用MQ，系统A发送数据到MQ，然后就可以返回响应给客户端，不需要再等待系统B、C、D的响应，可以大大地提高性能。对于一些非必要的业务，比如发送短信，发送邮件等等，就可以采用MQ。
* 削峰：
  * 假设系统A在某一段时间请求数暴增，有5000个请求发送过来，系统A这时就会发送5000条SQL进入MySQL进行执行，MySQL对于如此庞大的请求当然处理不过来，MySQL就会崩溃，导致系统瘫痪。如果使用MQ，系统A不再是直接发送SQL到数据库，而是把数据发送到MQ，MQ短时间积压数据是可以接受的，然后由消费者每次拉取2000条进行处理，防止在请求峰值时期大量的请求直接发送到MySQL导致系统崩溃。

<!-- more -->

### RabbitMQ介绍

abbitMQ 是实现 AMQP（高级消息队列协议）的消息中间件的一种，最初起源于金融系统，用于在分布式系统中存储转发消息，在易用性、扩展性、高可用性等方面表现不俗。 RabbitMQ 主要是为了实现系统之间的双向解耦而实现的。当生产者大量产生数据时，消费者无法快速消费，那么需要一个中间层。保存这个数据。

AMQP，即 Advanced Message Queuing Protocol，高级消息队列协议，是应用层协议的一个开放标准，为面向消息的中间件设计。消息中间件主要用于组件之间的解耦，消息的发送者无需知道消息使用者的存在，反之亦然。AMQP 的主要特征是面向消息、队列、路由（包括点对点和发布/订阅）、可靠性、安全。

RabbitMQ 是一个开源的 AMQP 实现，服务器端用Erlang语言编写，支持多种客户端，如：Python、Ruby、.NET、Java、JMS、C、PHP、ActionScript、XMPP、STOMP 等，支持 AJAX。用于在分布式系统中存储转发消息，在易用性、扩展性、高可用性等方面表现不俗。

### 安装

#### 1、安装ERLang语言，配置环境变量

ERlang[官网](https://www.erlang.org/downloads?spm=a2c6h.12873639.0.0.433733dfToixYZ)下载window版安装包

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202111071152710.png)

安装中，一直点next，完成后配置环境变量

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202111071153051.png)

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202111071154226.png)

完成后，打开cmd,输入验证是否成功

```java
erl -version
```

#### 2、安装RabbitMQ服务端

在RabbitMQ的[GitHub项目](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.3?spm=a2c6h.12873639.0.0.433733dfvzkoi7&file=v3.7.3)中，下载window版本的服务端安装包

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202111071157091.png)

安装后，找到安装目录：

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202111071158360.png)

在此目录打开cmd命令，输入：

```java
//安装管理页面插件
rabbitmq-plugins enable rabbitmq_management
```

在此目录下双击rabbitmq-server.bat启动脚本，然后打开服务管理可以看到RabbitMQ正在运行：

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202111071200331.png)

最后在浏览器输入:

```java
//进入客户端
http://localhost:15672
账号密码默认是：guest/guest
```

### RabbitMQ中的组成部分

- Broker：消息队列服务进程。此进程包括两个部分：Exchange和Queue。
- Exchange：消息队列交换机。**按一定的规则将消息路由转发到某个队列**。
- Queue：消息队列，存储消息的队列。
- Producer：消息生产者。生产方客户端将消息同交换机路由发送到队列中。
- Consumer：消息消费者。消费队列中存储的消息。

这些部分协同工作图：

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202111071208178.png)

- 消息生产者连接到RabbitMQ Broker，创建connection，开启channel。
- 生产者声明交换机类型、名称、是否持久化等。
- 生产者发送消息，并指定消息是否持久化等属性和routing key。
- exchange收到消息之后，**根据routing key路由到跟当前交换机绑定的相匹配的队列**里面。
- 消费者监听接收到消息之后开始业务处理。

### 优缺点

#### 优点

- 可靠性。支持持久化，传输确认，发布确认等保证了MQ的可靠性。
- 灵活的分发消息策略。这应该是RabbitMQ的一大特点。在消息进入MQ前由Exchange(交换机)进行路由消息。分发消息策略有：简单模式、工作队列模式、发布订阅模式、路由模式、通配符模式。
- 支持集群。多台RabbitMQ服务器可以组成一个集群，形成一个逻辑Broker。
- 多种协议。RabbitMQ支持多种消息队列协议，比如 STOMP、MQTT 等等。
- 支持多种语言客户端。RabbitMQ几乎支持所有常用编程语言，包括 Java、.NET、Ruby 等等。
- 可视化管理界面。RabbitMQ提供了一个易用的用户界面，使得用户可以监控和管理消息 Broker。
- 插件机制。RabbitMQ提供了许多插件，可以通过插件进行扩展，也可以编写自己的插件。

#### 缺点

- 系统可用性降低：你想呀，本来其他系统只要运行好好的，那你的系统就是正常的。现在你非要加入个消息队列进去，那消息队列挂了，你的系统不是呵呵了。因此，系统可用性会降低
- 系统复杂性增加：加入了消息队列，要多考虑很多方面的问题，比如：一致性问题、如何保证消息不被重复消费、如何保证消息可靠性传输等。因此，需要考虑的东西更多，刺痛复杂性增大。


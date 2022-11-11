---
title: Netty入门
categories: Java
tags: 中间件
abbrlink: 51340
date: 2022-11-11 20:16:58
---
Netty是一个基于NIO网络通信框架，使用它可以简单快速地开发网络应用程序，比如客户端和服务端的协议。Netty大大简化了网络程序的开发过程比如TCP和UDP的 Socket的开发。
<!-- more -->

### 前置知识

* IO操作的流程
* 操作系统的IO模型
* JavaIO模型
* 如何理解同步/异步、阻塞和非阻塞？

#### 为什么要了解前置知识？	

Netty的底层使用的是Java NIO，而Java NIO封装的是操作系统的IO模型，所以在学习Netty之前，了解前置知识至关重要。

#### IO操作的流程

应用程序发起的一次IO操作包含两个阶段：

- IO调用：应用程序进程向操作系统**内核**发起调用
- IO执行：操作系统内核完成IO操作

操作系统内核完成IO操作还包括连个两个过程：

- 准备数据阶段：内核等待I/O设备准备好数据
- 拷贝数据阶段：将数据从内核缓冲区拷贝到用户空间缓冲区

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211071057687.webp)

> - 什么是内核？
>   - 内核就是为操作系系统提供驱动、[内存](https://so.csdn.net/so/search?q=内存&spm=1001.2101.3001.7020)管理、网络、IO等功能的软件代码
> - 什么是用户空间？什么是内核空间?
>   - 操作系统为进程分配的内存空间分为二部分，一部分是用户空间，一部分是内核空间。内核空间是操作系统内核访问的区域，是受保护的内存空间，而用户空间是用户应用程序访问的内存区域。
> - IO设备？
>   - 可以与计算机进行数据传输的硬件。分类如下：
>   - 字符设备（character device），又叫做人机交互设备。用户通过这些设备实现与计算机系统的通信。它们大多是以字符为单位发送和接受数据的，数据通信的速度比较慢。例如，键盘和显示器为一体的字符终端、打印机、扫描仪、包括鼠标等，还有早期的卡片和纸带输入和输出机。含有显卡的图形显示器的速度相对较快，可以用来进行图像处理中的复杂图形的显示。
>   - 块设备（block device），又叫外部存储器，用户通过这些设备实现程序和数据的长期保存。与字符设备相比，它们是以块为单位进行传输的，如磁盘、磁带和光盘等。块的常见尺寸为512~32768B之间。
>   - 网络通信设备。这类设备主要有网卡、[调制解调器](https://baike.baidu.com/item/调制解调器)等，主要用于与远程设备的通信。这类设备的传输速度比字符设备高，但比[外部存储器](https://baike.baidu.com/item/外部存储器/4843180)低。

#### [操作系统的IO模型](https://juejin.cn/post/7036518015462015006#heading-6)

##### 同步阻塞IO模型

假设应用程序的进程发起**IO调用**，但是如果**内核的数据还没准备好**的话，那应用程序进程就一直在**阻塞等待**，一直等到内核数据准备好，直到内核拷贝到用户空间，才返回成功提示，此次IO操作，称之为**阻塞IO**。

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211071111906.webp)

> - 阻塞IO比较经典的应用就是**阻塞socket、Java BIO**。
> - 阻塞IO的缺点就是：如果内核数据一直没准备好，那用户进程将一直阻塞，**浪费性能**，可以使用**非阻塞IO**优化。

##### 同步非阻塞IO模型

如果内核数据还没准备好，可以先返回错误信息给用户进程，让它不需要等待，通过轮询的方式再来请求，这就是非阻塞IO，流程图如下：

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211071114171.webp)

非阻塞IO的流程如下：

- 应用进程向操作系统内核，发起`recvfrom`读取数据。
- 操作系统内核数据没有准备好，立即返回`EWOULDBLOCK`错误码。
- 应用程序轮询调用，继续向操作系统内核发起`recvfrom`读取数据。
- 操作系统内核数据准备好了，从内核缓冲区拷贝到用户空间。
- 完成调用，返回成功提示。

非阻塞IO模型，简称**NIO**，`Non-Blocking IO`。它相对于阻塞IO，虽然大幅提升了性能，但是它依然存在**性能问题**，即**频繁的轮询**，导致频繁的系统调用，同样会消耗大量的CPU资源。可以考虑**IO复用模型**，去解决这个问题。

##### IO多路复用模型

IO复用模型核心思路：系统给我们提供**一类函数**（如我们耳濡目染的**select、poll、epoll**函数），它们可以同时监控多个文件描述符的操作，并在其中某个文件描述符可读写时由操作系统唤醒阻塞等待的线程。 

> I/O 复用其实复用的不是 I/O 连接，而是复用线程，让线程能够监听多个连接（I/O 事件）。
>
> 文件描述符（fd）：它是计算机科学中的一个术语，形式上是一个非负整数。当程序打开一个现有文件或者创建一个新文件时，内核向进程返回一个文件描述符。

###### IO多路复用之select

应用进程通过调用select函数，可以同时监控多个`fd`，当有fd准备就绪时，select返回数据可读状态，应用程序再调用recvfrom读取数据。

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211071138127.webp)

非阻塞IO模型（NIO）中，需要`N`（N>=1）次轮询系统调用，然而借助`select`的IO多路复用模型，只需要发起一次系统调用就够了,大大优化了性能。

但是呢，`select`有几个缺点：

- 监听的IO最大连接数有限，在Linux系统上一般为1024。
- select函数返回后，是通过遍历`fdset`，找到就绪的描述符`fd`。

因为**存在连接数限制**，所以后来又提出了**poll**。与select相比，**poll**解决了**连接数限制问题**。但是呢，select和poll一样，还是需要通过遍历文件描述符来获取已经就绪的`socket`。如果同时连接的大量客户端在一时刻可能只有极少处于就绪状态，伴随着监视的描述符数量的增长，**效率也会线性下降**。

因此经典的多路复用模型`epoll`诞生。

###### IO多路复用之epoll

为了解决`select/poll`存在的问题，多路复用模型`epoll`诞生，它采用事件驱动来实现，流程图如下：

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211071139505.webp)

**epoll**先通过`epoll_ctl()`来注册一个`fd`（文件描述符），一旦基于某个`fd`就绪时，内核会采用回调机制，迅速激活这个`fd`，当进程调用`epoll_wait()`时便得到通知。这里去掉了**遍历文件描述符**的坑爹操作，而是采用**监听事件回调**的的机制。这就是epoll的亮点。

select、poll、epoll的区别：

|              | **select**                                           | **poll**                                           | **epoll**                                                    |
| ------------ | ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| 底层数据结构 | 数组                                                 | 链表                                               | 红黑树和双链表                                               |
| 获取就绪的fd | 遍历                                                 | 遍历                                               | 事件回调                                                     |
| 事件复杂度   | O(n)                                                 | O(n)                                               | O(1)                                                         |
| 最大连接数   | 1024                                                 | 无限制                                             | 无限制                                                       |
| fd数据拷贝   | 每次调用select，需要将fd数据从用户空间拷贝到内核空间 | 每次调用poll，需要将fd数据从用户空间拷贝到内核空间 | 使用内存映射(mmap)，不需要从用户空间频繁拷贝fd数据到内核空间 |

**epoll**明显优化了IO的执行效率，但在进程调用`epoll_wait()`时，仍然可能被阻塞的。能不能这样：不用我老是去问你数据是否准备就绪，等我发出请求后，你数据准备好了通知我就行了，这就诞生了**信号驱动IO模型**。

##### IO模型之信号驱动模型

信号驱动IO不再用主动询问的方式去确认数据是否就绪，而是向内核发送一个信号（调用`sigaction`的时候建立一个`SIGIO`的信号），然后应用用户进程可以去做别的事，不用阻塞。当内核数据准备好后，再通过`SIGIO`信号通知应用进程。应用用户进程收到信号之后，立即调用`recvfrom`，去读取数据。

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211071141603.webp)

信号驱动IO模型，在应用进程发出信号后，是立即返回的，不会阻塞进程。它已经有异步操作的感觉了。但是你细看上面的流程图，**发现数据复制到应用缓冲的时候**，应用进程还是阻塞的。回过头来看下，不管是BIO，还是NIO，还是信号驱动，在数据从内核复制到应用缓冲的时候，都是阻塞的。还有没有优化方案呢？**AIO**（真正的异步IO）！

##### IO 模型之异步IO(AIO)

前面讲的`BIO，NIO和信号驱动`，在数据从内核复制到应用缓冲的时候，都是**阻塞**的，因此都不是真正的异步。`AIO`实现了IO全流程的非阻塞，就是应用进程发出系统调用后，是立即返回的，但是**立即返回的不是处理结果，而是表示提交成功类似的意思**。等内核数据准备好，将数据拷贝到用户进程缓冲区，发送信号通知用户进程IO操作执行完毕。

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211071142114.webp)

异步IO的优化思路很简单，只需要向内核发送一次请求，就可以完成数据状态询问和数据拷贝的所有操作，并且不用阻塞等待结果。日常开发中，有类似的业务场景：

> 比如发起一笔批量转账，但是转账处理比较耗时，这时候后端可以先告知前端转账提交成功，等到结果处理完，再通知前端结果即可。

总结：

* 阻塞IO就是那种[recv](https://www.zhihu.com/search?q=recv&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A14413599}), read，一直等，等到有了数据才返回；

* 非阻塞IO就是立即返回，设置描述符为非阻塞，但是要进程自己一直检查是否可读；

* IO复用其实也是阻塞的，不过可以用来等很多描述符，比起阻塞有了进步，可以算有点异步了，但需要阻塞着检查是否可读。**对同一个描述符的IO操作也是有序的。**

* 信号驱动采用[信号机制](https://www.zhihu.com/search?q=信号机制&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A14413599})等待，有了更多的进步，不用监视描述符了，而且不用阻塞着等待数据到来，被动等待信号通知，由[信号处理程序](https://www.zhihu.com/search?q=信号处理程序&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A14413599})处理。**但对同一个描述符的IO操作还是有序的。**

* 异步IO，发送IO请求后，不用等了，也不再需要发送IO请求获取结果了。等到通知后，其实是系统帮你把数据读取好了的，**你等到的通知也不再是要求你去读写IO了，而是告诉你IO请求过程已经结束了**。你要做的就是可以处理数据了。且同一个描述符上可能同时存在很多请求。

#### [JavaIO模型](https://javaguide.cn/java/io/io-model.html#aio-asynchronous-i-o)

在Java中，主要有三种IO模型，分别是阻塞IO（BIO）、非阻塞IO（NIO）和 异步IO（AIO）。

注意：这三种是Java中提供的IO有关的API。并不是操作系统层面的IO模型呢。

Java中提供的IO有关的API，在进行IO处理的时候，其实依赖操作系统层面的IO操作实现的。

比如在Java中NIO和AIO都是通过Linux IO复用模型中的epoll函数来实现的。

可以把Java中的BIO、NIO和AIO理解为是Java语言对操作系统的各种IO模型的封装。程序员在使用这些API的时候，不需要关心操作系统层面的知识，也不需要根据不同操作系统编写不同的代码。只需要使用Java的API就可以了。

##### **BIO**

在Java的java.io包下，属于同步阻塞的IO模型

##### NIO

在Java1.4引入的java.nio包下，属于多路复用的IO模型

##### AIO

在Java1.7之后引入的包，是NIO的升级版本，属于异步非阻塞的IO模型

#### 如何理解同步/异步、阻塞和非阻塞？

##### 同步和异步

同步就是在一个功能调用时，在没有得到结果之前，该调用就不返回。也就是一件一件事做，等前一件做完了才做下一件事。

异步和同步相对，当一个异步过程调用出发后，调用者不能立刻得到结果。实际处理这个调用在完成后，通过状态，通知和回调来通知调用者。

##### 阻塞和非阻塞

非阻塞：数据没来，进程就轮询的去检测数据，直到数据来。实现了同时服务多个客户端，能够在等待任务完成的时间里干其他活了，包括提交其他任务。

阻塞：数据没来，啥都不做，直到数据来了，才进行下一步的处理。

### Netty简介

[Netty](http://netty.io/)是一个提供异步事件驱动的网络应用框架，用以快速开发高性能、高可靠性的网络服务器和客户端程序。

换句话说，Netty是一个基于NIO网络通信框架，使用它可以简单快速地开发网络应用程序，比如客户端和服务端的协议。Netty大大简化了网络程序的开发过程比如TCP和UDP的 Socket的开发。

> 1.异步怎么理解：外部线程执行write或者execute任务的时候会立马返回，为什么会立马返回，是因为他内部有一个Mpsc(多生产者单消费者)队列，所有外部线程的任务都给扔到这个队列里，同时把回调，也就是future绑定在这个任务上，reactor线程会在第三步挨个执行这些任务，执行完之后callback，典型的观察者模式
> 2.事件怎么理解：netty内部默认两倍cpu核数个reactor线程，每个reactor线程维护一个selector，每个selector维护一堆channel，每个channel都把读写等事件都注册到selector上
> 3.驱动怎么理解：netty里面默认所有的操作都在reactor线程中执行，reactor线程核心的就是run方法，所有的操作都由这个方法来驱动，驱动的过程分为三个过程，轮询事件，处理事件，处理异步任务

### 为什么要用Netty

* Netty提供统一的 API，支持多种通信模型，如阻塞、非阻塞， 以及epoll、poll等模型。
* Netty可以使用很少的代码实现Reactor多线程模型以及主从线程模型。
* 可以使用自带的编解码器解决 TCP 拆包/粘包问题。
* Netty默认提供了多协议的通信支持。
* Netty处理高吞吐量、低延迟、低资源消耗，比Java原生NIO的API更有优势。
* 经典的开源项目底层也使用到了Netty通信框架， 比如Zookeeper、Dubbo、RocketMQ等等，经历了大型项目的使用和考验更加成熟稳定。
* Netty对安全性支持也不错，比如支持SSL/TLS等。

### 能用来干什么

* RPC框架的基础通信组件
  * 典型的应用有：阿里分布式服务框架 Dubbo 的 RPC 框架使用 Dubbo 协议进行节点间通信，Dubbo 协议默认使用 Netty 作为基础通信组件，用于实现各[进程节点](https://www.zhihu.com/search?q=进程节点&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A78947405})之间的内部通信。
  * 除了 Dubbo 之外，淘宝的消息中间件 RocketMQ 的消息生产者和消息消费者之间，也采用 Netty 进行高性能、异步通信。
* 高性能的通信组件
  * Netty 作为高性能的基础通信组件，它本身提供了 TCP/UDP 和 HTTP 协议栈，非常方便定制和开发[私有协议栈](https://www.zhihu.com/search?q=私有协议栈&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A78947405})。

### 网络框架还有哪些？

1、Apache MINA
项目主页：http://mina.apache.org/

为开发高性能和高可用性的网络应用程序提供了非常便利的框架;支持基于 Java NIO 技术的 TCP/UDP 应用程序开发、串口通讯程序

2、Grizzly
官网：http://xsocket.sourceforge.net/

设计与一般的nio框架相比是比较不同的，主要不同点在于读和写都是采用blocking方式，并且使用临时selector ；
线程模型高度可配置，不过据作者介绍在跑一个selector主线程处理ACCEPT，用线程池处理read和write性能表现最好，这点不出意料。

3、Netty
官网：http://netty.io/

提供了一组基于事件的API来开发高性能, 可管理的TCP/IP服务端或客户端应用程序. 对于要求建立高性能的网络应用来说，Netty提供许多基本特性，像readiness selection, 线程池, 写缓冲DoS的预防, 可重用的缓冲等.

4、NIO Framework
搭建在Java NIO library之上，封装了原始NIO的大部分复杂性。利用NIO Framework能够很容易地开发安全，高性能的Java网络应用程序。

5、QuickServer
官网：http://www.quickserver.org/

一个免费的开源Java库，用于快速创建健壮的多线程、多客户端TCP服务器应用程序。使用QuickServer，用户可以只集中处理应用程序的逻辑/ 协议。

6、xSocket
官网：http://xsocket.sourceforge.net/

一个轻量级的基于nio的服务器框架用于开发高性能、可扩展、多线程的服务器。该框架封装了线程处理、异步读/写等方面。

7、IOServer
高性能，易扩展的网络框架，相对于Apache的MINA更加轻量级，源码更容易读懂，源码中有大量详细的中文注解，是一个非常不错的学习框架，框架主要至力于解决中国市场上手机网游的服务器端程序的编写。

IoServer构建简单服务器例程(更详细的例程可下载例程包，或进入Wiki查看)服务器接收一个来自客户端的整型，并加一返回给客户端。

8、XNIO
官网：http://xnio.jboss.org/

一个帮助你简化NIO应用程序开发的Java包；

提供了一个独特和易于使用的API，用于结合blocking和非blocking操作，即使是在同一个channel上，也可以允许你利用简单和低延迟性的blocking I/O，同时还能获得非blocking I/O的优势；

还引入了一个功能强大的基于回调的接口，可以大大简化基于traditional state machine的非blocking应用，并让您的应用程序之间的吞吐量（throughput）和延时达到完美平衡。

### Netty优点

* API使用简单，学习成本低。
* 功能强大，内置了多种解码编码器，支持多种协议。
* 社区活跃，发现BUG会及时修复，迭代版本周期短，不断加入新的功能。
* Dubbo、Elasticsearch都采用了Netty，质量得到验证。
* 高并发：Netty 是一款基于 NIO（Nonblocking IO，非阻塞IO）开发的网络通信框架，对比于 BIO（Blocking I/O，阻塞IO），它的并发性能得到了很大提高。
* 封装好：Netty 封装了 NIO 操作的很多细节，提供了易于使用调用接口。
* 传输快：Netty 的传输依赖于零拷贝特性，尽量减少不必要的内存拷贝，实现了更高效率的传输。
  * 传统的数据拷贝：
    * 将数据从磁盘读取到内核缓存
    * 将数据从内核缓存读取到用户缓存
    * 将数据从用户缓存写入到[socket](https://so.csdn.net/so/search?q=socket&spm=1001.2101.3001.7020)缓存
    * 将数据从socket缓存写入到网卡设备
  * 操作系统层面的零拷贝：
    * 将数据从磁盘读取到内核缓存
    * 将数据从内核缓存拷贝到[socket](https://so.csdn.net/so/search?q=socket&spm=1001.2101.3001.7020)缓存
    * 将数据从socket缓存写入到网卡设备
  * [netty零拷贝]([彻底搞懂Netty高性能之零拷贝 - 腾讯云开发者社区-腾讯云 (tencent.com)](https://cloud.tencent.com/developer/article/1488088))：
    * Netty 中的 `Zero-copy` 与上面我们所提到到 OS 层面上的 `Zero-copy` 不太一样, Netty的 `Zero-coyp` 完全是在用户态(Java 层面)的, 它的 `Zero-copy` 的更多的是偏向于 `优化数据操作` 这样的概念.Netty 的 `Zero-copy` 体现在如下五个方面:
      * Netty的接收和发送ByteBuffer使用直接内存进行Socket读写，不需要进行字节缓冲区的二次拷贝。如果使用JVM的堆内存进行Socket读写，JVM会将堆内存Buffer拷贝一份到直接内存中，然后才写入Socket中。相比于使用直接内存，消息在发送过程中多了一次缓冲区的内存拷贝。
      * Netty的文件传输调用FileRegion包装的transferTo方法，可以直接将文件缓冲区的数据发送到目标Channel，避免通过循环write方式导致的内存拷贝问题。
      * Netty提供CompositeByteBuf类, 可以将多个ByteBuf合并为一个逻辑上的ByteBuf, 避免了各个ByteBuf之间的拷贝。
      * 通过wrap操作, 我们可以将byte[]数组、ByteBuf、ByteBuffer等包装成一个Netty ByteBuf对象, 进而避免拷贝操作。
      * ByteBuf支持slice操作，可以将ByteBuf分解为多个共享同一个存储区域的ByteBuf, 避免内存的拷贝。

### Netty缺点

- NIO的类库和API繁杂，学习成本高，你需要熟练掌握Selector、ServerSocketChannel、SocketChannel、ByteBuffer等。
- 需要熟悉Java多线程编程。这是因为NIO编程涉及到Reactor模式，你必须对多线程和网络编程非常熟悉，才能写出高质量的NIO程序。
- 臭名昭著的epoll bug。它会导致Selector空轮询，最终导致CPU 100%。直到JDK1.7版本依然没得到根本性的解决。

### 如何使用

#### 引入依赖

使用的版本是4.1.20，相对比较稳定的一个版本。

```
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.20.Final</version>
</dependency>
```

#### 创建服务端启动类

```
public class MyServer {
    public static void main(String[] args) throws Exception {
        //创建两个线程组 boosGroup、workerGroup
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            //创建服务端的启动对象，设置参数
            ServerBootstrap bootstrap = new ServerBootstrap();
            //设置两个线程组boosGroup和workerGroup
            bootstrap.group(bossGroup, workerGroup)
                //设置服务端通道实现类型    
                .channel(NioServerSocketChannel.class)
                //设置线程队列得到连接个数    
                .option(ChannelOption.SO_BACKLOG, 128)
                //设置保持活动连接状态    
                .childOption(ChannelOption.SO_KEEPALIVE, true)
                //使用匿名内部类的形式初始化通道对象
                .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel socketChannel) throws Exception {
                            //给pipeline管道设置处理器
                            socketChannel.pipeline().addLast(new MyServerHandler());
                        }
                    });//给workerGroup的EventLoop对应的管道设置处理器
            System.out.println("netty服务端已经准备就绪...");
            //绑定端口号，启动服务端
            ChannelFuture channelFuture = bootstrap.bind(6666).sync();
            //对关闭通道进行监听
            channelFuture.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}
```

#### 创建服务端处理器

```
/**
 * 自定义的Handler需要继承Netty规定好的HandlerAdapter
 * 才能被Netty框架所关联，有点类似SpringMVC的适配器模式
 **/
public class MyServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //获取客户端发送过来的消息
        ByteBuf byteBuf = (ByteBuf) msg;
        System.out.println("收到客户端" + ctx.channel().remoteAddress() + "发送的消息：" + byteBuf.toString(CharsetUtil.UTF_8));
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        //发送消息给客户端
        ctx.writeAndFlush(Unpooled.copiedBuffer("服务端已收到消息，并给你发送一个问号?", CharsetUtil.UTF_8));
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        //发生异常，关闭通道
        ctx.close();
    }
}
```

#### 创建客户端启动类

```
public class MyClient {

    public static void main(String[] args) throws Exception {
        NioEventLoopGroup eventExecutors = new NioEventLoopGroup();
        try {
            //创建bootstrap对象，配置参数
            Bootstrap bootstrap = new Bootstrap();
            //设置线程组
            bootstrap.group(eventExecutors)
                //设置客户端的通道实现类型    
                .channel(NioSocketChannel.class)
                //使用匿名内部类初始化通道
                .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            //添加客户端通道的处理器
                            ch.pipeline().addLast(new MyClientHandler());
                        }
                    });
            System.out.println("客户端准备就绪，随时可以起飞~");
            //连接服务端
            ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 6666).sync();
            //对通道关闭进行监听
            channelFuture.channel().closeFuture().sync();
        } finally {
            //关闭线程组
            eventExecutors.shutdownGracefully();
        }
    }
}
```

#### 创建客户端处理器

```
public class MyClientHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        //发送消息到服务端
        ctx.writeAndFlush(Unpooled.copiedBuffer("歪比巴卜~茉莉~Are you good~马来西亚~", CharsetUtil.UTF_8));
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //接收服务端发送过来的消息
        ByteBuf byteBuf = (ByteBuf) msg;
        System.out.println("收到服务端" + ctx.channel().remoteAddress() + "的消息：" + byteBuf.toString(CharsetUtil.UTF_8));
    }
}
```

### [运作流程](https://blog.csdn.net/qq_38685503/article/details/114168722)

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211082152413.png)



1. ServerBootStrap作为Netty的服务端入口，会对BossGroup和WorkGroup进行相关初始化操作。
   1. 在BossGroup中，主要是对客户端的新连接请求进行处理（即OP_ACCEPT事件，但其实OP_ACCEPT事件的具体处理也会涉及到读写事件，因为数据不是读就是写）
   2. 在WorkGroup中，则负责处理IO读写、编解码、业务逻辑等（即OP_READ事件、OP_WRITE事件）。
   3. 服务端启动的时候会绑定一个端口，作为后续客户端连接入口，绑定端口的时候会在BossGroup(由NioEventLoopGroup类创建的对象）的其中一个NioEventLoop的Selector（多路复用器）上注册一条NioServerSocketChannel通道，后面的连接处理就是在通道中进行的。
2. BootStrap则作为Netty的客户端入口，会对ClientGroup进行相关初始化操作，在ClientGroup中，先创建与服务端的连接（即OP_CONNECT事件），然后再进行IO读写、编解码、业务逻辑等操作（即OP_READ事件、OP_WRITE事件）。
3. 服务端和客户端启动之后，当服务端收到客户端发来的连接请求，由于属于OP_ACCEPT事件，在BossGroup中处理。
   1. BossGroup(由NioEventLoopGroup类创建的对象）管理着若干个NioEventLoop，每个NioEventLoop（事件循环）持有一个线程（就好比线程池中的一组线程并发处理若干个连接请求）
   2. 每个NioEventLoop上会创建一个Selector，一个Selector上可以注册多个通道（所以叫多路复用器），且它会以不断轮询的方式同时监听每个通道上是否有IO事件发生
   3. 每个通道里都会有个ChannelPipeline管道，管道里全是Handler，包括管道头Head和管道尾Tail，以及进行IO读写、编解码，业务处理的若干个Handler，Handler也可以自定义，把需要的Handler注册进管道就可以执行了。
   4. 当请求到达Head时，代表“请求数据”已准备好，OP_ACCEPT事件已就绪，Selector监听到事件已就绪，就会让持有的线程对事件进行处理，处理过程是在Handler中进行。
   5. 首先会创建一个NioSocketChannel实例，然后交给ServerBootStrapAcceptor（接收客户端连接对象）这个Handler，，Acceptor具体操作就是向WorkGroup中的某个Selector注册刚才创建好的NioSocketChannel，自此客户端连接请求处理结束。
4. 客户端发出连接请求的同时会自己创建一条NioSocketChannel通道与服务端NioSocketChannel进行互通，连接完之后就是WorkGroup的事了，不需要BossGroup管了，一个客户端连接对应一条服务端NioSocketChannel。

   比如现在客户端要进行一个远程方法的调用，将方法参数传给服务端后，服务端处理完将结果返回给客户端。

   1. 首先请求从客户端通道传输到WorkGroup中的对应通道
   2. 然后Head会申请一块堆外内存来缓冲请求内容，缓冲完之后，代表数据已准备好，OP_READ事件已就绪
   3. selector监听到就绪事件之后，让持有的线程对事件进行处理，这里我定义了Decode解码，Compute方法调用处理和Encode编码三个Handler进行操作，其中Inbound入站Handler包括Decode和Compute（从Head到Tail就是入站），Outbound出站Handler包括Encode（从Tail到Head就是出站），每一个Handler被注册到Pipeline中的时候都会创建一个与之对应的ChannelHandlerContext，它包含着Handler的上下文信息，主要负责管理和其他在同一管道里的Handler之间的交互，它有一个前指针和后指针，可以与其他ChannelHandlerContext关联，这样Handler处理就变得更加灵活，比如这次请求需要三个Handler，而下次请求只涉及到Decode和Encode，那下次就可以执行完Decode然后指针直接指向Encode，next指针具体指向谁是依靠ChannelHandlerContext中的数据类型与其他Handler类型进行匹配得出的。
   4. 在处理完读事件之后，接着处理Handler中涉及到的写事件，将处理结果写到ByteBuf中，回到Head，执行flush操作将ByteBuf内容写到SocketBuffer中，然后再到网卡buffer，通过互联网把结果传回给客户端，客户端拿到结果之后同样要进行解码，反序列化等操作，那么回过头发现客户端在发送调用请求之前在Pipeline中也进行了Encode处理的。（Head的主要作用：从SocketBuffer读请求内容到ByteBuf，从ByteBuf写返回结果到SocketBuffer）
5. 假设又有另外一个客户端连接了服务端，且和之前那个服务端NioSocketChannel注册到了同一个Selector上，当线程正在处理另一个通道上的事件的时候，这时该客户端也发起了一个处理请求，请求到达服务端通道之后会被Head读到堆外内存中缓冲着，此时OP_READ事件已就绪，Selector监听到了就绪事件，但由于线程正在处理另外一个通道上的事件，所以就要等当前通道的事件处理完，下一轮循环监听再处理了（这也是堆外内存的作用体现之一，数据可以先在缓冲区放着）。
6. 当两个通道被注册在不同的Selector上的时候就互不影响了，因为是在不同的线程中并行处理的。

>  #### 在netty中的IO事件类型：
>
>  * SelectionKey.OP_READ
>  * SelectionKey.OP_WRITE
>  * SelectionKey.OP_ACCEPT
>  * SelectionKey.OP_CONNECT
>
>  因此Selector每次循环监听的其实就是SelectionKey中的就绪事件集，看是否存在已就绪的事件，存在就进行处理。SelectionKey相当于是Selector和Channel之间的桥梁。
>
>  #### 如何理解Channel、Handler、EventLoop：
>
>  * 把 Channel 可以理解为数据的通道
>  * 把 msg 理解为流动的数据，最开始输入是 ByteBuf，但经过 pipeline 的加工，会变成其它类型对象，最后输出又变成 ByteBuf
>  * 把 Handler 理解为数据的处理工序
>    * 工序有多道，合在一起就是 pipeline，pipeline 负责发布事件（读、读取完成...）传播给每个 handler， handler 对自己感兴趣的事件进行处理（重写了相应事件处理方法）
>    * handler 分 Inbound 和 Outbound 两类
>  * 把 EventLoop 理解为处理数据的工人
>    * 工人可以管理多个 channel 的 io 操作，并且一旦工人负责了某个 channel，就要负责到底（绑定）
>    * 工人既可以执行 io 操作，也可以进行任务处理，每位工人有任务队列，队列里可以堆放多个 channel 的待处理任务，任务分为普通任务、定时任务
>    * 工人按照 pipeline 顺序，依次按照 handler 的规划（代码）处理数据，可以为每道工序指定不同的工人

### Netty相关对象和组件

#### Bootstrap与ServerBootStrap

Bootstrap和ServerBootStrap是Netty提供的一个创建客户端和服务端启动器的工厂类，使用这个工厂类非常便利地创建启动类，根据上面的一些例子，其实也看得出来能大大地减少了开发的难度。首先看一个类图：

![image.png](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211081713546.png)

可以看出都是继承于AbstractBootStrap抽象类，所以大致上的配置方法都相同。

一般来说，使用Bootstrap创建启动器的步骤可分为以下几步：

![image.png](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211081713172.png)

##### 设置线程组方法：group()

- bossGroup用于监听客户端连接，专门负责与客户端创建连接，并把连接注册到workerGroup的Selector中。
- workerGroup用于处理每一个连接发生的读写事件。

既然是线程组，那线程数默认是多少呢？深入源码：

```
 	// 从1，系统属性，CPU核心数*2 这三个值中取出一个最大的
    //可以得出 DEFAULT_EVENT_LOOP_THREADS 的值为CPU核心数*2
    private static final int DEFAULT_EVENT_LOOP_THREADS= Math.max(1, SystemPropertyUtil.getInt("io.netty.eventLoopThreads", NettyRuntime.availableProcessors() * 2));
    protected MultithreadEventLoopGroup(int nThreads, Executor executor, Object... args) {
        //如果不传入，则使用常量的值
        super(nThreads == 0 ? DEFAULT_EVENT_LOOP_THREADS : nThreads, executor, args);
    }
```

通过源码可以看到，默认的线程数是cpu核数的两倍。

假设想自定义线程数，可以使用有参构造器：

```
//设置bossGroup线程数为1
EventLoopGroup bossGroup = new NioEventLoopGroup(1);
//设置workerGroup线程数为16
EventLoopGroup workerGroup = new NioEventLoopGroup(16);
```

##### 设置通道类型的方法：channel()

NioSocketChannel： 异步非阻塞的客户端 TCP Socket 连接。

NioServerSocketChannel： 异步非阻塞的服务器端 TCP Socket 连接。

> 常用的就是这两个通道类型，因为是异步非阻塞的。所以是首选。

OioSocketChannel： 同步阻塞的客户端 TCP Socket 连接。

OioServerSocketChannel： 同步阻塞的服务器端 TCP Socket 连接。

NioSctpChannel： 异步的客户端 Sctp（Stream Control Transmission Protocol，流控制传输协议）连接。

NioSctpServerChannel： 异步的 Sctp 服务器端连接。

#### Selector

Netty中的Selector用于监听事件，管理注册到Selector中的channel，实现多路复用器。

首先要将对应的Channel及IO事件（读、写、连接）注册到Selector，注册后会产生一个SelectionKey对象，用于关联Selector和Channel，及后续的IO事件处理。这三者的关系如下图所示。

![image-20221109104512842](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211091047290.png)

#### ByteBuf

Netty的字节容器，它其实等同于Java Nio中的ByteBuffer，但是ByteBuf对Nio中的ByteBuffer的功能做了很多增强。

下面这段代码演示了ByteBuf的创建以及内容的打印，这里显示出了和普通ByteBuffer最大的区别之一，就是ByteBuf可以自动扩容，默认长度是256，如果内容长度超过阈值时，会自动触发扩容。

```
public class ByteBufExample {

    public static void main(String[] args) {
        ByteBuf buffer = ByteBufAllocator.DEFAULT.buffer(); //可自动扩容
        log(buffer);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 128; i++) {
            sb.append(" - " + i);
        }
        buffer.writeBytes(sb.toString().getBytes());
        log(buffer);
    }

    private static void log(ByteBuf buf) {
        StringBuilder builder = new StringBuilder()
            .append(" read index:").append(buf.readerIndex())//获取读索引
            .append(" write index:").append(buf.writerIndex()) //获取写索引
            .append(" capacity:").append(buf.capacity())//获取容量
            .append(StringUtil.NEWLINE);
        //把ByteBuf中的内容，dump到StringBuilder中
        ByteBufUtil.appendPrettyHexDump(builder, buf);
        System.out.println(builder.toString());
    }
}

```

##### 创建

* 第一种，创建基于堆内存的ByteBuf

  ```
  ByteBuf buffer = ByteBufAllocator.DEFAULT.heapBuffer(10);
  ```

* 第二种，创建基于直接内存（堆外内存）的ByteBuf（默认）

  ```
  ByteBuf buffer = ByteBufAllocator.DEFAULT.directBuffer(10);
  ```

  > Java中的内存分为两个部分，一部分是不需要jvm管理的直接内存，也被称为堆外内存。堆外内存就是把内存对象分配在JVM堆以外的内存区域，这部分内存不是虚拟机管理，而是由操作系统来管理，这样可以减少垃圾回收对应用程序的影响。
  >
  > 直接内存的好处是读写性能会高一些，如果数据存放在堆中，此时需要把Java堆空间的数据发送到远程服务器，首先需要把堆内部的数据拷贝到直接内存（堆外内存)，然后再发送，如果是把数据直接存储到堆外内存中，发送的时候就少了一个复制步骤。
  >
  > 但是它也有缺点，由于缺少了JMM的内存管理，所以需要我们自己来维护堆外内存，防止内存溢出。

  另外，需要注意的是，ByteBuf默认采用了池化技术来创建。它的核心思想是实现对象的复用，从而减少对象频繁创建销毁带来的性能开销。

  池化功能是否开启，可以通过下面的环境变量来控制，其中unpooled表示不开启。

  ```
  -Dio.netty.allocator.type={unpooled | pooled}
  ```

##### 存储结构

该结构包含四部分：

- 已经丢弃的字节，这部分数据是无效的
- 可读字节，这部分数据是ByteBuf的主体数据，从ByteBuf里面读取的数据都来自这部分;
- 可写字节，所有写到ByteBuf的数据都会存储到这一段
- 可扩容字节，表示ByteBuf最多还能扩容多少容量。

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211101654546.png)



在ByteBuf中，有两个指针:

- readerIndex:读指针，每读取一个字节，readerIndex自增加1。ByteBuf里面总共有witelndex-readerlndex个字节可读，当readerlndex和writeIndex相等的时候，ByteBuf不可读。
- writelndex:写指针，每写入一个字节，writeIndex自增加1，直到增加到capacity后，可以触发扩容后继续写入。
- ByteBuf中还有一个maxCapacity最大容量，默认的值是Integer.MAX_VALUE，当ByteBuf写入数据时，如果容量不足时，会触发扩容，直到capacity扩容到maxCapacity。

##### Write相关方法

对于write方法来说，ByteBuf提供了针对各种不同数据类型的写入，比如

- writeChar，写入char类型
- writelnt，写入int类型
- writeFloat，写入float类型
- writeBytes，写入nio的ByteBuffer
- writeCharSequence，写入字符串

```java
public class ByteBufExample {

    public static void main(String[] args) {
        
        ByteBuf buffer = ByteBufAllocator.DEFAULT.buffer(); //可自动扩容
        buffer.writeBytes(new byte[]{1,2,3,4});//写入四个字节
        log(buffer);
        buffer.writeInt(5); //写入一个int类型，也是4个字节
        log(buffer);
    }

    private static void log(ByteBuf buf) {

        StringBuilder builder = new StringBuilder()
            .append(" read index:").append(buf.readerIndex())//获取读索引
            .append(" write index:").append(buf.writerIndex()) //获取写索引
            .append(" capacity:").append(buf.capacity())//获取容量
            .append(StringUtil.NEWLINE);
        //把ByteBuf中的内容，dump到StringBuilder中
        ByteBufUtil.appendPrettyHexDump(builder, buf);
        System.out.println(builder.toString());
    }
}
```

##### 扩容

当向ByteBuf写入数据时，发现容量不足时，会触发扩容。

假设ByteBuf初始容量是10。扩容规则为：

* 内容大小>Integer.Max则抛出异常
* 内容大小==4M，直接返回最新容量为4M
* 内容大小 > 4M
  * 内容大小 <= 最大值-4M，最新容量=内容大小+4M
  * 内容大小 > 最大值-4M，最新容量=最大容量
* 内容大小 < 4M，每次扩容2倍，扩容基数为64kb。例如：64，128，256。

##### Reader相关方法

reader方法也同样针对不同数据类型提供了不同的操作方法，

- readByte，读取单个字节
- readInt，读取一个int类型
- readFloat，读取一个float类型

```java
public class ByteBufExample {

    public static void main(String[] args) {
        
        ByteBuf buffer = ByteBufAllocator.DEFAULT.buffer(); //可自动扩容
        buffer.writeBytes(new byte[]{1,2,3,4});//写入四个字节
        log(buffer);
        System.out.println(buffer.readByte());
        log(buffer);
    }

    private static void log(ByteBuf buf) {

        StringBuilder builder = new StringBuilder()
                .append(" read index:").append(buf.readerIndex())//获取读索引
                .append(" write index:").append(buf.writerIndex()) //获取写索引
                .append(" capacity:").append(buf.capacity())//获取容量
                .append(StringUtil.NEWLINE);
        //把ByteBuf中的内容，dump到StringBuilder中
        ByteBufUtil.appendPrettyHexDump(builder, buf);
        System.out.println(builder.toString());
    }
}
```

从下面结果中可以看到，读完一个字节后，这个字节就变成了废弃部分，再次读取的时候只能读取未读取的部分数据。

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211101701680.png)

另外，如果想重复读取哪些已经读完的数据，这里提供了两个方法来实现标记和重置

```java
 public static void main(String[] args) {
     
     ByteBuf buffer = ByteBufAllocator.DEFAULT.buffer(); //可自动扩容
     buffer.writeBytes(new byte[]{1,2,3,4});//写入四个字节
     log(buffer);
     buffer.markReaderIndex();//标记读取的索引位置
     System.out.println("开始进行读取操作");
     System.out.println(buffer.readByte());
     log(buffer);
     buffer.resetReaderIndex();//重置到标记位
     System.out.println("重置到标记位");
     log(buffer);
}
```

 另外，如果想不改变读指针位置来获得数据，在ByteBuf中提供了get开头的方法，这个方法基于索引位置读取，并且允许重复读取的功能。

##### ByteBuf的零拷贝机制

需要说明一下，ByteBuf的零拷贝机制和我们之前提到的操作系统层面的零拷贝不同，操作系统层面的零拷贝，是我们要把一个文件发送到远程服务器时，需要从内核空间拷贝到用户空间,再从用户空间拷贝到内核空间的网卡缓冲区发送，导致拷贝次数增加。

而ByteBuf中的零拷贝思想也是相同，都是减少数据复制提升性能。如图3-2所示，假设有一个原始ByteBuf，我们想对这个ByteBuf其中的两个部分的数据进行操作。按照正常的思路，我们会创建两个新的ByteBuf，然后把原始ByteBuf中的部分数据拷贝到两个新的ByteBuf中，但是这种会涉及到数据拷贝，在并发量较大的情况下，会影响到性能。

ByteBuf中提供了一个slice方法，这个方法可以在不做数据拷贝的情况下对原始ByteBuf进行拆分，使用方法如下

```java
public static void main(String[] args) {
    
    ByteBuf buffer = ByteBufAllocator.DEFAULT.buffer(); //可自动扩容
    buffer.writeBytes(new byte[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10});//写入四个字节
    log(buffer);
    ByteBuf b1 = buffer.slice(0, 5);
    ByteBuf b2 = buffer.slice(5, 5);
    log(b1);
    log(b2);
    System.out.println("修改原始数据");
    buffer.setByte(2, 5); //修改原始buf数据
    log(b1); //再次打印b1的结果。发现数据发生了变化
}
```

在上面的代码中，通过slice对原始buf进行切片，每个分片是5个字节。

为了证明slice是没有数据拷贝，我们通过修改原始buf的索引2所在的值，然后再打印第一个分片b1,可以发现b1的结果发生了变化。说明两个分片和原始buf指向的数据是同一个。

##### Unpooled

 Unpooled工具类，它是同了非池化的ByteBuf的创建、组合、复制等操作。

 假设有一个协议数据，它有头部和消息体组成，这两个部分分别放在两个ByteBuf中

```mipsasm
ByteBuf header = ...
ByteBuf body = ...
```

我们希望把header和body合并成一个ByteBuf，通常的做法是

```java
ByteBuf allBuf = Unpooled.buffer(header.readableBytes() + body.readableBytes());
allBuf.writeBytes(header);
allBuf.writeBytes(body);
```

 在这个过程中，我们把header和body拷贝到了新的allBuf中，这个过程在无形中增加了两次数据拷贝操作。那有没有更高效的方法减少拷贝次数来达到相同目的呢?
​ 在Netty中，提供了一个`CompositeByteBuf`组件，它提供了这个功能。

```java
public static void main(String[] args) {

    ByteBuf header = ByteBufAllocator.DEFAULT.buffer(); //可自动扩容
    header.writeCharSequence("header", CharsetUtil.UTF_8);
    ByteBuf body = ByteBufAllocator.DEFAULT.buffer(); //可自动扩容
    body.writeCharSequence("body",CharsetUtil.UTF_8);
    CompositeByteBuf compositeByteBuf = Unpooled.compositeBuffer();
    //其中第一个参数是true，表示当添加新的ByteBuf时，自动递增CompositeByteBuf的writeIndex
    //默认是false,就是writeIndex=0,这样的话我们不可能从CompositeByteBuf中读到数据
    compositeByteBuf.addComponents(true,header,body);
    log(compositeByteBuf);

    ByteBuf allBuf = Unpooled.buffer(header.readableBytes() + body.readableBytes());
    allBuf.writeBytes(header);
    allBuf.writeBytes(body);
}
```

 之所以CompositeByteBuf能够实现零拷贝，是因为在组合header和body时，并没有对这两个数据进行复制，而是通过CompositeByteBuf构建了一个逻辑整体，里面仍然是两个真实对象，也就是有一个指针指向了同一个对象，所以这里类似于浅拷贝的实现。

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211101701920.png)

##### wrappedBuffer

 在Unpooled工具类中，提供了一个wrappedBuffer方法，来实现CompositeByteBuf零拷贝功能。使用方法如下。

##### copiedBuffer

copiedBuffer，和wrappedBuffer最大的区别是，该方法会实现数据复制，下面代码演示了
copiedBuffer和wrappedbuffer的区别，可以看到在`case`标注的位置中，修改了原始ByteBuf的值，并没有影响到原来的值。

```java
public static void main(String[] args) {
    
    ByteBuf header= ByteBufAllocator.DEFAULT.buffer();
    header.writeBytes(new byte[]{1,2,3,4,5});
    ByteBuf body=ByteBufAllocator.DEFAULT.buffer();
    body.writeBytes(new byte[]{6,7,8,9,10});
    ByteBuf total=Unpooled.wrappedBuffer(header,body);
    log(total);
    header.setByte(2,9);
    log(total);
    System.out.println("===============================");
    ByteBuf byteBuf = Unpooled.copiedBuffer(header, body);
    log(byteBuf);
    header.setByte(2,8);
    log(byteBuf);
}

case:
/**
     *  read index:0 write index:10 capacity :10         +-------------------------------------------------+
     *          |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
     * +--------+-------------------------------------------------+----------------+
     * |00000000| 01 02 03 04 05 06 07 08 09 0a                   |..........      |
     * +--------+-------------------------------------------------+----------------+
     *  read index:0 write index:10 capacity :10         +-------------------------------------------------+
     *          |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
     * +--------+-------------------------------------------------+----------------+
     * |00000000| 01 02 09 04 05 06 07 08 09 0a                   |..........      |
     * +--------+-------------------------------------------------+----------------+
     * ===============================
     *  read index:0 write index:10 capacity :10         +-------------------------------------------------+
     *          |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
     * +--------+-------------------------------------------------+----------------+
     * |00000000| 01 02 09 04 05 06 07 08 09 0a                   |..........      |
     * +--------+-------------------------------------------------+----------------+
     *  read index:0 write index:10 capacity :10         +-------------------------------------------------+
     *          |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
     * +--------+-------------------------------------------------+----------------+
     * |00000000| 01 02 09 04 05 06 07 08 09 0a                   |..........      |
     * +--------+-------------------------------------------------+----------------+
     */
```

##### 内存释放

针对不同的ByteBuf创建，内存释放的方法不同。

- UnpooledHeapByteBuf，使用JVM内存，只需要等待GC回收即可
- UnpooledDirectByteBuf，使用堆外内存，需要特殊方法来回收内存
- PooledByteBuf和它的子类使用了池化机制，需要更复杂的规则来回收

内存如果ByteBuf是使用堆外内存来创建，那么尽量手动释放内存，那怎么释放呢?

Netty采用了引用计数方法来控制内存回收，每个ByteBuf都实现了ReferenceCounted接口。

- 每个ByteBuf对象的初始计数为1
- 调用release方法时，计数器减一，如果计数器为0，ByteBuf被回收
- 调用retain方法时，计数器加一，表示调用者没用完之前，其他handler即时调用了release也不会造成回收。
- 当计数器为0时，底层内存会被回收，这时即使ByteBuf对象还存在，但是它的各个方法都无法正常使用

#### TaskQueue任务队列

**解决问题：耗时的业务处理，防止阻塞**

在 ChannelInboundHandlerAdapter 的 channelRead 方法执行时 , 客户端与服务器端的反应器 Reactor 线程 NioEventLoop 是处于阻塞状态的 , 此时服务器端与客户端同时都处于阻塞状态 , 这样肯定不行 , 因为 NioEventLoop 需要为多个客户端服务 , 不能因为与单一客户端交互而产生阻塞 ;

**用法：**

```
public class MyServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //获取到线程池eventLoop，添加线程，执行
        ctx.channel().eventLoop().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    //长时间操作，不至于长时间的业务操作导致Handler阻塞
                    Thread.sleep(1000);
                    System.out.println("长时间的业务处理");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
```

#### ScheduleTaskQueue延时任务队列

**解决问题：需要定时执行的业务**

**用法：**

```
@Override
public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
    ctx.channel().eventLoop().schedule(new Runnable() {
        @Override
        public void run() {
            try {
                //长时间操作，不至于长时间的业务操作导致Handler阻塞
                Thread.sleep(1000);
                System.out.println("长时间的业务处理");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    },5, TimeUnit.SECONDS);//5秒后执行
}
```

#### Channel

Channel 是 Netty 网络操作抽象类，它除了包括基本的 I/O 操作，如 bind、connect、read、write 之外，还包括了 Netty 框架相关的一些功能，如获取该 Channel 的EventLoop。

**作用：**

* close() 可以用来关闭 channel
* closeFuture() 用来处理 channel 的关闭
  * sync 方法作用是同步等待 channel 关闭
  * 而 addListener 方法是异步等待 channel 关闭
* pipeline() 方法添加处理器
* write() 方法将数据写入
* writeAndFlush() 方法将数据写入并刷出

#### EventLoop&EventLoopGroup

**事件循环对象**

EventLoop 本质是一个单线程执行器（同时维护了一个 Selector），里面有 run 方法处理 Channel 上源源不断的 io 事件。

它的继承关系比较复杂

* 一条线是继承自 j.u.c.ScheduledExecutorService 因此包含了线程池中所有的方法
* 另一条线是继承自 netty 自己的 OrderedEventExecutor，
* 提供了 **boolean inEventLoop(Thread thread)** 的方法判断一个线程是否属于此 EventLoop
* 提供了 parent 方法来看看自己属于哪个 EventLoopGroup

**事件循环组**

EventLoopGroup 是一组 EventLoop，Channel 一般会调用 EventLoopGroup 的 register 方法来绑定其中一个 EventLoop，后续这个 Channel 上的 io 事件都由此 EventLoop 来处理（保证了 io 事件处理时的线程安全）

* 继承自 netty 自己的 EventExecutorGroup
* 实现了 Iterable 接口提供遍历 EventLoop 的能力
* 另有 next 方法获取集合中下一个 EventLoop

Channel 为Netty 网络操作抽象类，EventLoop 主要是为Channel 处理 I/O 操作，两者配合参与 I/O 操作。

下图是Channel、EventLoop、Thread、EventLoopGroup之间的关系（摘自《Netty In Action》）：

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211082105620.jpeg)

- 一个 EventLoopGroup 包含一个或多个 EventLoop。
- 一个 EventLoop 在它的生命周期内只能与一个Thread绑定。
- 所有有 EnventLoop 处理的 I/O 事件都将在它专有的 Thread 上被处理。
- 一个 Channel 在它的生命周期内只能注册与一个 EventLoop。
- 一个 EventLoop 可被分配至一个或多个 Channel 。

当一个连接到达时，Netty 就会注册一个 Channel，然后从 EventLoopGroup 中分配一个 EventLoop 绑定到这个Channel上，在该Channel的整个生命周期中都是有这个绑定的 EventLoop 来服务的。

#### ChannelFuture

Netty 为异步非阻塞，即所有的 I/O 操作都为异步的，因此，我们不能立刻得知消息是否已经被处理了。Netty 提供了 ChannelFuture 接口，通过该接口的 addListener() 方法注册一个 ChannelFutureListener，当操作执行成功或者失败时，监听就会自动触发返回结果。

**解决问题：需要对操作进行监听的业务**

**用法：**

```
ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 6666).addListener((ChannelFutureListener) future -> {
    //使用匿名内部类，ChannelFutureListener接口
    //重写operationComplete方法
    @Override
    public void operationComplete(ChannelFuture future) throws Exception {
    	/**
    	 * 主要方法有：
         * isDone 判断当前操作是否完成
         * isSuccess 判断当前操作是否成功执行
         * getCause 获取当前操作失败的原因
         * isCanclled 判断当前已完成的操作是否被取消
         */
        //判断是否操作成功    
        if (future.isSuccess()) {
            System.out.println("连接成功");
        } else {
            System.out.println("连接失败");
        }
    }
}).sync();
//或者在客户端处理
@Override
public void channelActive(ChannelHandlerContext ctx) throws Exception {
	//发送消息到服务端
	ctx.writeAndFlush(Unpooled.copiedBuffer("我是客户端", CharsetUtil.UTF_8));
}

```

#### ChannelHandler&ChannelPipeline

ChannelHandler 为 Netty 中最核心的组件，它充当了所有处理入站和出站数据的应用程序逻辑的[容器](https://cloud.tencent.com/product/tke?from=10680)。ChannelHandler 主要用来处理各种事件，这里的事件很广泛，比如可以是连接、数据接收、异常、数据转换等。

* 入站处理器通常是 ChannelInboundHandlerAdapter 的子类，主要用来读取客户端数据，写回结果
* 出站处理器通常是 ChannelOutboundHandlerAdapter 的子类，主要对写回结果进行加工

打个比喻，每个 Channel 是一个产品的加工车间，Pipeline 是车间中的流水线，ChannelHandler 就是流水线上的各道工序，而后面要讲的 ByteBuf 是原材料，经过很多工序的加工：先经过一道道入站工序，再经过一道道出站工序最终变成产品。

所有 ChannelHandler 被连成一串，就是 Pipeline，ChannelPipeline 为 ChannelHandler 链提供了一个容器并定义了用于沿着链传播入站和出站事件流的 API。一个数据或者事件可能会被多个 Handler 处理，在这个过程中，数据或者事件经流 ChannelPipeline，由 ChannelHandler 处理。在这个处理过程中，一个 ChannelHandler 接收数据后处理完成后交给下一个 ChannelHandler，或者什么都不做直接交给下一个 ChannelHandler。

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211082105583.png)

当一个数据流进入 ChannlePipeline 时，它会从 ChannelPipeline 头部开始传给第一个 ChannelInboundHandler ，当第一个处理完后再传给下一个，一直传递到管道的尾部。与之相对应的是，当数据被写出时，它会从管道的尾部开始，先经过管道尾部的 “最后” 一个ChannelOutboundHandler，当它处理完成后会传递给前一个 ChannelOutboundHandler 。

当 ChannelHandler 被添加到 ChannelPipeline 时，它将会被分配一个 ChannelHandlerContext，它代表了 ChannelHandler 和 ChannelPipeline 之间的绑定。其中 ChannelHandler 添加到 ChannelPipeline 过程如下：

1. 一个 ChannelInitializer 的实现被注册到了 ServerBootStrap中
2. 当 ChannelInitializer.initChannel() 方法被调用时，ChannelInitializer 将在 ChannelPipeline 中安装一组自定义的 ChannelHandler
3. ChannelInitializer 将它自己从 ChannelPipeline 中移除

猜一下，下面的输出结果：

```
new ServerBootstrap()
    .group(new NioEventLoopGroup())
    .channel(NioServerSocketChannel.class)
    .childHandler(new ChannelInitializer<NioSocketChannel>() {
        protected void initChannel(NioSocketChannel ch) {
            ch.pipeline().addLast(new ChannelInboundHandlerAdapter(){
                @Override
                public void channelRead(ChannelHandlerContext ctx, Object msg) {
                    System.out.println(1);
                    ctx.fireChannelRead(msg); // 1
                }
            });
            ch.pipeline().addLast(new ChannelInboundHandlerAdapter(){
                @Override
                public void channelRead(ChannelHandlerContext ctx, Object msg) {
                    System.out.println(2);
                    ctx.fireChannelRead(msg); // 2
                }
            });
            ch.pipeline().addLast(new ChannelInboundHandlerAdapter(){
                @Override
                public void channelRead(ChannelHandlerContext ctx, Object msg) {
                    System.out.println(3);
                    ctx.channel().write(msg); // 3
                }
            });
            ch.pipeline().addLast(new ChannelOutboundHandlerAdapter(){
                @Override
                public void write(ChannelHandlerContext ctx, Object msg, 
                                  ChannelPromise promise) {
                    System.out.println(4);
                    ctx.write(msg, promise); // 4
                }
            });
            ch.pipeline().addLast(new ChannelOutboundHandlerAdapter(){
                @Override
                public void write(ChannelHandlerContext ctx, Object msg, 
                                  ChannelPromise promise) {
                    System.out.println(5);
                    ctx.write(msg, promise); // 5
                }
            });
            ch.pipeline().addLast(new ChannelOutboundHandlerAdapter(){
                @Override
                public void write(ChannelHandlerContext ctx, Object msg, 
                                  ChannelPromise promise) {
                    System.out.println(6);
                    ctx.write(msg, promise); // 6
                }
            });
        }
    });
```

### 相关面试题

#### Netty 是什么？

* Netty 是一个 **基于 NIO** 的 client-server(客户端服务器)框架，使用它可以快速简单地开发网络应用程序。
* 它极大地简化并优化了 TCP 和 UDP 套接字服务器等网络编程,并且性能以及安全性等很多方面甚至都要更好。
* **支持多种协议** 如 FTP，SMTP，HTTP 以及各种二进制和基于文本的传统协议。

#### 为什么要用 Netty？

- 统一的 API，支持多种传输类型，阻塞和非阻塞的。
- 简单而强大的线程模型。
- 自带编解码器解决 TCP 粘包/拆包问题。
- 自带各种协议栈。
- 真正的无连接数据包套接字支持。
- 比直接使用 Java 核心 API 有更高的吞吐量、更低的延迟、更低的资源消耗和更少的内存复制。
- 安全性不错，有完整的 SSL/TLS 以及 StartTLS 支持。
- 社区活跃
- 成熟稳定，经历了大型项目的使用和考验，而且很多开源项目比如我们常用的 Dubbo、RocketMQ、Elasticsearch、gRPC 等等都用到了 Netty。

#### Netty 应用场景了解么？

理论上来说，NIO 可以做的事情 ，使用 Netty 都可以做并且更好。Netty 主要用来做**网络通信** :

* 作为 RPC 框架的网络通信组件** ：我们在分布式系统中，不同服务节点之间经常需要相互调用，这个时候就需要 RPC 框架了。不同服务节点之间的通信是如何做的呢？可以使用 Netty 来做。比如我调用另外一个节点的方法的话，至少是要让对方知道我调用的是哪个类中的哪个方法以及相关参数吧！
* **实现一个自己的 HTTP 服务器** ：通过 Netty 我们可以自己实现一个简单的 HTTP 服务器，这个大家应该不陌生。说到 HTTP 服务器的话，作为 Java 后端开发，我们一般使用 Tomcat 比较多。一个最基本的 HTTP 服务器可要以处理常见的 HTTP Method 的请求，比如 POST 请求、GET 请求等等。
* **实现一个即时通讯系统** ：使用 Netty 我们可以实现一个可以聊天类似微信的即时通讯系统，这方面的开源项目还蛮多的，可以自行去 Github 找一找。
* **实现消息推送系统** ：市面上有很多消息推送系统都是基于 Netty 来做的。

#### Netty 核心组件有哪些？分别有什么作用？

##### 1.Channel

**Channel** 接口是 **Netty** 对网络操作抽象类，它除了包括基本的 **I/O** 操作，如 **bind()**、**connect()**、**read()**、**write()** 等。

比较常用的**Channel**接口实现类是**NioServerSocketChannel**（服务端）和**NioSocketChannel**（客户端），这两个 **Channel** 可以和 **BIO** 编程模型中的**ServerSocket**以及**Socket**两个概念对应上。**Netty** 的 **Channel** 接口所提供的 **API**，大大地降低了直接使用 **Socket** 类的复杂性。

##### 2.EventLoop

这么说吧！**EventLoop**（事件循环）接口可以说是 **Netty** 中最核心的概念了！

《Netty 实战》这本书是这样介绍它的：

> “EventLoop 定义了 Netty 的核心抽象，用于处理连接的生命周期中所发生的事件。

是不是很难理解？说实话，我学习 Netty 的时候看到这句话是没太能理解的。

说白了，**EventLoop 的主要作用实际就是负责监听网络事件并调用事件处理器进行相关 I/O 操作的处理。**

那 **Channel** 和 **EventLoop** 直接有啥联系呢？

Channel 为 Netty 网络操作(读写等操作)抽象类，**EventLoop** 负责处理注册到其上的**Channel** 处理 I/O 操作，两者配合参与 I/O 操作。

##### 3.ChannelFuture

**Netty** 是异步非阻塞的，所有的 I/O 操作都为异步的。

因此，我们不能立刻得到操作是否执行成功，但是，你可以通过 **ChannelFuture** 接口的 **addListener()** 方法注册一个 **ChannelFutureListener**，当操作执行成功或者失败时，监听就会自动触发返回结果。

并且，你还可以通过**ChannelFuture 的 channel()** 方法获取关联的**Channel**

```text
public interface ChannelFuture extends Future<Void> {
    Channel channel();

    ChannelFuture addListener(GenericFutureListener<? extends Future<? super Void>> var1);
     ......

    ChannelFuture sync() throws InterruptedException;
}
```

另外，我们还可以通过 **ChannelFuture** 接口的 **sync()**方法让异步的操作变成同步的。

##### 4.ChannelHandler 和 ChannelPipeline

下面这段代码使用过 Netty 的小伙伴应该不会陌生，我们指定了序列化编解码器以及自定义的 **ChannelHandler** 处理消息。

```text
        b.group(eventLoopGroup)
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) {
                        ch.pipeline().addLast(new NettyKryoDecoder(kryoSerializer, RpcResponse.class));
                        ch.pipeline().addLast(new NettyKryoEncoder(kryoSerializer, RpcRequest.class));
                        ch.pipeline().addLast(new KryoClientHandler());
                    }
                });
```

**ChannelHandler** 是消息的具体处理器。他负责处理读写操作、客户端连接等事情。

**ChannelPipeline** 为 **ChannelHandler** 的链，提供了一个容器并定义了用于沿着链传播入站和出站事件流的 API 。当 **Channel** 被创建时，它会被自动地分配到它专属的**ChannelPipeline**。

我们可以在 **ChannelPipeline** 上通过 **addLast()** 方法添加一个或者多个**ChannelHandler** ，因为一个数据或者事件可能会被多个 **Handler** 处理。当一个 **ChannelHandler** 处理完之后就将数据交给下一个 **ChannelHandler** 。

#### EventloopGroup 了解么?和 EventLoop 啥关系?

EventLoopGroup（线程组）包含多个 EventLoop（每一个 EventLoop 通常内部包含一个线程），上面我们已经说了 EventLoop 的主要作用实际就是负责监听网络事件并调用事件处理器进行相关 I/O 操作的处理。

并且 EventLoop 处理的 I/O 事件都将在它专有的 Thread 上被处理，即 Thread 和 EventLoop 属于 1 : 1 的关系，从而保证线程安全。

#### Bootstrap 和 ServerBootstrap 了解么？

* Bootstrap 是客户端的启动引导类/辅助类。

* ServerBootstrap 服务的启动引导类/辅助类

* Bootstrap 通常使用 connet() 方法连接到远程的主机和端口，作为一个 Netty TCP 协议通信中的客户端。另外，Bootstrap 也可以通过 bind() 方法绑定本地的一个端口，作为 UDP 协议通信中的一端。
* ServerBootstrap通常使用 bind() 方法绑定本地的端口上，然后等待客户端的连接。
* Bootstrap 只需要配置一个线程组— EventLoopGroup ,而 ServerBootstrap需要配置两个线程组— EventLoopGroup ，一个用于接收连接，一个用于具体的处理。

#### Netty 服务端和客户端的启动过程了解么？

**服务端：**

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211091129493.png)

**客户端：**

* 用户线程创建Bootstrap实例，通过API设置创建客户端相关的参数，异步发起客户端连接。
* 创建处理客户端连接、I/O读写的Reator线程组NioEventLoopGroup。可以通过构造函数指定I/O线程的个数，默认为CPU内核数的2倍。
* 通过Bootstrap的ChannelFactory和用户指定的Channel类型创建用于客户端连接的NioSocketChannel，它的功能类似于JDK NIO类库提供的SocketChannel。
* 创建默认的Channel Handler Pipeline，用于调度和执行网络事件。
* 异步发起TCP连接，判断连接是否成功。如果成功，则直接将NioSocketChannel注册到多路复用器上，监听读操作位，用于数据报读取和消息发送。如果没有立即连接成功，则注册连接监听位到多路复用器，等待连接结果。
* 注册对应的网络监听状态位到多路复用器。
* 由多路复用器在I/O现场中轮询Channel，处理连接结果。
* 如果连接成功，设置Future结果，发送连接成功事件，触发ChannelPipeline执行。
  有ChannelPipeline调度执行系统和用户的ChannelHandler，执行业务逻辑。

#### Netty 长连接、心跳机制了解么？

在 TCP 保持长连接的过程中，可能会出现断网等网络异常出现，异常发生的时候， client 与 server 之间如果没有交互的话，他们是无法发现对方已经掉线的。为了解决这个问题, 我们就需要引入 心跳机制 。

心跳机制的工作原理是: 在 client 与 server 之间在一定时间内没有数据交互时, 即处于

idle 状态时, 客户端或服务器就会发送一个特殊的数据包给对方, 当接收方收到这个数据报文后, 也立即发送一个特殊的数据报文, 回应发送方, 此即一个 PING-PONG 交互。所以, 当某一端收到心跳消息后, 就知道了对方仍然在线, 这就确保 TCP 连接的有效性.

TCP 实际上自带的就有长连接选项，本身是也有心跳包机制，也就是 TCP 的选项：

SO_KEEPALIVE。但是，TCP 协议层面的长连接灵活性不够。所以，一般情况下我们都是在应用层协议上实现自定义信跳机制的，也就是在 Netty 层面通过编码实现。通过 Netty 实现心跳机制的话，核心类是 IdleStateHandler 。

#### Netty 的零拷贝了解么？

![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211091146020.png)

传统数据拷贝方式：
（1）数据从存储设备或网卡缓冲区，拷贝到内核的received buffer
（2）数据从received buffer读到堆外内存，再拷贝到用户缓冲区
（3）数据从用户缓冲区拷贝到堆外内存，再写到内核的send buffer
（4）数据从send buffer再拷贝到网卡buffer
Netty零拷贝方式：
（1）调用java的FileChannel.transferTo()，数据从存储设备或网卡buffer利用DMA引擎拷贝到received buffer
（2）数据从received buffer读到堆外内存
（3）数据从堆外内存写到send buffer
（4）数据从send buffer再利用DMA引擎拷贝到网卡buffer
由于以上操作都不需要CPU参与，所以就达到了“零拷贝”的效果，传统拷贝都是需要CPU参与的，就会占用cpu资源，DMA拷贝是不需要CPU的。
除此之外，对于传统的ByteBuffer，如果需要将两个ByteBuffer中的数据组合到一起，我们就需要创建一个size=size1+size2大小的新的数组，然后将两个数组中的数据拷贝到新的数组中。

但是使用Netty提供的组合ByteBuf（CompositeByteBuf），就可以避免这样的操作，因为CompositeByteBuf并没有真正将多个Buffer组合起来，而是保存了它们的引用，从而避免了数据的拷贝，这也是“零拷贝”的另一个体现。


#### Netty是基于NIO实现的，那么什么是NIO？Netty中的NIO相比原始NIO的优势在哪儿？

**NIO**

非阻塞IO模型

**优势：**

- JDK的NIO存在空轮询的BUG，而Netty则巧妙的规避了这一点；
- JDK的API复杂，开发人员使用起来比较困难，更重要的是，很容易写出BUG；而Netty的API简单，容易上手。
- Netty的性能更高，它在JDK的基础上做了很多性能优化，例如将selector中的`publicSelectedKeys`属性的数据结构由Set集合改成了数组。
- Netty底层对IO模型可以随意切换，针对Reactor三种线程模型，只需要通过修改参数就可以实现IO模型的切换。
- Netty经过了众多高并发场景的考验，如Dubbo等RPC框架的验证。
- Netty帮助我们解决了TCP的粘包拆包等问题，开发人员不用去关心这些问题，只需专注于业务逻辑开发即可。
- Netty支持很多协议栈。JDK自带的对象序列化性能很差，序列化后码流较大，而是用其他方式的序列化则性能较高，例如protobuf等。

#### Netty的线程模型是基于Reactor线程模型的，那么什么是Reactor线程模型呢？

[Netty中的Reactor和Proactor模型 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/299483420)

#### Netty是异步非阻塞的，异步和非阻塞体现在什么地方？

- 首先Netty非阻塞就是因为NIO中的Selector，可以轮询监听多条通道（一个客户端对应一条通道），而不像传统的BIO，一个线程只能负责一个客户端，只要客户端没发请求过来，线程就一直阻塞着傻傻等待，浪费资源。
- 第二个异步的概念是当一个异步过程调用发出后会立即返回，调用者不能立刻得到结果。实际处理完成后，通过状态、通知或者回调的形式来告诉调用者，异步的优势是在高并发情形下会更稳定，具有更高吞吐量。
- Netty中的IO操作都是异步的，异步的实现是依靠ChannelFuture，它可以添加ChannelFutureListener监听器，当IO操作真正完成的时候，客户端会得到操作成功或失败的通知。

#### Netty对于TCP粘包、半包问题的解决？

[Netty源码分析系列之TCP粘包、半包问题以及Netty是如何解决的 (qq.com)](https://mp.weixin.qq.com/s/IihycUIcdTuigEmBbbkfBg)

#### Netty为什么不使用AIO?

1. Netty 不看重 Windows 上的使用，在 Linux 系统上，AIO 的底层实现仍使用 EPOLL，没有很好实现 AIO，因此在性能上没有明显的优势，而且被 JDK 封装了一层不容易深度优化
2. Netty 整体架构是 [reactor](https://www.zhihu.com/search?q=reactor&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2308722039}) 模型, 而 AIO 是 [proactor](https://www.zhihu.com/search?q=proactor&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2308722039}) 模型, 混合在一起会非常混乱,把 AIO 也改造成 reactor 模型看起来是把 [epoll](https://www.zhihu.com/search?q=epoll&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2308722039}) 绕个弯又绕回来，具体模型可以参考这篇文章：[你真的了解Netty吗？](https://zhuanlan.zhihu.com/p/442455800)
3. AIO 还有个缺点是接收数据需要预先分配缓存, 而不是 NIO 那种需要接收时才需要分配缓存, 所以对连接数量非常大但流量小的情况, 内存浪费很多
4. Linux 上 AIO 不够成熟，处理回调结果速度跟不到处理需求，比如外卖员太少，顾客太多，供不应求，造成处理速度有瓶颈


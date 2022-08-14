---
title: gRPC入门
date: 2022-08-14 19:35:05
categories: 微服务
tags: RPC
---
在 gRPC 中，客户端应用程序可以直接调用另一台计算机上的服务器应用程序上的方法，就好像它是本地对象一样，从而使您可以更轻松地创建分布式应用程序和服务。与许多 RPC 系统一样，gRPC 基于定义服务的思想，指定可以使用其参数和返回类型远程调用的方法。在服务器端，服务器实现此接口并运行 gRPC 服务器来处理客户端调用。在客户端，客户端有一个存根，该存根提供与服务器相同的方法。
<!-- more -->


### 一、简介

在 gRPC 中，客户端应用程序可以直接调用另一台计算机上的服务器应用程序上的方法，就好像它是本地对象一样，从而使您可以更轻松地创建分布式应用程序和服务。与许多 RPC 系统一样，gRPC 基于定义服务的思想，指定可以使用其参数和返回类型远程调用的方法。在服务器端，服务器实现此接口并运行 gRPC 服务器来处理客户端调用。在客户端，客户端有一个存根，该存根提供与服务器相同的方法。

<iframe id="embed_dom" name="embed_dom" frameborder="0" style="display:block;width:800px; height:500px;" src="https://www.processon.com/embed/62f620f1e0b34d075574d809"></iframe>

### 二、特性

#### 1、基于HTTP/2

HTTP/2 提供了连接多路复用、双向流、服务器推送、请求优先级、首部压缩等机制。可以节省带宽、降低TCP链接次数、节省CPU，帮助移动设备延长电池寿命等。gRPC 的协议设计上使用了HTTP2 现有的语义，请求和响应的数据使用HTTP Body 发送，其他的控制信息则用Header 表示。

#### 2、IDL使用ProtoBuf

gRPC使用ProtoBuf来定义服务，ProtoBuf是由Google开发的一种数据序列化协议（类似于XML、JSON、hessian）。ProtoBuf能够将数据进行序列化，并广泛应用在数据存储、通信协议等方面。压缩和传输效率高，语法简单，表达力强。

#### 3、多语言支持

gRPC支持多种语言（C, C++, Python, PHP, Nodejs, C#, Objective-C、Golang、Java），并能够基于语言自动生成客户端和服务端功能库。目前已提供了C版本grpc、Java版本grpc-java 和 Go版本grpc-go，其它语言的版本正在积极开发中，其中，grpc支持C、C++、Node.js、Python、Ruby、Objective-C、PHP和C#等语言，grpc-java已经支持Android开发。

#### 4、gRPC优缺点

**优点**

- protobuf二进制消息，性能好/效率高（空间和时间效率都很不错）
- proto文件生成目标代码，简单易用
- 序列化反序列化直接对应程序中的数据类，不需要解析后在进行映射(XML,JSON都是这种方式)
- 支持向前兼容（新加字段采用默认值）和向后兼容（忽略新加字段），简化升级
- 支持多种语言（可以把proto文件看做IDL文件）
- Netty等一些框架集成

**缺点**：

- GRPC尚未提供连接池，需要自行实现
- 尚未提供“服务发现”、“负载均衡”机制
- 因为基于HTTP2，绝大部多数HTTP Server、Nginx都尚不支持，即Nginx不能将GRPC请求作为HTTP请求来负载均衡，而是作为普通的TCP请求。（nginx1.9版本已支持）
- Protobuf二进制可读性差（貌似提供了Text_Fromat功能）
   默认不具备动态特性（可以通过动态定义生成消息类型或者动态编译支持）

### 二、Protocol Buffers
protobuf 是 Google 公司内部的混合语言数据标准，默认情况下，grpc使用的就是protobuf。你可以理解Protocol Buffers是一种更加灵活、高效的数据格式，与XML、JSON类似，在一些高性能且对响应速度有要求的数据传输场景非常适用。
>目前已经正在使用的有超过 48,162 种报文格式定义和超过 12,183 个 .proto 文件。他们用于 RPC 系统和持续数据存储系统。Protocol Buffers 是一种轻便高效的结构化数据存储格式，可以用于结构化数据串行化，或者说序列化。它很适合做数据存储或 **RPC 数据交换格式**。可用于通讯协议、数据存储等领域的语言无关、平台无关、可扩展的序列化结构数据格式。目前提供了 C++、Java、Python 三种语言的 API（即时通讯网注：Protobuf官方工程主页上显示的已支持的开发语言多达10种，分别有：C++、Java、Python、Objective-C、C#、JavaNano、JavaScript、Ruby、Go、PHP，基本上主流的语言都已支持，详见工程主页：[https://github.com/52im/protobuf](https://link.zhihu.com/?target=https%3A//github.com/52im/protobuf)）。

**在RPC框架中的作用：**

* 定义数据结构
* 定义服务接口
* 通过序列化和反序列化，提升传输效率

#### 1、如何使用它

* 在后缀为.proto文件中定义数据结构（被远程调用服务的接口文档）

  * ```
    //使用的版本号
    syntax = "proto3";
    option go_package = "../proto;client";
    option java_multiple_files = true;
    option java_package="com.example.grpcexample.helloworld";
    //请求
    message Request {
        double num1 = 1;
        double num2 = 2;
        OperateType opType = 3;
    }
    //枚举类
    enum OperateType {
        Addition = 0;
        Division = 1;
        Multiplication = 2;
        Subtraction = 3;
    }
    //响应
    message Response {
        double result = 1;
    }
    
    //定义服务
    service Operate {
    	//一元RPC
        rpc Calculate (Request) returns (Response);
        
        //服务器流式 RPC
        rpc Calculate (Request) returns (stream Response);
        
        //客户端流式RPC
        rpc Calculate (stream Request) returns (Response);
        
        //双向流式RPC
        rpc Calculate (stream Request) returns (Response);
        
    }
    ```

  * 四种服务类型介绍(消息传输)

    * 一元RPC（请求响应式）：其中客户端向服务器发送单个请求并获取单个响应，就像普通的函数调用一样。
    * 服务器流式处理 RPC：其中客户端向服务器发送请求并获取流以读回一系列消息。客户端从返回的流中读取，直到没有更多消息。gRPC 保证单个 RPC 调用中的消息排序。
    * 客户端流式处理 RPC：其中客户端写入一系列消息并将其发送到服务器，再次使用提供的流。客户端完成写入消息后，它将等待服务器读取这些消息并返回其响应。同样，gRPC 保证单个 RPC 调用中的消息排序。
    * 双向流式处理 RPC：其中双方都使用读写流发送一系列消息。这两个流独立运行，因此客户端和服务器可以按照它们喜欢的任何顺序进行读取和写入：例如，服务器可以等待接收所有客户端消息，然后再写入其响应，或者它可以交替读取消息然后写入消息，或者其他一些读取和写入的组合。将保留每个流中消息的顺序。

    <iframe id="embed_dom" name="embed_dom" frameborder="0" style="display:block;width:800px; height:800px;" src="https://www.processon.com/embed/62f64a287d9c08072f9d6743"></iframe>

* 第二步，根据服务端（服务提供者）和客户端（服务调用者）语言类型，生成相应的代码，然后再实现/调用方法。

### 三、案例(一元rpc)

#### 1、用Java写客户端，Go写服务端

**编写protobuf文件**

helloworld.proto

```protobuf
syntax = "proto3";
option go_package = "../proto;helloworld";
option java_multiple_files = true;
option java_package="com.example.grpc_study.proto";
message Request{
	string source=1;
	string language=2;
}
message Response {
	string source=1;
	string language=2;
}
service HelloWorld {
	rpc TestRpc(Request) returns (Response);
}
```

**编写Go服务端**

* 安装grpc：

  ```
  go get -u google.golang.org/grpc
  ```

* 安装编译proto文件的插件

  ```
  go get -u github.com/golang/protobuf/proto
  go get -u github.com/golang/protobuf/protoc-gen-go
  ```

* 在proto文件目录中执行命令，生成代码

  ```
  protoc -I . --go_out=plugins=grpc:. helloworld.proto
  ```

* server.go

  ```go
  package main
  
  import (
  	"context"
  	"fmt"
  	"net"
  	"google.golang.org/grpc"
  	"grpc_study/proto"
  	"log"
  )
  type server struct{
  
  }
  
  func (server) TestRpc(ctx context.Context,req *helloworld.Request)(*helloworld.Response,error){
  	source:=req.Source
  	language:=req.Language
  	fmt.Printf("接收到来自%s%s的请求",language,source)
  	return &helloworld.Response{Source:"服务端",Language:"Go"},nil
  }
  func main(){
  	lis, err := net.Listen("tcp", ":8080")
  	if err != nil {
  		log.Fatalf("failed to listen: %v", err)
  	}
  	s := grpc.NewServer()
  	helloworld.RegisterHelloWorldServer(s,&server{})
  	if err := s.Serve(lis); err != nil {
  		log.Fatalf("failed to serve: %v", err)
  	}
  }
  ```

* 启动服务端：go run server.go

**编写Java客户端**

* 创建SpringBoot项目

* 配置maven

  * ```xml
    <!--    GRPC    -->
    <dependency>
        <groupId>net.devh</groupId>
        <artifactId>grpc-server-spring-boot-starter</artifactId>
        <version>2.13.1.RELEASE</version>
    </dependency>
    <!--    插件    -->
    <plugin>
        <groupId>org.xolstice.maven.plugins</groupId>
        <artifactId>protobuf-maven-plugin</artifactId>
        <version>0.5.1</version>
        <configuration>
            <protocArtifact>com.google.protobuf:protoc:3.7.1:exe:${os.detected.classifier}</protocArtifact>
            <pluginId>grpc-java</pluginId>
            <pluginArtifact>io.grpc:protoc-gen-grpc-java:1.20.0:exe:${os.detected.classifier}</pluginArtifact>
            <outputDirectory>${project.build.sourceDirectory}</outputDirectory>
            <!--设置是否在生成java文件之前清空outputDirectory的文件，默认值为true，设置为false时也会覆盖同名文件-->
            <clearOutputDirectory>false</clearOutputDirectory>
            <!--更多配置信息可以查看https://www.xolstice.org/protobuf-maven-plugin/compile-mojo.html-->
        </configuration>
        <executions>
            <execution>
                <goals>
                    <goal>compile</goal>
                    <goal>compile-custom</goal>
                </goals>
            </execution>
        </executions>
    </plugin>
    ```

* 在java的同级目录创建proto文件夹，并将其标记为Sources Root

* 在proto目录中创建helloworld.proto，内容go服务端内容一样

* 执行：mvn clean install，生成代码

* 创建Client类

  ```java
  public class Client {
  
  	private final ManagedChannel channel;
  	private final HelloWorldGrpc.HelloWorldBlockingStub blockingStub;
  	private Client(ManagedChannel channel) {
  		this.channel = channel;
  		blockingStub = HelloWorldGrpc.newBlockingStub(channel);
  	}
  	public Client(String host, int port) {
  		this(ManagedChannelBuilder.forAddress(host, port)
  				.usePlaintext()
  				.build());
  	}
  	public void shutdown() throws InterruptedException {
  		channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
  	}
  
  	public static void main(String[] args) {
  		try {
  			Client service = new Client("localhost", 9090);
  			Request request=Request.newBuilder().setLanguage("Java").setSource("客户端").build();
  			Response response = service.blockingStub.testRpc(request);
  			System.out.println("服务调用成功，接收到来自"+response.getLanguage()+response.getSource()+"的响应");
  			service.shutdown();
  		} catch (Exception e) {
  			System.out.println(e);
  		}
  	}
  }
  ```

**启动服务端，再启动客户端**

#### 2、用Go写客户端，Java写服务端

**编写服务端**

Server.java

```java
@GrpcService
public class Server extends HelloWorldGrpc.HelloWorldImplBase {
	@Override
	public void testRpc(Request request, StreamObserver<Response> streamObserver){
		System.out.println("接收到来自"+request.getLanguage()+request.getSource()+"的请求");
		streamObserver.onNext(Response.newBuilder().setLanguage("Java").setSource("服务端").build());
		streamObserver.onCompleted();
	}
}
```

启动SpringBoot应用，grpc服务默认启动的是9090端口

**编写客户端**

client.go

```
package main

import (
	"context"
    "fmt"
	"google.golang.org/grpc"
	"grpc_study/proto"
)

func main() {
    conn, err := grpc.Dial("127.0.0.1:9090", grpc.WithInsecure())
    if err != nil {
        fmt.Println("grpc Dial error", err)
        return
    }

    client := helloworld.NewHelloWorldClient(conn)
    rep, err := client.TestRpc(context.TODO(), &helloworld.Request{Source:"客户端",Language:"Go"})
    if err == nil {
        fmt.Printf("服务调用成功,收到来自：%s%s的响应", rep.Language,rep.Source)
    }
}
```

**启动服务端，再启动客户端**

### 四、protobuf文件语法



```protobuf
//使用的版本号
syntax = "proto3";
//生成go代码的位置，及包名
option go_package = "../proto;helloworld";
//生成java代码，是否选择多文件
option java_multiple_files = true;
//生成java代码的路径
option java_package="com.example.grpc_study.proto";
//消息体，1，2为字段标签，用于序列化
message Request{
	string source=1;
	string language=2;
}
message Response {
	string source=1;
	string language=2;
}
//服务名
service HelloWorld {
	//TestRpc服务端提供的方法名
	rpc TestRpc(Request) returns (Response);
}
```

#### 1、import

用来引入其他文件的内容

格式：import "/xxx路径"，路径是从protoc这个命令的当前目录开始算起

#### 2、message

>在protobuf中用来定义消息类型的关键字

**格式**

```
message 参数名称{
	修饰符 数据类型 字段名=标签;
	.
	.
	.
}
```

修饰符：

* Required: 表示是一个必须字段，必须相对于发送方，在发送消息之前必须设置该字段的值，对于接收方，必须能够识别该字段的意思。发送之前没有设置required字段或者无法识别required字段都会引发编解码异常，导致消息被丢弃。
* Optional：表示是一个可选字段，可选对于发送方，在发送消息时，可以有选择性的设置或者不设置该字段的值。对于接收方，如果能够识别可选字段就进行相应的处理，如果无法识别，则忽略该字段，消息中的其它字段正常处理。---因为optional字段的特性，很多接口在升级版本中都把后来添加的字段都统一的设置为optional字段，这样老的版本无需升级程序也可以正常的与新的软件进行通信，只不过新的字段无法识别而已，因为并不是每个节点都需要新的功能，因此可以做到按需升级和平滑过渡。
* Repeated：表示该字段可以包含0~N个元素。其特性和optional一样，但是每一次可以包含多个值。可以看作是在传递一个数组的值。

数据类型：

![在这里插入图片描述](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202208131444544.png)

* 默认值

  - `string`类型,默认值是空字符串,注意不是null
  - `bytes`类型,默认值是空bytes
  - `bool`类型，默认值是false
  - `数字`类型,默认值是0
  - `枚举`类型,默认值是第一个枚举值,即0
  - `repeated`修饰的属性，默认值是空（在相对应的编程语言中通常是一个空的list）.

* Any类型，类似于Java的Object

  * ```
    如果使用any类型，需要导入：google/protobuf/any.proto
    
    import "google/protobuf/any.proto";
    
    message Response {
    	string msg = 1;
    	int32 code = 2;
    	google.protobuf.Any data = 3; //可以理解成Object
    	repeated google.protobuf.Any datas = 4; //可以理解成泛型 List<T> datas;
    }
    ```

标签：

* 该标签的取值范围为 1~2^32（4294967296），其中 1~15的编码时间和空间效率都是最高的，编码值越大，其编码的时间和空间效率就越低（相对于1-15），当然一般情况下相邻的2个值编码效率的是相同的，除非2个值恰好实在4字节，12字节，20字节等的临界区。比如15和16。1900~2000编码值为Google protobuf 系统内部保留值，建议不要在自己的项目中使用。
* 当两个字段标签一致时，其修饰符和数据类型也必须相同
* 消息中的字段的编码值无需连续，只要是合法的，并且不能在同一个消息中有字段包含相同的编码值。
* 建议：项目投入运营以后涉及到版本升级时的新增消息字段全部使用optional或者repeated，尽量不使用required。如果使用了required，需要全网统一升级，如果使用optional或者repeated可以平滑升级。

**用法**

```
//普通的消息类型
message Person {
	string name=1;
}
//嵌套消息，无层级限制
message Person {
	string name=1;
	message Man{
		string name =1;
	}
	repeated Man man=2;
}
message Student{
	Person.Man man=1;
}
```

#### 3、enum

**格式**

```
enum 标识符 {
	字段名=0;
	字段名1=1;
}
```

#### 4、service

**格式**

```
service 服务名 {
 rpc 方法名(请求消息) returns (响应消息);
 rpc 方法名(stream 请求消息) returns (响应消息);
 rpc 方法名(请求消息) returns (stream 响应消息);
 rpc 方法名(stream 请求消息) returns (stream 响应消息);
}
```



### 五、讨论

#### 1、和其他RPC框架相比，gRPC的优势？

* 跨语言，且自动生成代码
* 性能高，比如protobuf性能高过json, 比如http2.0性能高过http1.1
* 生态好
* 流式处理（基于http2.0）：支持客户端流式，服务端流式，双向流式

#### 2、还有其他的跨语言的RPC吗，gRPC在跨语言RPC框架中是最好的吗？

* Thrift是一种可伸缩的跨语言服务的RPC软件框架。它结合了功能强大的软件堆栈的代码生成引擎，以建设服务，高效、无缝地在多种语言间结合使用


---
title: 手写一个SpringBoot组件发布到Maven中央仓库
date: 2022-10-15 09:23:26
categories: Spring
tags: SpringBoot
---





### 简介

springboot组件也叫`starters`（场景启动器），这也是SpringBoot最强大的特点，把可以与SpringBoot集成的技术封装成一个个启动器，供有需要的人，因需引入。

以下是来自官网的 starters 描述：

Starters are a set of convenient dependency descriptors that you can include in your application. You get a one-stop-shop for all the Spring and related technology that you need, without having to hunt through sample code and copy paste loads of dependency descriptors. For example, if you want to get started using Spring and JPA for database access, just include the spring-boot-starter-data-jpa dependency in your project, and you are good to go.
The starters contain a lot of the dependencies that you need to get a project up and running quickly and with a consistent, supported set of managed transitive dependencies.

starters 是一组方便的依赖性描述符，可以包括在应用程序中。您可以为所有Spring和所需的相关技术提供一站式服务，而无需搜索示例代码并复制粘贴的依赖描述符负载。例如，如果您想开始使用 Spring 和 JPA 进行数据库访问，只需在项目中包含SpringBootStarter数据 JPA 依赖项，就可以开始了。

常见的场景启动器有：spring-boot-starter-aop，spring-boot-starter-data-jpa等。

### starter原理

1、在maven中引入项目需要的依赖

2、编写项目整体的逻辑

3、将相关自定义的类加入springboot自动装配的范围之中

<!-- more -->



### 1、如何手写SpringBoot组件—自定义spring-boot-starter

#### 1.1、创建Maven项目

**项目名**

命名规约：
官方命名空间

前缀：spring-boot-starter-
模式：spring-boot-starter-模块名
如：spring-boot-starter-web

自定义命名空间：

后缀：-spring-boot-starter
模式：模块-spring-boot-starter
如：xxx-spring-boot-starter

![image-20221015095200339](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210150952526.png)

注：

GroupId：这是一个网站，必须有效，可以填写公司的域名或者个人博客地址

Version：RELEASE代表稳定版本，SNAPSHOT代表快照版本，如何项目处于完善中写快照版本，如果项目处于等待发布的状态，可以写稳定版本的后缀。

#### 1.2、引入依赖

```
 	<properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <spring-boot.version>2.3.7.RELEASE</spring-boot.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <!--引入spring-boot-starter：所有starter的基本配置-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
    </dependencies>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

```

#### 1.3、创建包目录

根据GroupId来创建

![image-20221015104007367](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210151040442.png)

#### 1.4、写组件功能

下面将以我的开源项目为例，进行说明，[GitHub地址](https://github.com/zglgithubx/apinotice-spring-boot-starter)

大致功能：使用AOP处理使用注解@Notice的方法，并发送邮件

**引入功能所需依赖**

```
<!-- AOP面向切面编程框架 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>
        <!--邮箱-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
        </dependency>
        <!--web-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
```

**创建引用yml配置文件的属性类NoticeProperties**

这个类主要作用让用户在项目配置文件中可以自定义发件人的名称

```
@ConfigurationProperties(prefix = "abnormal")
public class NoticeProperties {
	/** 发件人名称，API助手为默认值 */
	private String sender="API助手";

	public String getSender() {
		return sender;
	}

	public void setSender(String sender) {
		this.sender = sender;
	}
}
```

**创建核心类，使用@Aspect使该类作用切面处理类**

```
@Aspect
public class NoticeException {
	private JavaMailSender mailSender;
	private NoticeProperties noticeProperties;
	private String from;
	public void setMailSender(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}
	public void setNoticeProperties(NoticeProperties noticeProperties) {
		this.noticeProperties = noticeProperties;
	}
	public void setFrom(String from) {
		this.from = from;
	}
	.
	.
	.
}
```

**创建自动装配Bean的配置类**

@Configuration：指定这个类是一个配置类
@ConditionalOnXXX：在指定条件成立的情况下自动配置类生效
@EnableConfigurationProperties：让 XXXProperties 类生效，加入到容器中

```
@Configuration
@ConditionalOnWebApplication//在web应用中才会生效
@EnableConfigurationProperties(NoticeProperties.class)
public class NoticeAutoConfiguration {
	@Resource
	private JavaMailSender mailSender;
	@Autowired
	private NoticeProperties noticeProperties;
	@Value("${spring.mail.username}")
	private String from;

	@Bean//注入对象到bean容器中，方法名为bean名称
	public NoticeException noticeException(){
		NoticeException eN=new NoticeException();
		eN.setNoticeProperties(noticeProperties);
		eN.setFrom(from);
		eN.setMailSender(mailSender);
		return eN;
	}
}
```

**加载自动装配类**

如果要加载自动配置类，还需一步，根据Bean自动装配的原理，SpringBoot实际加载的spring.factories文件来实现自动装配。

在Resoures目录中创建目录：META-INF，并创建spring.factories文件，将自动配置类加入其中

```
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
io.github.zglgithubx.apinotice.NoticeAutoConfiguration
```

**扩展**

如果想在自定义的属性加入提示，需要引入：

```
<!-- 配置文件提示，需加此依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
        </dependency>
```

在META-INF中和创建文件additional-spring-configuration-metadata.json

```
{
  "properties": [
    {
      "name": "abnormal.sender",
      "type": "java.lang.String",
      "description": "发件人名称.",
      "defaultValue": "API助手"
    }
  ]
}
```

效果就如：

![image-20221015111704477](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210151117561.png)



### 2、测试组件—把组件安装到本地的Maven仓库

#### 2.1、执行 mvn clean install

此时已经在本地的Maven仓库生成项目jar包

#### 2.2、在其他项目中引入依赖

```
<dependency>
<groupId>io.github.zglgithubx</groupId>
<artifactId>apinotice-spring-boot-starter</artifactId>
<version>0.0.1-RELEASE</version>
</dependency>
```

### 3、发布到Maven中央仓库

#### 3.1、首先将项目推送到github仓库

在项目的pom.xml添加依赖：

```
 <url>https://github.com/zglgithubx/apinotice-spring-boot-starter</url>
 <name>ApiNotice</name>
```

#### 3.2、注册sonatype账号

你的项目首先要通过这个平台的审核，然后才能发布

注册地址：[[Sign up for Jira - Sonatype JIRA](https://issues.sonatype.org/secure/Signup!default.jspa)](https://issues.sonatype.org/secure/Signup!default.jspa)

#### 3.3、新建issue—提交申请

![image-20221015154302730](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210151543009.png)

![image-20221015154757018](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210151547144.png)

新建之后，会有工作人员审核十几分分钟左右，如果有问题，他们会有评论，按照他们修改意见修改再提交就行。

如果没有问题，他们则会让你在github上创建一个新的空仓库，用来验证github账号是不是你本人的，例如：Create a temporary, public repository called https://github.com/zglgithubx/OSSRH-85341 to verify github account ownership.创建之后再次提交就行。

上面的操作顺利完成没有问题，会有这样的评论：

![image-20221015155221597](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210151552721.png)



#### 3.4、安装GPG工具

这个工具是防止你的仓库代码被人修改，从而破坏代码。详细的请自行百度。

[GPG](https://www.gnupg.org/download/)

找到：![image-20221015200227664](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210152002891.png)

下载之后，默认安装

在控制台打印：gpg --version，判断是否完成成功

#### 3.5、生成密钥

使用管理员打开cmd

生成key：gpg --gen-key

会提示输入：用户名，邮箱，输入完成后输入o。

![image-20221015200636057](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210152006150.png)



回车后，会让你输入两次密码，然后ok，就会生成密钥。

#### 3.6、把key发送到中央仓库服务器，后面在上传时会做验证

首先找到key，在安装的gpg客户端中找到密钥id，密钥id就是接下来需要发送的key

![image-20221015201017643](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210152010750.png)

执行命令：

```
//发送key
gpg --keyserver keyserver.ubuntu.com --send-keys E1CED113257DC99A
//判断key是否已经发送到服务器
gpg --keyserver keyserver.ubuntu.com --recv-keys E1CED113257DC99A

```

![image-20221015201450241](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210152014339.png)

显示以上结果代表已经发送成功

#### 3.7、修改Maven配置和项目配置

在Maven的setting.xml添加

```
   <!--  中央仓库个人存储库的账号密码 -->
        <server>
            <id>ossrh</id>
            <username>自己的账号</username>
            <password>自己的密码</password>
        </server>

```

在项目的pom.xml添加，根据自己的项目进行修改

```
<!-- mvn clean deploy  -->
    <!-- 开源许可证 -->
    <licenses>
        <license>
            <name>MIT License</name>
            <url>https://www.opensource.org/licenses/mit-license.php</url>
            <distribution>repo</distribution>
        </license>
    </licenses>

    <!-- 源码信息 -->
    <scm>
        <url>https://github.com/zglgithubx/apinotice-spring-boot-starter</url>
        <connection>scm:https://github.com/zglgithubx/apinotice-spring-boot-starter.git</connection>
        <developerConnection>scm:https://github.com/zglgithubx/apinotice-spring-boot-starter.git</developerConnection>
    </scm>

    <!-- 个人信息,对应 gpg 配置 -->
    <developers>
        <developer>
            <name>zhuguangliang</name>
            <email>786945363@qq.com</email>
            <timezone>+8</timezone>
        </developer>
    </developers>

    <!-- 中央仓库配置id 需对应 settings.xml 的 server的id -->
    <distributionManagement>
        <snapshotRepository>
            <id>ossrh</id>
            <url>https://s01.oss.sonatype.org/content/repositories/snapshots/</url>
        </snapshotRepository>
        <repository>
            <id>ossrh</id>
            <url>https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/</url>
        </repository>
    </distributionManagement>

    <!-- 打包配置 -->
    <build>
        <finalName>apinotice-spring-boot-starter-${version}</finalName>
        <plugins>
            <!-- java-doc配置 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-javadoc-plugin</artifactId>
                <version>2.10.4</version>
                <configuration>
                    <aggregate>true</aggregate>
                </configuration>
                <executions>
                    <execution>
                        <id>attach-javadocs</id>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                        <configuration> <!-- add this to disable checking -->
                            <additionalparam>-Xdoclint:none</additionalparam>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
            <!-- 使用source 进行jar打包-->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-source-plugin</artifactId>
                <version>3.0.1</version>
                <executions>
                    <execution>
                        <id>attach-sources</id>
                        <goals>
                            <goal>jar-no-fork</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <!-- gpg 配置 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-gpg-plugin</artifactId>
                <version>1.6</version>
                <executions>
                    <execution>
                        <id>sign-artifacts</id>
                        <phase>verify</phase>
                        <goals>
                            <goal>sign</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
```

#### 3.8、上传仓库

管理员身份打开 cmd 进入项目命令执行命令,注意在idea 编辑器中的终端无法执行 gpg 命令，无法进行上传操作

```
mvn clean deploy
```

如果下显示构建成功就代表已经上传成功，但是还需要验证发布

#### 3.9、验证发布

访问：[Nexus Repository Manager (sonatype.org)](https://s01.oss.sonatype.org/)

点击右上角输入账号密码登录，与申请发布项目时一样

登录之后点击，Staging Repositories

![image-20221015202224501](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210152022669.png)

会找到项目

![image-20221015202728465](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210152027626.png)

选中项目后，点击close，提交验证

![image-20221015202809857](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202210152028050.png)

提交后，如果验证通过，Release按钮会变为可点击的状态，点击Release按钮发布即可。

发布成功后，会有邮箱提示：

30分钟后可以在中央仓库中找打，4个小时后可以搜索到。

Central sync is activated for io.github.zglgithubx. After you successfully release, your component will be available to the public on Central https://repo1.maven.org/maven2/, typically within 30 minutes, though updates to [https://search.maven.org](https://search.maven.org/) can take up to four hours.




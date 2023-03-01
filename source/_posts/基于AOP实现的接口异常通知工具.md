---
title: 基于AOP实现的接口异常通知工具
categories: Java
tags: 工具
abbrlink: 4657
date: 2023-03-01 19:16:47
---

一个好用的接口异常通知工具。

<!-- more -->

### 背景

如何在接口或者方法出现异常时及时处理，并通知相应的人员。本文介绍的工具将会为你解决这个问题。

### 工具介绍

项目地址：https://github.com/zglgithubx/apinotice-spring-boot-starter

使用的技术：Spring AOP+自定义注解+CompletableFuture

核心源码：

```
@Around("@annotation(notice)")
public Object around(ProceedingJoinPoint pj, Notice notice) throws Throwable {
	long start = System.currentTimeMillis();
	Object proceed ;
	try {
		proceed= pj.proceed();
	} catch (RuntimeException e){
		//异步处理异常
		CompletableFuture.supplyAsync(()->{
				return getMessage(pj,e);
		},executor).whenComplete((res,throwable)->{
			if(!res.isEmpty()){
				concatError(start,res, pj);
			}
		}).exceptionally(throwable -> {
				System.err.println("【异步通知出现异常】："+throwable);
				return throwable.getMessage();
		});
		throw e;
	}
	return proceed;
}
```



### 如何使用

#### 引入依赖

```
<dependency>
    <groupId>io.github.zglgithubx</groupId>
    <artifactId>apinotice-spring-boot-starter</artifactId>
    <version>0.0.2-RELEASE</version>
</dependency>
```

#### application.yml配置

```
spring:
    mail:
        host: 邮箱服务器 //smtp.163.com
        username: 账号
        password: 密码（第三方应用密码，非平台的登录密码）
        default-encoding: UTF-8
        port: 465
        properties:
          mail:
            smtp:
              auth: true
              starttls:
                enable: true
                required: true
              socketFactory:
                class: javax.net.ssl.SSLSocketFactory
                port: 465
                fallback: false
abnormal:
    sender: 发件人，默认为：API助手
    # 线程池配置
    thread-pool:
        # 核心线程数
        core-pool-size: 10
        # 最大线程数
        max-pool-size: 15
        # 工作队列容量
        queue-capacity: 500
        # 线程池维护线程所允许的空闲时间
        keep-alive-seconds: 300
        # 拒绝策略
        rejected-execution-handler: CallerRunsPolicy
```

#### 使用注解

此功能的核心是使用注解@Notice，包含两个属性，author:作者，email:接收提醒的邮箱地址。

该注解也可以加到其他业务方法上，只需要在方法上添加@Notice注解即可。

```Java
@RestController
public class TestController {
   @GetMapping("/hello")
   @Notice(author = "张三",email = "xxx@gmail.com")
   public void test(){
      throw new RuntimeException();
   }
}
```

### 效果

![image-20230301170457443](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202303011704530.png)

### 最后

有想法的小伙伴，可以私聊我，一起维护和改进这个工具。
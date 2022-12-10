---
title: Spring整理
date: 2022-12-10 20:34:41
categories: Spring
tags: spring
---

Spring框架是一个开放源代码的J2EE应用程序框架，由Rod Johnson发起，是针对bean的生命周期进行管理的轻量级容器（lightweight container）。 Spring解决了开发者在J2EE开发中遇到的许多常见的问题，提供了功能强大IOC、AOP及Web MVC等功能。Spring可以单独应用于构筑应用程序，也可以和Struts、Webwork、Tapestry等众多Web框架组合使用，并且可以与 Swing等桌面应用程序AP组合。因此， Spring不仅仅能应用于J2EE应用程序之中，也可以应用于桌面应用程序以及小应用程序之中。Spring框架主要由七部分组成，分别是 Spring Core、 Spring AOP、 Spring ORM、 Spring DAO、Spring Context、 Spring Web和 Spring Web MVC。

### Spring是什么？

Spring是一个轻量级的IOC和AOP容器框架。是为Java应用程序提供基础性服务的一套框架，目的是用于简化企业应用程序的开发，它使得开发者只需要关心业务需求。常见的配置方式有三种：基于XML的配置、基于注解的配置、基于java的配置。

主要由以下几个模块组成：

Spring Core：核心类库，提供IOC服务；

Spring Context：提供框架式的Bean访问方式，以及企业级功能（JNDI、定时任务等）；

Spring AOP：AOP服务；

Spring DAO：对JDBC的抽象，简化了数据访问异常的处理；

Spring ORM：对现有的ORM框架的支持；

Spring Web：提供了基本的面向web的总和特性，例如多方文件上传；

Spring MVC：提供面向Web应用的Model-View-Controller实现。

### Spring的优点？

* Spring属于低侵入性设计，代码的污染低；
* Spring的DI机制将对象之间的依赖关系交由框架处理，降级组件的耦合度；
* Spring集成AOP技术，支持将一些通用任务，如安全、事务、日志、权限等进行集中式管理，从而提供更好的复用。
* Spring的ORM和DAO提供了与第三方持久层框架的良好整合，并简化了底层的数据库访问。
* Spring并不强制应用完全依赖于Spring，开发者可自由选用Spring框架的部分或者全部。

### Spring的IOC理解

（1）IOC就是控制反转，是指创建对象的控制权的转移，以前创建对象的主动权和时机是由自己把控的，而现在这种权利转移到Spring容器中，并由容器根据配置文件去创建实例和管理各个实例之间的依赖关系，对象与对象之间的松散耦合，也有利于功能的复用。DI依赖注入，和控制反转是同一个概念的不同角度的描述，即应用程序在运行时依赖IOC容器来动态注入对象需要的外部资源。

（2）最直观的表达就是，IOC让容器的创建不用再去new了，可以由Spring自动生成，使用java的反射机制，根据配置文件在运行时动态的去创建对象及管理对象，并调用对象的方法。

（3）Spring IOC的三种注入方式：构造器注入、setter注入、注解注入。

IOC让相互协作的组件保持松散的耦合，而AOP变成允许你把遍布于应用各层的功能分离出来形成可重用的功能组件。

### Spring的Aop理解

OOP面向对象，允许开发者定义纵向的关系，但并适用于定义横向的关系，导致了大量代码的重复，而不利于各个模块的重用。

AOP，一般称为面向切面，作为面向对象的一种补充，用于将那些与业务无关，但却对多个对象产生影响的公共行为和逻辑，抽象并封装为一个可重用的模块，这个模块被命名为切面（Aspect），减少系统中的重复代码，降低模块间的耦合度，同时提高了系统的可维护性。可用于权限认证、日志、事务处理。

AOP实现的关键在于代理模式，AOP代理主要分为静态代理和动态代理。静态代理的代表为AspectJ；动态代理则由Spring AOP为代表。

（1）AspectJ是静态代理的增强，所谓静态代理，就是AOP框架会在编译阶段生成AOP代理类，因此也称为编译时增强，他会在编译阶段将AspectJ（切面）织入到java字节码中，运行的时候就是增强之后的AOP对象。

（2）Spring AOP使用的动态代理，所谓的动态代理就是说AOP框架不会去修改字节码，而是每次运行时再内存中临时为方法生成一个AOP对象，这个AOP对象包含了目标对象的全部方法，并且在特定的切点做了增强处理，并回调原对象的方法。

Spring AOP的动态代理主要有两种方式，JDK动态代理和CGLIB动态代理：

① JDK动态代理只提供接口的代理，不支持类的代理。核心InvocationHandler接口和Proxy类，InvocationHandler通过invoke()方法反射来调用目标类中的代码，动态地将横切逻辑和业务编织在一起；接着，Proxy利用InvocationHandler动态创建一个符合某一接口的实例，生成目标类的代理对象。

② 如果代理类没有实现InvocationHandler接口，那么Spring AOP会选择使用CGLIB来动态代理目标类。CGLIB（Code Generation Library），是一个代码生成的类库，可以在运行时动态的生成指定类的一个子类对象，并覆盖其中特定方法并添加增强代码，从而实现AOP。CGLIB是通过继承的方式做的动态代理，因此如果某个类被标记为final，那么它是无法使用CGLIB做动态代理的。

（3）静态代理与动态代理区别在于生成AOP代理对象的时机不同，相对来说AspectJ的静态代理方式具有更好的性能，但是AspectJ需要特定的编译器进行处理，而Spring AOP则无需特定的编译器处理。

InvocationHandler的invoke（Object proxy，Method，Object[] args）：

proxy是最终生成的代理实例；

method是呗代理目标实例的某个具体方法；

args是被代理目标实例某个方法的具体入参，在方法反射调用时使用。

### 静态代理和动态代理区别？

静态代理对于代理的角色是固定的，哪个类需要被代理，都需要创建一个代理类

相比于静态代理，动态代理在创建代理对象上更加的灵活，动态代理类的字节码在程序运行时，由Java反射机制动态产生。它会根据需要，通过反射机制在程序运行期，动态的为目标对象创建代理对象，无需程序员手动编写它的源代码。

### BeanFactory和ApplicationContext有什么区别？

BeanFactory和ApplicationContext是Spring的两大核心接口，都可以当做Spring的容器。其中ApplicationContext是BeanFactory的子接口。

（1）BeanFactory
BeanFactory是Spring里面最底层的接口，包含了各种Bean的定义，读取bean配置文件，管理bean的加载、实例化，控制bean的生命周期，维护bean之间的依赖关系。ApplicationContext接口作为BeanFactory的派生，除了提供BeanFactory所具有的功能外，还提供了更完整的框架功能：

* ① 继承MessageSource，支持国际化
* ② 统一的资源文件访问方式。
* ③ 提供在监听器中注册bean的事件。
* ④ 同时加载多个配置文件。
* ⑤ 载入多个（有继承关系）上下文，使得每一个上下文都专注于一个特定的层次，比如应用的web层。

（2）加载时机不同

* ① BeanFactory采用的是言辞加载形式来注入Bean的，即只有在使用到某个Bean时（调用getBean()方法），才对该Bean进行加载实例化。这样我们就不能发现一些存在的Spring配置问题。如果Bean的某一个属性没有注入，BeanFactory加载后，直至第一次使用调用getBean方法才会抛出异常。
* ② ApplicationContext，它是在容器启动时，一次性创建了所有的Bean。这样，在容器启动时，我们就可以发现Spring中存在的配置错误，这样有利于检查所依赖属性是否注入。ApplicationContext启动后预载入所有的单实例Bean，通过预载入单实例Bean，确保当你需要的时候，你就不用等待，因为它们已经创建好了。
* ③ 相对于基本的BeanFactory，ApplicationContext唯一的不足是占用内存空间。当应用程序配置Bean较多时，程序启动较慢。

（3）BeanFactory创建
通常以编程的方式被创建，ApplicationContext还能以声明的方式创建，如使用ContextLoader。

（4）BeanFactory和ApplicationContext
BeanFactory和ApplicationContext都支持BeanPostProcessor、BeanFactoryPostProcessor的使用，但两者之间的区别是：BeanFactory需要手动注册，而ApplicationContext则是自动注册。

### Spring Bean的生命周期

（1）Spring 容器根据配置中的 bean 定义中实例化 bean。

（2）Spring 使用依赖注入填充所有属性，如 bean 中所定义的配置。

（3）处理Aware接口（如何实现xxAware接口），比如：

* 如果 bean 实现BeanNameAware 接口，则工厂通过传递 bean 的 ID 来调用setBeanName()。
* 如果 bean 实现 BeanFactoryAware 接口，工厂通过传递自身的实例来调用 setBeanFactory()。

（4）如果存在与 bean 关联的任何BeanPostProcessors，则调用preProcessBeforeInitialization() 方法。

（5）如果为 bean 指定了 init 方法（ 的 init-method 属性），那么将调 用它。

（6）最后，如果存在与 bean 关联的任何 BeanPostProcessors，则将调用 postProcessAfterInitialization() 方法。

（7）如果 bean 实现DisposableBean 接口，当 spring 容器关闭时，会调用 destory()。

（8）如果为bean 指定了 destroy 方法（ 的 destroy-method 属性），那么将 调用它。

### 解释Spring支持的几种bean的作用域

Spring容器中的bean可以分为5个范围：

（1）singleton：默认，每个容器只有一个bean的实例，单例的模式由BeanFactory自身来维护；

（2）prototype：为每一个bean请求提供一个实例；

（3）request：为每一个网络请求创建一个实例，在请求完成以后，bean会失效并被垃圾回收器回收；

（4）session：与request范围类似，确保每个session中有一个bean的实例，在session过期后，bean会随之失效。

（5）global-session：全局作用域，global-session与Portlet应用相关。当你的应用部署在Portlet容器中工作时，它包含很多portlet。如果你想要的声明让所有的portlet共用全局的存储变量的话，那么这全局变量需要存储在global-session中。全局作用域与servlet中的session作用域效果相同。

> portlet是基于Java的web组件，由Portlet容器管理，并由容器处理请求，生成动态内容。
>
> 使用portlet作为可插拔用户接口组件，提供信息系统的表示层。
>
> 作为利用servlets进行web应用编程的下一步，portlet实现了web应用的模块化和用户中心化。

### Spring框架中的单例Bean是线程安全的吗？

Spring框架并没有对单例Bean进行任何多线程的封装处理。关于单例Bean的线程安全和并发问题需要开发者自己解决。

但实际上，大部分的Spring Bean 并没有可变的状态，所以在某种程度上说Spring的单例Bean线程安全的。如果你的Bean有多种状态的话，就需要自行保证线程安全。最浅先的解决方法就是将多态Bean的作用域由singleton改为prototype。

### Spring如何处理线程并发问题？

1、可以将成员变量声明在方法内。

2、将成员变量放在[ThreadLocal](https://so.csdn.net/so/search?q=ThreadLocal&spm=1001.2101.3001.7020)之中。

（ThreadLocal<String> userName = new ThreadLocal<>();）

​    成员变量放在ThreadLocal之中，传进来的参数是跟随线程的，所以也是[线程安全](https://so.csdn.net/so/search?q=线程安全&spm=1001.2101.3001.7020)的。

3、将bean设置为多例模式。（@[Scope](https://so.csdn.net/so/search?q=Scope&spm=1001.2101.3001.7020)（"prototype"））

​    多例模式，bean线程之间不共享就不会发生线程安全问题。

4、使用[同步锁](https://so.csdn.net/so/search?q=同步锁&spm=1001.2101.3001.7020)（会影响系统的吞吐量）

​    synchronized 修饰方法。

### Spring的自动装配

在Spring框架xml配置中共有5种自动装配：

（1）no：默认的方式是不进行自动装配的，通过手工ref属性来进行装配bean。

（2）byName：通过bean的名称进行自动装配，如果一个bean的property与另一bean的name相同，就进行自动装配。

（3）byType：通过参数的数据类型进行自动装配。

（4）constructor：利用构造函数进行装配，并且构造函数的参数通过byType进行装配。

（5）autodetect：自动探测，如果有构造函数，通过construct的方式自动装配，否者使用byType的方式自动装配。

基于注解的方式：

使用@Autowired注解来自动装配指定的bean。在使用@Autowired注解之前需要在Spring配置文件进行配置，<context:annotation-config />。

在启动spring IOC时，容器自动装载一个AutowiredAnnotationBeanPostProcessor后置处理器，当容器扫描到@Autowired、@Resource或@Inject时，就会在IOC容器自动查找需要的bean，并装配给该对象的属性。在使用@Autowired时，首先在容器中查询对应类型的bean：

* 如果查询结果刚好为一个，就将该bean装配给@Autowired指定的数据；
* 如果查询的结果不止一个，那么@Autowired会根据名称来查找；
* 如果上述查找的结果为空，那么就会抛出异常。解决办法是，使用required=false。

@Autowired可用于构造函数、成员变量、setter方法

@Autowired和@Resource之间的区别？

（1）@Autowired默认是按照类型装配注入的，默认情况下它要求依赖对象必须存在（可以设置required=false）。

（2）@Source默认是按照名称来装配注入的，只有当找不到与名称匹配的bean时才会按照类型来装配注入。

### Spring框架中都用到了哪些设计模式？

（1）单例模式：Bean默认为单例模式，singleton。

（2）工厂模式：BeanFactory就是简单工厂模式的体现，用来创建对象的实例。

（3）代理模式：Spring的AOP功能用到了JDK的动态代理和CGLIB字节码生成技术。

（4）模板方法：用来解决代码重复的问题，比如TestTemplate、JmsTemplate、JpaTemplate。

（5）观察者模式：定义一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都会得到通知被动更新，如Spring中listener的实现-->ApplicationListener。

### Spring事务作用

事务就是对一系列的数据库操作进行统一的提交和回滚，那么所有的都成功，如果中间有一条出现异常，那么就回滚之前的所有操作。

在JDBC中通过Connection对象进行事务管理的，默认是自动提交事务，可以手动将自动提交关闭，通过commit方法进行提交，rollback方法进行回滚，如果不提交，则数据不会真正的插入到数据库中。

### Spring的事务种类

#### 编程式事务管理

使用TransactionTemplate

#### 声明式事务管理

其本质是通过AOP功能，对方法前后进行拦截，将事务处理的功能编织在拦截的方法中，也就是在目标方法开始之前加入一个事务，在执行目标方法治好根据执行情况提交或回滚事务。

>  声明式事务最大的优点就是不需要在业务逻辑代码中掺杂事务管理的代码，只需在配置文件中做相关的事务规则声明或通过@Transactional注解的方式，便可以将事务规则应用到业务逻辑中。
>
> 声明式事务管理要优于编程式事务管理；唯一不足的地方是，最细粒度只能作用到方法级别，无法做到像编程式事务那样作用到代码块级别。

### Spring事务的传播行为

事务传播行为用来描述由某一个事务传播行为修饰的方法被嵌套进另一个方法时的事务如何传播。

代码：

```
public void methodA(){
	methodB();
	//doSomething
}
@Transaction(Propagation=xxx)
public void methodB(){
	//doSomething
}
```

代码中methodA()嵌套调用了methodB()，methodB()的事务传播行为由@Transaction(Propagation=XXX)设置决定。这里需要注意的是methodA()并没有开启事务，某一个事务传播行为修饰的方法并不是必须要在开启事务的外围方法中调用。

（1）PROPAGATION_REQUIRED：如果当前没有事务，就创建一个新事务，如果当前存在事务，就加入该事务，该设置是最常用的设置。

（2）PROPAGATION_SUPPORTS：支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就以非事务执行。‘

（3）PROPAGATION_MANDATORY：支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就抛出异常。

（4）PROPAGATION_REQUIRES_NEW：创建新事务，无论当前存不存在事务，都创建新事务。

（5）PROPAGATION_NOT_SUPPORTED：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。

（6）PROPAGATION_NEVER：以非事务方式执行，如果当前存在事务，则抛出异常。

（7）PROPAGATION_NESTED：如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则按REQUIRED属性执行。

### Spring中的隔离级别

（1）ISOLATION_DEFAULT：这是个 PlatfromTransactionManager 默认的隔离级别，使用数据库默认的事务隔离级别。

（2）ISOLATION_READ_UNCOMMITTED：读未提交，允许另外一个事务可以看到这个事务未提交的数据。

（3）ISOLATION_READ_COMMITTED：读已提交，保证一个事务修改的数据提交后才能被另一事务读取，而且能看到该事务对已有记录的更新。

（4）ISOLATION_REPEATABLE_READ：可重复读，保证一个事务修改的数据提交后才能被另一事务读取，但是不能看到该事务对已有记录的更新。

（5）ISOLATION_SERIALIZABLE：一个事务在执行的过程中完全看不到其他事务对数据库所做的更新。

### Spring启动流程

* 获取、解析、注册配置信息,将配置的文件信息转换Map<name,beanDefinition>

* 根据上述的Map<name,beanDefinition>去实例化bean（Bean实例化前会判断该Bean是否需要增强，并决定使用哪种代理来生成Bean）

### [Spring如何解决循环依赖问题](https://www.cnblogs.com/daimzh/p/13256413.html)

* Bean生命周期：对象实例化、依赖注入、填充属性、初始化、销毁
* 三级缓存，三个Map
  * singletonObjects：单例池
    * 经历完整的Bean创建流程后放入的
  * earlySingletonObjects：二级缓存
    *  存放原始的bean对象（尚未填充属性）
  * singletonFactories：三级缓存
    * 存放bean工厂对象，用于解决循环依赖
    * 解决AOP机制下的循环依赖

总结：

Spring通过三级缓存解决了循环依赖，其中一级缓存为单例池（`singletonObjects`）,二级缓存为早期曝光对象`earlySingletonObjects`，三级缓存为早期曝光对象工厂（`singletonFactories`）。

当A、B两个类发生循环引用时，在A完成实例化后，就使用实例化后的对象去创建一个对象工厂，并添加到三级缓存中，如果A被AOP代理，那么通过这个工厂获取到的就是A代理后的对象，如果A没有被AOP代理，那么这个工厂获取到的就是A实例化的对象。

当A进行属性注入时，会去创建B，同时B又依赖了A，所以创建B的同时又会去调用getBean(a)来获取需要的依赖，此时的getBean(a)会从缓存中获取，第一步，先获取到三级缓存中的工厂；

第二步，调用对象工工厂的getObject方法来获取到对应的对象，得到这个对象后将其注入到B中。

紧接着B会走完它的生命周期流程，包括初始化、后置处理器等。

当B创建完后，会将B再注入到A中，此时A再完成它的整个生命周期。

#### 为什么要使用三级缓存呢？二级缓存能解决循环依赖吗？

如果要使用二级缓存解决循环依赖，意味着所有Bean在实例化后就要完成AOP代理，这样违背了Spring设计的原则，Spring在设计之初就是通过`AnnotationAwareAspectJAutoProxyCreator`这个后置处理器来在Bean生命周期的最后一步来完成AOP代理，而不是在实例化后就立马进行AOP代理。


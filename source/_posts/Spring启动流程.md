---
title: Spring启动流程
categories: Java
tags: Spring
abbrlink: 7938
date: 2022-10-29 08:50:11
---

本文将以XMl定义bean的方式，从创建应用上下文对象剖析Spring的容器初始化，以及对单实例非懒加载 Bean 完成创建和Bean 属性的赋值注入和初始化，以及消息派发器的创建和启动过程消息的触发。

<!-- more -->

### 准备

#### spring.xml

```
<bean id="person" class="xxxx.Person">
	<property name="id" value="1"></property>
	<property name="name" value="zhangsan"></property>
</bean>
```

#### 创建对象

```
//解析bean配置文件
ApplicationContext ac=new ClassPathXmlApplicationContext("spring.xml")
```

### 开始探究

* 进入ClassPathXmlApplicationContext：构造方法

  * 方法：super(parent)—>进入父类AbstractApplicaitonContext：调用父类构造方法，进行相关对象的创建等操作

    * 进入AbstractXmlApplicationContext: 构造方法
      * ...
        * AbstactApplicationContext类
          * 进入构造方法
            * this.resourcePatternResolver=getResourcePatternResolver();//创建资源模式处理器，创建容器id值等。
          * 进入getResourcePatternResolver()方法
            * 进入pathmathcingResourcePatternResolver类
              * 属性：pathMatcher()new AntPathMatcher();//路径匹配
          * 进入重载的构造方法(@Nullable ApplicationContext parent)
            * 进入方法：setParent(parent)
    * 属性: validating=true//设置xml文件的验证标志，默认开启验证
    
  * 方法：setConfigLocations(configLocations)

    * 进入类AbstractRefreshConfigApplicationContext
      * setConfigLocations(@Nullable String... locations)
        * this.configLocations[i]=resolvePathlocations[i]).trim()
      * 进入resolvePath(String path)
        * getEnvironment().resolveRequiredPlaceholders(path)//
          * getEnvironment()：获取系统环境变量
          *  resolveRequiredPlaceholders(path)//处理占位符（路径上的，比如：spring-${username}.xml）
      * 属性：String[] configLocations：定义配置路径，默认是字符串数组

  * 方法（核心）：refresh()

    ```
    // Prepare this context for refreshing.
    // 1. 前期，做容器刷新前的准备工作
    prepareRefresh();
    
    // Tell the subclass to refresh the internal bean factory.
    // 2. 读取并解析XML文件、创建BeanFactory
    ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
    
    // Prepare the bean factory for use in this context.
    // 3. 预处理BeanFactory，给工厂设置属性值
    prepareBeanFactory(beanFactory);
    
    // Allows post-processing of the bean factory in context subclasses.
    // 4. BeanFactory初始化后，进行后置处理工作
    postProcessBeanFactory(beanFactory);
    
    // Invoke factory processors registered as beans in the context.
    // 5. 执行 BeanFactoryPostProcessors
    invokeBeanFactoryPostProcessors(beanFactory);
    
    // Register bean processors that intercept bean creation.
    // 6. 注册 Bean 后置处理器  [intercept bean creation.]
    registerBeanPostProcessors(beanFactory);
    
    
    // Initialize message source for this context.
    // 7. 初始化MessageSource组件（做国际化功能，消息绑定，消息解析）
    initMessageSource();
    
    // Initialize event multicaster for this context.
    // 8. 初始化事件派发器
    initApplicationEventMulticaster();
    
    // Initialize other special beans in specific context subclasses.
    // 9. 留给子容器（子类）
    onRefresh();
    
    // Check for listener beans and register them.
    // 10. 给容器中将所有的项目中的 ApplicationListener 注册进来
    registerListeners();
    
    // Instantiate all remaining (non-lazy-init) singletons.
    // 11. 初始化所有的非懒加载单例Bean
    finishBeanFactoryInitialization(beanFactory);
    
    // Last step: publish corresponding event.
    // 12. 执行Spring容器的声明周期（启动）和发布事件
    finishRefresh();
    ```

### 细说refresh()

> 功能分类
>
> 1 为准备环境
>
> 2 3 4 5 6 为准备 BeanFactory
>
> 7 8 9 10 12 为准备 ApplicationContext
>
> 11 为初始化 BeanFactory 中非延迟单例 bean

#### 1、prepareRefresh() 刷新前的预处理工作

该方法其主要的作用是对上下文环境的初始化准备工作如对系统环境或者系统属性变量的准备验证过程,这个变量的设置可能会影响着系统的正确性,我们可以通过重写initPropertySources方法就可以了。

```
/**
 * Prepare this context for refreshing, setting its startup date and
 * active flag as well as performing any initialization of property sources.
 * 设置容器的启动时间
 * 设置活跃状态为true
 * 设置关闭状态为false
 * 获取Environment对象，并加载系统的属性值到Environment对象中（初始化 context environment 中占位符.）
 * 当前环境的一些校验等.
 * 准备监听器和需要发布事件的集合
 */
protected void prepareRefresh() {
    // Switch to active.
    //设置启动时间
    this.startupDate = System.currentTimeMillis();
    //设置当前上下文(Context)的状态
    this.closed.set(false);
    this.active.set(true);

    if (logger.isDebugEnabled()) {
        if (logger.isTraceEnabled()) {
            logger.trace("Refreshing " + this);
        }
        else {
            logger.debug("Refreshing " + getDisplayName());
        }
    }

    // Initialize any placeholder property sources in the context environment.
    // 初始化context environment（上下文环境）中的占位符属性来源
    initPropertySources();

    // Validate that all properties marked as required are resolvable:
    // see ConfigurablePropertyResolver#setRequiredProperties
    //验证当前上下文需要的属性是否放入环境中
    getEnvironment().validateRequiredProperties();

    // Store pre-refresh ApplicationListeners...
    //判断刷新前的应用程序监听器集合是否为空，如果为空，则将监听器添加到此集合中
    if (this.earlyApplicationListeners == null) {
        this.earlyApplicationListeners = new LinkedHashSet<>(this.applicationListeners);
    }
    else {
        // Reset local application listeners to pre-refresh state.
        //如果不等于空，则清空集合元素对象
        this.applicationListeners.clear();
        this.applicationListeners.addAll(this.earlyApplicationListeners);
    }

    // Allow for the collection of early ApplicationEvents,
    // to be published once the multicaster is available...
    this.earlyApplicationEvents = new LinkedHashSet<>();
}
```

- 在Spring MVC 中对 `initPropertySources` 方法做了实现，将 Servlet 容器相关的信息放到了 environment 中，实现如下

```
protected void initPropertySources() {
    ConfigurableEnvironment env = getEnvironment();
    if (env instanceof ConfigurableWebEnvironment) {
        ((ConfigurableWebEnvironment) env).initPropertySources(this.servletContext, null);
    }
}
```

#### 2、obtainFreshBeanFactory() 刷新BeanFactory

该方法的作用是解析XML文件中的bean，包装成 BeanDefinition，并放入 BeanFactory 中的 beanDefinitionMap 集合

> BeanDefinition对象
>
> * BeanDefinition 作为 bean 的设计蓝图，规定了 bean 的特征，如单例多例、依赖关系、初始销毁方法等。
> * BeanDefinition 的来源有多种多样，可以是通过 xml 获得、配置类获得、组件扫描获得，也可以是编程添加。

```java
protected ConfigurableListableBeanFactory obtainFreshBeanFactory() {
		//初始化BeanFactory，并进行XML文件读取，并将得到BeanFactory记录在当前实体的属性中
		refreshBeanFactory();
		//返回当前实体的beanfactory属性
		return getBeanFactory();
}
.
.
.
↓
AbstractRefreshableApplicationContext.java
   /**
 	* This implementation performs an actual refresh of this context's underlying
 	* bean factory, shutting down the previous bean factory (if any) and
 	* initializing a fresh bean factory for the next phase of the context's lifecycle.
 	* 首先是对当前容器的判断,如果已存在beanFactory则将其移除该beanFactory创建的bean和移除自身
    * 接着是调用#createBeanFactory()方法来创建beanFactory实例
    * 给beanfactory设置序列化id
    * 加载beanDefinition
    * 将创建好的 bean 工厂的引用交给的 context 来管理
 	*/
	@Override
	protected final void refreshBeanFactory() throws BeansException {
		//如果存在beanFactory,则销毁beanFactory
		if (hasBeanFactory()) {
			destroyBeans();
			closeBeanFactory();
		}
		try {
			//创建DefaultListableBeanFactory对象
			DefaultListableBeanFactory beanFactory = createBeanFactory();
			//为了序列化指定id，可以从id反序化到beanFactory对象
			beanFactory.setSerializationId(getId());
			//定制beanFactory，设置相关属性，包括是否允许覆盖同名称的不同定义的对象以及循环依赖
			customizeBeanFactory(beanFactory);
			//序列化documentReader,并进行XML文件读取及解析
			loadBeanDefinitions(beanFactory);
			this.beanFactory = beanFactory;
		}
		catch (IOException ex) {
			throw new ApplicationContextException("I/O error parsing bean definition source for " + getDisplayName(), ex);
		}
	}

```

#### 3、prepareBeanFactory(beanFactory)  给beanFactory设置各种各样的功能

这一步会进一步完善 BeanFactory，为它的各项成员变量赋值

* beanExpressionResolver 用来解析 SpEL，常见实现为 StandardBeanExpressionResolver

* propertyEditorRegistrars 会注册类型转换器 

  它在这里使用了 ResourceEditorRegistrar 实现类

* 并应用 ApplicationContext 提供的 Environment 完成 ${ } 解析
* registerResolvableDependency 来注册 beanFactory 以及 ApplicationContext，让它们也能用于依赖注入
* beanPostProcessors 是 bean 后处理器集合，会工作在 bean 的生命周期各个阶段，此处会添加两个：
* ApplicationContextAwareProcessor 用来解析 Aware 接口
* ApplicationListenerDetector 用来识别容器中 ApplicationListener 类型的 bean
  

```
/**
 * Configure the factory's standard context characteristics,
 * such as the context's ClassLoader and post-processors.
 * @param beanFactory the BeanFactory to configure
 */
protected void prepareBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    // Tell the internal bean factory to use the context's class loader etc.
    //设置beanFactory的classLoader为当前上下文的classLoader
    beanFactory.setBeanClassLoader(getClassLoader());
    //设置beanFactory的表达式语言处理器
    //默认可以使用#{bean.xxx}的形式来调用相关属性值
    beanFactory.setBeanExpressionResolver(new StandardBeanExpressionResolver(beanFactory.getBeanClassLoader()));
    //为beanFactory增加一个默认的PropertyEditor,主要是针对bean的属性等设置管理统一的一个tool
    beanFactory.addPropertyEditorRegistrar(new ResourceEditorRegistrar(this, getEnvironment()));

    // Configure the bean factory with context callbacks.
    //添加beanPostProcessor
    beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));
    //设置几个忽略自动装配的接口
    beanFactory.ignoreDependencyInterface(EnvironmentAware.class);
    beanFactory.ignoreDependencyInterface(EmbeddedValueResolverAware.class);
    beanFactory.ignoreDependencyInterface(ResourceLoaderAware.class);
    beanFactory.ignoreDependencyInterface(ApplicationEventPublisherAware.class);
    beanFactory.ignoreDependencyInterface(MessageSourceAware.class);
    beanFactory.ignoreDependencyInterface(ApplicationContextAware.class);
    // BeanFactory interface not registered as resolvable type in a plain factory.
    // MessageSource registered (and found for autowiring) as a bean.
    //设置几个自动装配的特殊规则
    beanFactory.registerResolvableDependency(BeanFactory.class, beanFactory);
    beanFactory.registerResolvableDependency(ResourceLoader.class, this);
    beanFactory.registerResolvableDependency(ApplicationEventPublisher.class, this);
    beanFactory.registerResolvableDependency(ApplicationContext.class, this);

    // Register early post-processor for detecting inner beans as ApplicationListeners.
    beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(this));

    // Detect a LoadTimeWeaver and prepare for weaving, if found.
    //增加对AspectJ的支持
    if (beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
        beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
        // Set a temporary ClassLoader for type matching.
        beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
    }

    // Register default environment beans.
    // 注册默认的系统环境bean
    if (!beanFactory.containsLocalBean(ENVIRONMENT_BEAN_NAME)) {
        beanFactory.registerSingleton(ENVIRONMENT_BEAN_NAME, getEnvironment());
    }
    if (!beanFactory.containsLocalBean(SYSTEM_PROPERTIES_BEAN_NAME)) {
        beanFactory.registerSingleton(SYSTEM_PROPERTIES_BEAN_NAME, getEnvironment().getSystemProperties());
    }
    if (!beanFactory.containsLocalBean(SYSTEM_ENVIRONMENT_BEAN_NAME)) {
        beanFactory.registerSingleton(SYSTEM_ENVIRONMENT_BEAN_NAME, getEnvironment().getSystemEnvironment());
    }
}
```

#### 4、postProcessBeanFactory(beanFactory) 给子类做扩展实现

允许在子类中对beanFactory进行扩展处理。比如添加ware相关接口自动装配设置，添加后置处理器等，是子类扩展prepareBeanFactory(beanFactory)的方法。

>例如：在spring-web中可以找到AbstractRefreshableWebApplicationContext.java

```
protected void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    beanFactory.addBeanPostProcessor(new ServletContextAwareProcessor(this.servletContext, this.servletConfig));
    beanFactory.ignoreDependencyInterface(ServletContextAware.class);
    beanFactory.ignoreDependencyInterface(ServletConfigAware.class);

    WebApplicationContextUtils.registerWebApplicationScopes(beanFactory, this.servletContext);
    WebApplicationContextUtils.registerEnvironmentBeans(beanFactory, this.servletContext, this.servletConfig);
}
```

大致流程：

* 首先是添加ServletContextAwareProcessor到我们的beanFactory容器中,其中processor 实现 BeanPostProcessor 接口,主要用于将ServletContext 传递给实现了 ServletContextAware 接口的 bean.
* 忽略一些装配接口ServletContextAware和ServletConfigAware等.
* 注册 WEB 应用特定的域(scope)到 beanFactory 中，方便WebApplicationContext 可以使用它们,常见的有: request   session response application等.
* 注册 WEB 应用特定的 Environment bean 到 beanFactory 中,以便WebApplicationContext 可以使用它们,常见的有:contextAttributes等.

#### 5、invokeBeanFactoryPostProcessors(beanFactory) 执行 BeanFactory 后置处理器

此方法主要的作用是调用BeanFactory后置处理器（后置处理器充当 beanFactory 的扩展点，可以用来补充或修改 BeanDefinition），并扫描加载完毕所有的BeanDefinition，然后执行所有postProcessBeanDefinitionRegistry方法和postProcessBeanFactory方法。

>常见的BeanFactory处理器有：
>
>* ConfigurationClassPostProcessor – 解析 @Configuration、@Bean、@Import、@PropertySource 等

```
/**
 * 获取所有的  BeanDefinitionRegistryPostProcessor
 * 先执行实现了 PriorityOrdered 优先级接口BeanDefinitionRegistryPostProcessor
 * 再执行实现了 Ordered 顺序接口的 BeanDefinitionRegistryPostProcessor
 * 最后一步执行没有实现优先级接口或者顺序的接口的 BeanDefinitionRegistryPostProcessors
 * 获取所有的 BeanFactoryPostProcessor
 * 执行实现了 PriorityOrdered 优先级接口的 BeanFactoryPostProcessor
 * 执行实现了 Ordered 顺序接口的 BeanFactoryPostProcessor
 * 执行没有实现优先级接口或者顺序的接口的 BeanFactoryPostProcessor
 */
public static void invokeBeanFactoryPostProcessors(
        ConfigurableListableBeanFactory beanFactory, List<BeanFactoryPostProcessor> beanFactoryPostProcessors) {

    Set<String> processedBeans = new HashSet<>();
    // 如果BeanFactory刚好也是BeanDefinitionRegistry,则先执行BeanDefinitionRegistryPostProcessor.postProcessBeanDefinitionRegistry方法
    if (beanFactory instanceof BeanDefinitionRegistry) {
        BeanDefinitionRegistry registry = (BeanDefinitionRegistry) beanFactory;
        // 用于执行BeanFactoryPostProcessor.postProcessBeanFactory
        List<BeanFactoryPostProcessor> regularPostProcessors = new ArrayList<>();
        // 用于执行BeanDefinitionRegistryPostProcessor.postProcessBeanDefinitionRegistry
        List<BeanDefinitionRegistryPostProcessor> registryProcessors = new ArrayList<>();

        // 如果postProcessor是BeanDefinitionRegistryPostProcessor则先执行postProcessBeanDefinitionRegistry方法
        for (BeanFactoryPostProcessor postProcessor : beanFactoryPostProcessors) {
            if (postProcessor instanceof BeanDefinitionRegistryPostProcessor) {
                BeanDefinitionRegistryPostProcessor registryProcessor =
                        (BeanDefinitionRegistryPostProcessor) postProcessor;
                registryProcessor.postProcessBeanDefinitionRegistry(registry);
                registryProcessors.add(registryProcessor);
            }
            else {
                regularPostProcessors.add(postProcessor);
            }
        }

        // 按照不同排序优先级区分开不同的BeanDefinitionRegistryPostProcessor
        List<BeanDefinitionRegistryPostProcessor> currentRegistryProcessors = new ArrayList<>();

        // 先执行实现PriorityOrdered优先级接口的BeanDefinitionRegistryPostProcessor
        // 从Bean工厂中获取所有BeanDefinitionRegistryPostProcessor的Bean名称(未初始化的)
        String[] postProcessorNames =
                beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
        for (String ppName : postProcessorNames) {
            if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
                currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                // 执行过的会加入到这里面中进行重复验证防止重复执行
                processedBeans.add(ppName);
            }
        }
        // 排序PriorityOrdered.class,越小越大
        sortPostProcessors(currentRegistryProcessors, beanFactory);
        // 和从上下文传进来的默认Processor合并
        registryProcessors.addAll(currentRegistryProcessors);
        // 执行这些BeanPostProcessor,在这步之前BeanFactory中还只是有几个一开始初始化添加进去的系统Bean.这步会将所有定义的BeanDefinition扫描注册到BeanFactory中.这里会执行一个系统级的ConfigurationClassPostProcessor的postProcessBeanDefinitionRegistry方法.来将所有BeanDefinition扫描到容器中.可打断点查看
        invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry, beanFactory.getApplicationStartup());
        currentRegistryProcessors.clear();

        // 执行实现Orderd优先级接口的BeanDefinitionRegistryPostProcessor
        postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
        for (String ppName : postProcessorNames) {
            if (!processedBeans.contains(ppName) && beanFactory.isTypeMatch(ppName, Ordered.class)) {
                currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                processedBeans.add(ppName);
            }
        }
        // 和上面一样,排序、合并、执行
        sortPostProcessors(currentRegistryProcessors, beanFactory);
        registryProcessors.addAll(currentRegistryProcessors);
        invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry, beanFactory.getApplicationStartup());
        currentRegistryProcessors.clear();

        // 最后执行其他无要求的BeanDefinitionRegistryPostProcessor
        boolean reiterate = true;
        while (reiterate) {
            reiterate = false;
            postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
            for (String ppName : postProcessorNames) {
                if (!processedBeans.contains(ppName)) {
                    currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                    processedBeans.add(ppName);
                    reiterate = true;
                }
            }
            sortPostProcessors(currentRegistryProcessors, beanFactory);
            registryProcessors.addAll(currentRegistryProcessors);
            invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry, beanFactory.getApplicationStartup());
            currentRegistryProcessors.clear();
        }

        // 最后执行所有的BeanPostProcessor(BeanDefinitionRegistryPostProcessor实现了BeanFactoryPostProcessor接口)
        invokeBeanFactoryPostProcessors(registryProcessors, beanFactory);
        invokeBeanFactoryPostProcessors(regularPostProcessors, beanFactory);
    }

    else {
        // 只执行默认的BeanFactoryPostProcessor
        invokeBeanFactoryPostProcessors(beanFactoryPostProcessors, beanFactory);
    }

    // 执行剩下的未加载为Bean的BeanFactoryProstProcessors.(自定义的)
    String[] postProcessorNames =
            beanFactory.getBeanNamesForType(BeanFactoryPostProcessor.class, true, false);

    // 和上面按照优先级分段执行方式如出一辙,但是更加直观清晰
    // 先执行PriorityOrdered优先级的,再执行Ordered优先级的,最后执行无优先级的
    List<BeanFactoryPostProcessor> priorityOrderedPostProcessors = new ArrayList<>();
    List<String> orderedPostProcessorNames = new ArrayList<>();
    List<String> nonOrderedPostProcessorNames = new ArrayList<>();
    for (String ppName : postProcessorNames) {
        if (processedBeans.contains(ppName)) {
            // skip - already processed in first phase above
        }
        else if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
            priorityOrderedPostProcessors.add(beanFactory.getBean(ppName, BeanFactoryPostProcessor.class));
        }
        else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {
            orderedPostProcessorNames.add(ppName);
        }
        else {
            nonOrderedPostProcessorNames.add(ppName);
        }
    }

    // First, invoke the BeanFactoryPostProcessors that implement PriorityOrdered.
    sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
    invokeBeanFactoryPostProcessors(priorityOrderedPostProcessors, beanFactory);

    // Next, invoke the BeanFactoryPostProcessors that implement Ordered.
    List<BeanFactoryPostProcessor> orderedPostProcessors = new ArrayList<>(orderedPostProcessorNames.size());
    for (String postProcessorName : orderedPostProcessorNames) {
        orderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
    }
    sortPostProcessors(orderedPostProcessors, beanFactory);
    invokeBeanFactoryPostProcessors(orderedPostProcessors, beanFactory);

    // Finally, invoke all other BeanFactoryPostProcessors.
    List<BeanFactoryPostProcessor> nonOrderedPostProcessors = new ArrayList<>(nonOrderedPostProcessorNames.size());
    for (String postProcessorName : nonOrderedPostProcessorNames) {
        nonOrderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
    }
    invokeBeanFactoryPostProcessors(nonOrderedPostProcessors, beanFactory);

    // Clear cached merged bean definitions since the post-processors might have
    // modified the original metadata, e.g. replacing placeholders in values...
    beanFactory.clearMetadataCache();
}
```

#### 6、registerBeanPostProcessors(beanFactory);

本方法会注册所有的 BeanPostProcessor，将所有实现了 BeanPostProcessor 接口的类加载到 BeanFactory 中。

BeanPostProcessor 接口是 Spring 初始化 bean 时对外暴露的扩展点，Spring IoC 容器允许 BeanPostProcessor 在容器初始化 bean 的前后，添加自己的逻辑处理。在 registerBeanPostProcessors 方法只是注册到 BeanFactory 中，具体调用是在 bean 初始化的时候。

具体的：在所有 bean 实例化时，执行初始化方法前会调用所有 BeanPostProcessor 的 postProcessBeforeInitialization 方法，在执行初始化方法后会调用所有 BeanPostProcessor 的 postProcessAfterInitialization 方法。

```
protected void registerBeanPostProcessors(ConfigurableListableBeanFactory beanFactory) {
    PostProcessorRegistrationDelegate.registerBeanPostProcessors(beanFactory, this);
}
```

往下点

```
public static void registerBeanPostProcessors(
        ConfigurableListableBeanFactory beanFactory, AbstractApplicationContext applicationContext) {

    //获取所有BeanPostProcessor的beanName
    //此时的bean是未进行初始化操作,但已经加载到容器中
    String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);
    //记录所有beanPostProcessor的数量
    int beanProcessorTargetCount = beanFactory.getBeanPostProcessorCount() + 1 + postProcessorNames.length;
    //注册BeanPostProcessorChecker,其主要的作用是在bean的实例化期间进行日志的记录
    //
    beanFactory.addBeanPostProcessor(new BeanPostProcessorChecker(beanFactory, beanProcessorTargetCount));

    //通过PriorityOrdered来保证顺序
    List<BeanPostProcessor> priorityOrderedPostProcessors = new ArrayList<>();
    List<BeanPostProcessor> internalPostProcessors = new ArrayList<>();
    //有顺序
    List<String> orderedPostProcessorNames = new ArrayList<>();
    //没有顺序
    List<String> nonOrderedPostProcessorNames = new ArrayList<>();
    for (String ppName : postProcessorNames) {
        if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
            //获取BeanPostProcessor实例
            BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
            priorityOrderedPostProcessors.add(pp);
            if (pp instanceof MergedBeanDefinitionPostProcessor) {
                internalPostProcessors.add(pp);
            }
        }
        //保存到有序的orderedPostProcessorNames缓存中
        else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {
            orderedPostProcessorNames.add(ppName);
        }
        //保存到无序的缓存中
        else {
            nonOrderedPostProcessorNames.add(ppName);
        }
    }

    //第一步，注册所有实现了 PriorityOrdered 的 BeanPostProcessor
    //首先是排序
    sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
    //接着是注册
    registerBeanPostProcessors(beanFactory, priorityOrderedPostProcessors);

    // Next, register the BeanPostProcessors that implement Ordered.
    //第二步,注册所有实现Ordered接口的BeanPostProcessor
    List<BeanPostProcessor> orderedPostProcessors = new ArrayList<>(orderedPostProcessorNames.size());
    for (String ppName : orderedPostProcessorNames) {
        BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
        orderedPostProcessors.add(pp);
        if (pp instanceof MergedBeanDefinitionPostProcessor) {
            internalPostProcessors.add(pp);
        }
    }
    //还是先排序
    sortPostProcessors(orderedPostProcessors, beanFactory);
    //接着是注册
    registerBeanPostProcessors(beanFactory, orderedPostProcessors);

    // Now, register all regular BeanPostProcessors.
    //第三步,注册所有没有排序的BeanPostProcessor
    List<BeanPostProcessor> nonOrderedPostProcessors = new ArrayList<>(nonOrderedPostProcessorNames.size());
    for (String ppName : nonOrderedPostProcessorNames) {
        BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
        nonOrderedPostProcessors.add(pp);
        if (pp instanceof MergedBeanDefinitionPostProcessor) {
            internalPostProcessors.add(pp);
        }
    }
    //注册,这里不需要排序
    registerBeanPostProcessors(beanFactory, nonOrderedPostProcessors);

    // Finally, re-register all internal BeanPostProcessors.
    sortPostProcessors(internalPostProcessors, beanFactory);
    registerBeanPostProcessors(beanFactory, internalPostProcessors);

    // Re-register post-processor for detecting inner beans as ApplicationListeners,
    // moving it to the end of the processor chain (for picking up proxies etc).
    //加入ApplicationListenerDetector(探测器)
    beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(applicationContext));
}
```

更具体的详解，参考：[Spring IoC：registerBeanPostProcessors 详解 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/83474370)

#### 7、initMessageSource()

该方法主要是为上下文环境初始化MessageSource,即不同语言的消息体,国际化处理操作。

ApplicationContext 添加 messageSource 成员，实现国际化功能去 beanFactory 内找名为 messageSource 的 bean，如果没有，则提供空的 MessageSource 实现。

```
protected void initMessageSource() {
    //获取并初始化beanFactory
    ConfigurableListableBeanFactory beanFactory = getBeanFactory();
    //如果在beanFactory包含messageSource的bean
    if (beanFactory.containsLocalBean(MESSAGE_SOURCE_BEAN_NAME)) {
        //直接获取通过getBean(...)方法
        this.messageSource = beanFactory.getBean(MESSAGE_SOURCE_BEAN_NAME, MessageSource.class);
        // Make MessageSource aware of parent MessageSource.
        //如果有父类并且是HierarchicalMessageSource类型的
        if (this.parent != null && this.messageSource instanceof HierarchicalMessageSource) {
            //强转为HierarchicalMessageSource
            HierarchicalMessageSource hms = (HierarchicalMessageSource) this.messageSource;
            if (hms.getParentMessageSource() == null) {
                // Only set parent context as parent MessageSource if no parent MessageSource
                // registered already.
                //如果没有注册父 MessageSource,则设置为父类上下文的的 MessageSource
                hms.setParentMessageSource(getInternalParentMessageSource());
            }
        }
        if (logger.isTraceEnabled()) {
            logger.trace("Using MessageSource [" + this.messageSource + "]");
        }
    }
    //这里是beanFactory不包含messageSource该bean
    else {
        // Use empty MessageSource to be able to accept getMessage calls.
        //使用空的MessageSource去接受message
        DelegatingMessageSource dms = new DelegatingMessageSource();
        dms.setParentMessageSource(getInternalParentMessageSource());
        this.messageSource = dms;
        beanFactory.registerSingleton(MESSAGE_SOURCE_BEAN_NAME, this.messageSource);
        if (logger.isTraceEnabled()) {
            logger.trace("No '" + MESSAGE_SOURCE_BEAN_NAME + "' bean, using [" + this.messageSource + "]");
        }
    }
}
```

#### 8、initApplicationEventMulticaster() 初始化事件广播器

它的作用是发布事件给监听器去 beanFactory 找名为 applicationEventMulticaster 的 bean 作为事件广播器，若没有，会创建默认的事件广播器之后就可以调用 ApplicationContext.publishEvent(事件对象) 来发布事件。

> 事件广播器用于Spring事件通知机制,监听器通过指定监听事件,当广播器广播该事件时会执行对应监听器方法.
> 该方法表示如果有自定义广播器则使用自定义广播器没有则创建一个SimpleApplicationEventMulticaster.可自定义拓展让广播器监听事件异步执行
> 保存事件和对应监听器列表映射,发布事件后会找到该事件的所有监听器.如果由线程池则异步执行.没有则同步执行

```
protected void initApplicationEventMulticaster() {
	// 1. 获取 BeanFactory
	ConfigurableListableBeanFactory beanFactory = getBeanFactory();
	// 2. 从 BeanFactory 中获取 applicationEventMulticaster 的 applicationEventMulticaster
	if (beanFactory.containsLocalBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME)) {
		this.applicationEventMulticaster =
				beanFactory.getBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME, ApplicationEventMulticaster.class);
		if (logger.isTraceEnabled()) {
			logger.trace("Using ApplicationEventMulticaster [" + this.applicationEventMulticaster + "]");
		}
	}
	else {
		// 3. 如果上一步没有配置：创建一个 SimpleApplicationEventMulticaster
		this.applicationEventMulticaster = new SimpleApplicationEventMulticaster(beanFactory);
		// 4. 将创建的 ApplicationEventMulticaster 添加到 BeanFactory 中，以后其他组件直接自动注入即可
		beanFactory.registerSingleton(APPLICATION_EVENT_MULTICASTER_BEAN_NAME, this.applicationEventMulticaster);
		if (logger.isTraceEnabled()) {
			logger.trace("No '" + APPLICATION_EVENT_MULTICASTER_BEAN_NAME + "' bean, using " +
					"[" + this.applicationEventMulticaster.getClass().getSimpleName() + "]");
		}
	}
}
```

#### 9、onRefresh() 预留方法，用于自定义实现重写实现特殊 Bean 的处理

该方法主要是留给子类拓展方法,用来完成其他bean的上下文刷新操作

```
/**
 * Template method which can be overridden to add context-specific refresh work.
 * Called on initialization of special beans, before instantiation of singletons.
 * <p>This implementation is empty.
 * @throws BeansException in case of errors
 * @see #refresh()
 */
protected void onRefresh() throws BeansException {
    // For subclasses: do nothing by default.
}
```

#### 10、registerListeners() 注册监听器

该方法其主要的作用是为当前上下文注册一个事件监听器，至于监听器从何而来,是在所有的bean中去找，并添加至 applicationEventMulticaster

> 事件监听器顾名思义，用来接收事件广播器发布的事件，有如下来源
>
> * 事先编程添加的
> * 来自容器中的 bean
> * 来自于 @EventListener 的解析
> * 要实现事件监听器，只需要实现 ApplicationListener 接口，重写其中 onApplicationEvent(E e) 方法即可

```
/**
 * Add beans that implement ApplicationListener as listeners.
 * Doesn't affect other listeners, which can be added without being beans.
 */
protected void registerListeners() {
    // 首先是注册静态监听器
    for (ApplicationListener<?> listener : getApplicationListeners()) {
        getApplicationEventMulticaster().addApplicationListener(listener);
    }

    // Do not initialize FactoryBeans here: We need to leave all regular beans
    // uninitialized to let post-processors apply to them!
    String[] listenerBeanNames = getBeanNamesForType(ApplicationListener.class, true, false);
    for (String listenerBeanName : listenerBeanNames) {
        getApplicationEventMulticaster().addApplicationListenerBean(listenerBeanName);
    }

    // Publish early application events now that we finally have a multicaster...
    //至此,已经完成将监听器注册到ApplicationEventMulticaster中,下面将发布前期的事件给监听器
    Set<ApplicationEvent> earlyEventsToProcess = this.earlyApplicationEvents;
    this.earlyApplicationEvents = null;
    if (earlyEventsToProcess != null) {
        for (ApplicationEvent earlyEvent : earlyEventsToProcess) {
            getApplicationEventMulticaster().multicastEvent(earlyEvent);
        }
    }
}
```

#### 11、finishBeanFactoryInitialization(beanFactory)  实例化所有剩余的（非懒加载）单例

该方法作用将 beanFactory 的成员补充完毕，并初始化所有非延迟单例 bean。



参考：[Spring--延迟加载(@Lazy注解等)--使用/原理_IT利刃出鞘的博客-CSDN博客_springboot延迟加载](https://blog.csdn.net/feiying0canglang/article/details/120468261)

> 单例模式中的非延迟加载：不管什么时候要使用，先提前创建实例。
>
> 1. public class Singleton {
> 2.   private static final Singleton instance = new Singleton();
> 3.   private Singleton() {
> 4.   }
> 5.   public static Singleton getInstance() {
> 6. ​    return instance;
> 7.   }
> 8. }

```
/**
 * Finish the initialization of this context's bean factory,
 * initializing all remaining singleton beans.
 */
protected void finishBeanFactoryInitialization(ConfigurableListableBeanFactory beanFactory) {
    // 给当前上下文初始化转换器服务
    if (beanFactory.containsBean(CONVERSION_SERVICE_BEAN_NAME) &&
            beanFactory.isTypeMatch(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class)) {
        beanFactory.setConversionService(
                beanFactory.getBean(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class));
    }

    // Register a default embedded value resolver if no bean post-processor
    // (such as a PropertyPlaceholderConfigurer bean) registered any before:
    // at this point, primarily for resolution in annotation attribute values.
    //如果之前没有注册 bean 后置处理器（例如PropertyPlaceholderConfigurer）,则注册默认的解析器
    if (!beanFactory.hasEmbeddedValueResolver()) {
        beanFactory.addEmbeddedValueResolver(strVal -> getEnvironment().resolvePlaceholders(strVal));
    }

    // 尽早初始化LoadTimeWeaverAware bean以允许尽早注册其变换器
    String[] weaverAwareNames = beanFactory.getBeanNamesForType(LoadTimeWeaverAware.class, false, false);
    for (String weaverAwareName : weaverAwareNames) {
        getBean(weaverAwareName);
    }

    // 停止使用临时的 ClassLoader
    beanFactory.setTempClassLoader(null);

    // 允许缓存所有bean定义元数据
    beanFactory.freezeConfiguration();

    // 初始化所有剩余的单例(非延迟的).
    beanFactory.preInstantiateSingletons();
}
```

#### 12、finishRefresh() 完成刷新,发布上下文刷新完毕事件

该方法作用为 ApplicationContext 添加 lifecycleProcessor 成员，用来控制容器内需要生命周期管理的 bean

如果容器中有名称为 lifecycleProcessor 的 bean 就用它，否则创建默认的生命周期管理器。

```
/**
 * 加载LifecycleProcessor.执行其刷新方法.会将实现了SmartLifecycle接口的Bean加入Application生命周期,启动时执行start方法,关闭时执行stop方法,可以启动一些监控组件之类的东西.
 * 发布上下文刷新事件
 */
protected void finishRefresh() {
	// 清除为上下文创建初始化准备的资源文件数据信息缓存.比如ASM的元数据信息
	clearResourceCaches();

	// 一般是加载DefaultLifecycleProcessor
	initLifecycleProcessor();

	// 执行生命周期处理器的onRefresh方法.会调用实现了SmartLifecycle接口的start方法启动对应Bean生命周期(随着Application启动启动,关闭而关闭)
	getLifecycleProcessor().onRefresh();

	// 发布上下文刷新完毕事件
	publishEvent(new ContextRefreshedEvent(this));

	// 设置JMX则执行
	if (!NativeDetector.inNativeImage()) {
		LiveBeansView.registerApplicationContext(this);
	}
}

protected void initLifecycleProcessor() {
	ConfigurableListableBeanFactory beanFactory = getBeanFactory();
	// 我们自己没定义就一定是走下面默认的LifecycleProcssor上.我们自己定义的话最好也是继承下面那个默认的来定义,下面那个默认的是让Bean生命周期随上下文一致的保证.
	if (beanFactory.containsLocalBean(LIFECYCLE_PROCESSOR_BEAN_NAME)) {
		this.lifecycleProcessor =
				beanFactory.getBean(LIFECYCLE_PROCESSOR_BEAN_NAME, LifecycleProcessor.class);
		if (logger.isTraceEnabled()) {
			logger.trace("Using LifecycleProcessor [" + this.lifecycleProcessor + "]");
		}
	}
	else {
		DefaultLifecycleProcessor defaultProcessor = new DefaultLifecycleProcessor();
		defaultProcessor.setBeanFactory(beanFactory);
		this.lifecycleProcessor = defaultProcessor;
		beanFactory.registerSingleton(LIFECYCLE_PROCESSOR_BEAN_NAME, this.lifecycleProcessor);
		if (logger.isTraceEnabled()) {
			logger.trace("No '" + LIFECYCLE_PROCESSOR_BEAN_NAME + "' bean, using " +
					"[" + this.lifecycleProcessor.getClass().getSimpleName() + "]");
		}
	}
}
```



***

参考：

[spring高级容器ApplicationContext之refresh方法 - 简书 (jianshu.com)](https://www.jianshu.com/p/a0a5088a651d)

[Spring 启动过程 - 掘金 (juejin.cn)](https://juejin.cn/post/6898335466668441607)

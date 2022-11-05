---
title: Java集合知识点整理
categories: Java
abbrlink: 58728
date: 2022-11-05 17:16:02
tags:
---
本文整理了，Java集合相关的知识点和面试题。
<!-- more -->
### 概述

#### 什么是集合？

用于存储数据的容器

#### 和数组的区别？

* 长度：数组固定，集合可变长度。
* 存储：数组可以存储基本数据类型，也可以存储引用数据类型；集合只能存 储引用数据类型。

#### 集合的优势

* 容量自增长
* 提供了高性能的数据结构和算法，使编码更轻松，提高了程序速度和质量
* 允许不同 API 之间的互操作，API之间可以来回传递集合
* 可以方便地扩展或改写集合，提高代码复用性和可操作性
* 通过使用JDK自带的集合类，可以降低代码维护和学习新API成本

#### 分类

Map接口和Collection接口

Map接口实现类：HashMap、TreeMap、Hashtable、 ConcurrentHashMap以及 Properties等。

Collection接口子接口：List、Set和Queue

List接口实现类：ArrayList、LinkedList、Vector和Stack

Queue接口实现类：LinkedList

Set接口实现类：HashSet、TreeSet、LinkedHashSet等

#### 数据结构

**List**

* Arraylist： Object数组
* Vector： Object数组
* LinkedList： 双向循环链表 

**Set**

* HashSet（无序，唯一）：基于 HashMap 实现的，底层采用 HashMap 来保存元素
* LinkedHashSet： LinkedHashSet 继承与 HashSet，并且其内部是通过 LinkedHashMap 来实现 的。有点类似于我们之前说的LinkedHashMap 其内部是基 于 Hashmap 实现一样，不过还是有一 点点区别的。
* TreeSet（有序，唯一）： 红黑树(自平衡的排序二叉树。) Ma

**Map**

* HashMap： JDK1.8之前HashMap由数组+链表组成的，数组是HashMap的主 体，链表则是主要 为了解决哈希冲突而存在的（“拉链法”解决冲突）.JDK1.8以后 在解决哈希冲突时有了较大的变化，当链表长度大于阈值（默认为8）时，将链表转 化为红黑树， 以减少搜索时间
* LinkedHashMap：LinkedHashMap 继承自 HashMap，所以它的底层仍然是 基于拉链式散列结 构即由数组和链表或红黑树组成。另外，LinkedHashMap 在上面 结构的基础上，增加了一条双向 链表，使得上面的结构可以保持键值对的插入顺序。 同时通过对链表进行相应的操作，实现了访问 顺序相关逻辑。
* HashTable： 数组+链表组成的，数组是 HashMap 的主体，链表则是主要为 了解决哈希冲突而存在的
* TreeMap： 红黑树（自平衡的排序二叉树）

#### 哪些集合是线程安全的？

* vector：就比arraylist多了个同步化机制（线程安全），因为效率较低，现在已 经不太建议使用。 在web应用中，特别是前台页面，往往效率（页面响应速度）是优 先考虑的。
* statck：堆栈类，先进后出。
* hashtable：就比hashmap多了个线程安全。
*  ConcurrentHashMap

#### 集合的快速失败机制“fail-fast"

是java集合的一种错误检测机制，当多个线程对集合进行结构上的改变的操作时，有可能会产生 failfast 机制。 例如：假设存在两个线程（线程1、线程2），线程1通过Iterator在遍历集合A中 的元素，在某个时候线 程2修改了集合A的结构（是结构上面的修改，而不是简 单的修改集合元素的内容），那么这个时候程序 就会抛出ConcurrentModificationException 异常，从而产生fail-fast机制。 

原因：迭代器在遍历时直接访问集合中的内容，并且在遍历过程中使用一个 modCount 变量。集合在被遍历期间如果内容发生变化，就会改变modCount 的值。每当迭代器使用hashNext()/next()遍历下一 个元素之前，都会检测 modCount变量是否为expectedmodCount值，是的话就返回遍历；否则抛出 异常，终止遍历。 

解决办法： 

1. 在遍历过程中，所有涉及到改变modCount值得地方全部加上synchronized。
1. 使用CopyOnWriteArrayList来替换ArrayList

### Collection面试题

#### List

##### ArrayList和Vector的区别？

* ArrayList是List的主要实现类，底层使用Object[]数组存储，线程不安全；
* Vector是List的古老实现类，底层使用Object[]存储，线程安全。
* 性能：ArrayList 在性能方面要优于 Vector。
* 扩容：ArrayList 和 Vector 都会根据实际的需要动态的调整容量，只不过在 Vector 扩容每次会增加 1 倍，而 ArrayList 只会增加 50%。
* Vector类的所有方法都是同步的。可以由两个线程安全地访问一个Vector对 象、但是一个线程访问Vector的话代码要在同步操作上耗费大量的时间。
* Arraylist不是同步的，所以在不需要保证线程安全时时建议使用Arraylist。

##### ArrayList和LinkedList的区别？

* 是否保证线程安全： ArrayList和LinkedList都是不同步的、线程不安全的。

* 底层实现： ArrayList底层使用Object[]数组实现，LinkedList底层使用双向链表实现。（jdk1.6之前是双向循环链表，1.6之后取消了循环）。
* 是否支持快速随机访问： ArrayList底层使用数组实现，支持快速访问。而LinkedList底层是链表实现，不支持快速访问。
* 空间内存占用：ArrayList的空间浪费主要体现在list列表结尾会预留一定的容量空间，而LinkedList的空间花费则体现在它的每一个元素存储都需要比ArrayList消耗更多的空间（因为节点要放置前驱和后继）。

##### System.arraycopy()方法和Arrays.copyOf()方法的区别？

* 通过查看源码我们可以知道，Arrays.copyOf()方法内部调用了System.arraycopy()方法。

* arraycopy()方法需要目标数组，将原数组拷贝到自定义的数组中或者是原数组，并且可以选择拷贝的起点以及放入新的数组中的位置。copyOf()时系统自动在内部新建一个数组，并返回该数组。

拓展：ArrayList实现了RandomAccess接口，只是作为一个标识，说明ArrayList支持快速随机访问功能。

##### ensureCapacity()方法的作用？

ensureCapacity()方法并不是在ArrayList内部调用的，而是提供给用户来使用的，在向ArrayList里面添加大量元素之前最好先使用ensureCapacity方法，以减少增量重新分配的次数，提高效率。

##### ArrayList是如何扩容的？

当使用无参构造方法直接创建ArrayList集合时，初始化的数组是一个空的数组，只有在add第一个元素时，数组的大小才会初始化为10，直到添加第11个元素时，ArrayList才会进行扩容操作。

##### 快速失败 (fail-fast) 和安全失败 (fail-safe) 的区别是什么？

* 快速失败（fail-fast）
  在用迭代器遍历一个集合对象时，如果遍历过程中对集合对象的内容进行修改（增加、删除、修改），则会抛出Concurrent Modification Exception.
  原理：迭代器在遍历时直接访问集合中的内容，并且在遍历过程中使用一个modCount变量。集合在被遍历期间如果内容发生变化，就会改变modCount的值。每当迭代器使用hashNext()/next()遍历下一个元素之前，都会检测modCount变量是否为expectedmodCount值，是的话就返回遍历；否则抛出异常，终止遍历。
  注意：这里异常的抛出条件是检测到modCount!=expectedmodCount这个条件。如果集合发生变化时修改modCount值刚好又设置为了expectedmodCount值，则异常不会抛出。因此，不能依赖于这个异常是否抛出而进行并发操作的编程，这个异常只建议用于检测并发修改的bug。
  场景：java.util包下的集合类都是快速失败的，不能在多线程下发生并发修改（迭代过程中被修改）。

* 安全失败（fail-safe）
  采用安全失败机制的集合容器，在遍历时不是直接在集合内容上访问的，而是先复制原有集合内容，在拷贝的集合上进行遍历。
  原理：由于迭代时是对原集合的拷贝进行遍历，所以在遍历过程中对原集合所作的修改并不能被迭代器检测到，所以不会触发Concurrent Modification Exception。
  缺点：基于拷贝内容的优点是避免了Concurrent Modification Exception,但同样地，迭代器并不能访问到修改后的内容，即：迭代器遍历的是开始遍历那一刻拿到的集合拷贝，在遍历期间原集合发生的修改迭代器是不知道的
  场景：java.util.concurrent包下的容器都是安全失败，可以在多线程下并发使用，并发修改。

##### 什么是modCount？它是干啥的？什么时候发生变化？

* 什么还是modCount
  * modCount这个字段位于java.util.AbstractList抽象类中。
  * modCount的注释中提到了"fail-fast"机制。
  * 如果子类希望提供"fail-fast"机制，需要在add(int,E)方法和remove(int)方法中对这个字段进行处理。
  * 从第三点我们知道了，在提供了"fail-fast"机制的容器中（比如ArrayList），除了文中示例的remove(Obj)方法会导致ConcurrentModificationException异常，add及其相关方法也会导致异常。
* modCount作用？
  * 在提供了"fail-fast"机制（不允许并发修改）的集合中，modCount的作用是记录了该集合在使用过程中被修改的次数
* 什么使用发生变化？
  * 拿ArrayList来说，当调用add相关和remove相关方法时，会触发modCount++操作，从而被修改。

##### 什么是expectedModCount？它是干啥的？什么时候发生变化？

* 什么是expectedModCount?
  * expectedModCount是ArrayList中一个名叫Itr内部类的成员变量。
* 作用？
  * 它代表的含义是在这个迭代器中，预期的修改次数
* 什么时候发生变化？
  * 情况一：Itr初始化的时候，会对expectedModCount字段赋初始值，其值等于modCount。
  * ![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211051153074.jpeg)
  * 情况二：调用Itr的remove方法后会再次把modCount的值赋给expectedModCount。
    * ![img](https://mynotepicture.oss-cn-hangzhou.aliyuncs.com/img/202211051153049.jpeg)
  * 换句话说就是：调用迭代器的remove会维护expectedModCount=modCount。**（这句话很关键！！！）**

参考：[【原创】这道Java基础题真的有坑！我求求你，认真思考后再回答。 - why技术 - 博客园 (cnblogs.com)](https://www.cnblogs.com/thisiswhy/p/12067093.html)

#### Set

##### HashSet集合特点？

* 底层实现的就是HashMap，所以是根据HashCode来判断是否是重复元素。（下面有hashCode的解释）
* 因为TreeSet要是额外使用红黑树来保证元素的有序性，所以性能相对来说是hashSet的性能是要比TreeSet的性能要好。
* 初始化容量是：16, 这是因为底层实现的是HashMap。加载因子是0.75
* HashSet是无序的，也就是说插入的顺序和取出的顺序是不一样的。
* 因为HashSet不能根据索引去数据，所以不能用普通的for循环来取出数据，应该用增强for循环。这也进一步说明了HashSet的查询性能肯定是，没有ArrayList的性能高的。

##### TreeSet集合特点？

* 底层是实现的TreeMap。
* 元素不能够重复，可以有一个null值，并且这个null值一直在第一个位置上。
* 默认容量：16，加载因子是0.75
* TreeMap是有序的，这个有序不是存入的和取出的顺序是一样的，而是根据自然规律拍的序。

##### Set集合如何去重的？

这是因为用到了HashCode()和equals()。这两个方法决定的。

步骤：

* 首先获得该元素的hash值，然后在hash表中找此值下面有没有元素，如果没有则表示不是重复元素可以添加，反之不可以添加。
* 如果重复则还要用equals()比下是否一样，如果和在hash值下面的所有元素都比较后，发现没有一样的，则可以添加，反之不可以添加。
* 也就是说Hash值一样的元素，不一定相等，但是equals相同的元素Hash值一定相等。

### Map面试题

#### HashMap

##### 特性？

* HashMap存储键值对实现快速存取，允许为null。key值不可重复，若key值重复则覆盖
* 非同步，线程不安全。
* 底层是hash表，不保证有序(比如插入的顺序)

##### 版本区别

| 不同                     | JDK1.7                                                  | JDK1.8                                                                              |
| ------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 存储结构                 | 数组+链表                                               | 数组+链表+红黑树                                                                    |
| 初始化方式               | 单独函数：inflateTable()                                | 直接集成到了扩容函数resize()中                                                      |
| hash值计算方式           | 扰动处理=9次扰动=4次位运算+5次异或运算                  | 扰动处理=2次扰动=1次位运算+1次异或运算                                              |
| 存放数据的规则           | 无冲突时，存放数组；冲突时，存放链表                    | 无冲突时，存放数组；冲突&链表长度<8:存放单链表；冲突&链表长度 > 8：树化并存放红黑树 |
| 插入数据方式             | 头插法（先讲原位置的数据移到后1后，再插入数据到该位置） | 尾插法（直接插入到链表尾部/红黑树）                                                 |
| 扩容后存储位置的计算方式 | 全部按照原来方法                                        |                                                                                     |

[图解：什么是红黑树？ - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/273829162)

##### 谈一下HashMap中put是如何实现的？

* 根据key经过Hash算法得到值，做为key的hash值
* 判断数组是否为空，如果为空则进行resize()扩容
* 根据key的hash值计算数组的索引值
* 判断该索引下的数组中是否有值
  * 如果为null，则创建Node对象
  * 如果有值：
    * 判断equals后内容是否相同：
      * 如果相同则替换旧值
      * 如果不同，则判断是否为红黑树
        * 是，则直接在树种插入键值
        * 否，则遍历table[i]，判断链表长度是否大于8，大于8的话把链表转换为红黑树，在红黑树中执行插入操 作，否则进行链表的插入操作；遍历过程中若发现key已经存在直接覆盖value即可；
    * 插入成功后，判断实际存在的键值对数量size是否超多了 大容量threshold，如果超过，进行扩容

##### 谈一下HashMap中get是如何实现的？

* 1.对key的hashCode()做hash运算，计算index;
* 2.如果在bucket⾥的第⼀个节点⾥直接命中，则直接返回；
* 3.如果有冲突，先判断是否树化
  * 若已经树化，则调用红黑树的getTreeNode()进行查找，O(logn)。
  * 若没有树化，则从前往后遍历链表，找到了则返回节点，找不到则返回null，O(n)。

##### 谈一下HashMap中hash函数是怎么实现的？还有哪些hash函数的实现方式？

* 对key的hashCode做hash操作，与高16位做异或运算

* 还有平方取中法，除留余数法，伪随机数法

##### 为什么不直接将key作为哈希值而是与高16位做异或运算？

* 因为数组位置的确定用的是与运算，仅仅最后四位有效，设计者将key的哈希值与高16为做异或运算使得在做&运算确定数组的插入位置时，此时的低位实际是高位与低位的结合，增加了随机性，减少了哈希碰撞的次数。

* HashMap默认初始化长度为16，并且每次自动扩展或者是手动初始化容量时，必须是2的幂。

##### 为什么是16？为什么必须是2的幂？如果输入值不是2的幂比如10会怎么样？

* 为了数据的均匀分布，减少哈希碰撞。因为确定数组位置是用的位运算，若数据不是2的次幂则会增加哈希碰撞的次数和浪费数组空间。(PS:其实若不考虑效率，求余也可以就不用位运算了也不用长度必需为2的幂次)
* 输入数据若不是2的幂，HashMap通过一通位移运算和或运算得到的肯定是2的幂次数，并且是离那个数最近的数字

#### ConcurrentHashMap

##### 与HashMap区别

* HashMap不支持并发操作，没有同步方法，ConcurrentHashMap支持并发操作，通过继承 ReentrantLock（JDK1.7重入锁）/CAS和synchronized(JDK1.8内置锁)来进行加锁（分段锁），每次需要加锁的操作锁住的是一个 segment，这样只要保证每个 Segment 是线程安全的，也就实现了全局的线程安全。
* JDK1.8之前HashMap的结构为数组+链表，JDK1.8之后HashMap的结构为数组+链表+红黑树；JDK1.8之前ConcurrentHashMap的结构为segment数组+数组+链表，JDK1.8之后ConcurrentHashMap的结构为数组+链表+红黑树。

##### 与HashTable区别

* 底层数据结构： 
  * JDK1.7 的 ConcurrentHashMap 底层采用 `分段数组+链表` 实现，而 JDK1.8 的 ConcurrentHashMap 实现跟 HashMap1.8 的数据结构一样，都是 `数组+链表/红黑二叉树`。
  * Hashtable 和 JDK1.8 之前的 HashMap 的底层数据结构类似，都是采用 `数组+链表` 的形式。数组是 HashMap 的主体，链表则是为了解决哈希冲突而存在的；

* 实现线程安全的方式： 
  * ① 在 JDK1.7 的时候，ConcurrentHashMap（分段锁） 对整个桶数组进行了分割分段( Segment )，每一把锁只锁[容器](https://cloud.tencent.com/product/tke?from=10680)其中的一部分数据，这样多线程访问容器里不同数据段的数据，就不会存在锁竞争，提高了并发访问率。 
    * 到了 JDK1.8，摒弃了 Segment 的概念，而是直接用 Node 数组+链表+红黑树的数据结构来实现，并发控制使用 synchronized 和 CAS 来操作，（JDK1.6 以后对 synchronized 锁做了很多的优化） 整个看起来就像是优化过且线程安全的 HashMap，虽然在 JDK1.8 中还能看到 Segment 的数据结构，但是已经简化了属性，只是为了兼容旧版本；
  * ② Hashtable (同一把锁) :使用 synchronized 来保证线程安全，效率非常低下。一个线程访问同步方法时，当其他线程也访问同步方法，可能会进入阻塞或轮询状态，如使用 put 添加元素，另一个线程就不能使用 put 添加元素，也不能使用 get，竞争会越来越激烈，效率就越低。

##### JDK8的ConcurrentHashMap和JDK7的ConcurrentHashMap有什么区别？

* JDK8中新增了红黑树 
* JDK7中使用的是头插法，JDK8中使用的是尾插法 
* JDK7中使用了分段锁，而JDK8中使用 synchronized 和 CAS 来进行并发控制
* JDK7中使用了ReentrantLock，JDK8中没有使用ReentrantLock了，而使用了Synchronized 
* JDK7中的扩容是每个Segment内部进行扩容，不会影响其他Segment，而JDK8中的扩容和HashMap的扩容类似，只不过支持了多线程扩容，并且保证了线程安全

##### ConcurrentHashMap是如何保证并发安全的？

JDK7中ConcurrentHashMap是通过ReentrantLock+CAS+分段思想来保证的并发安全的，ConcurrentHashMap的put方法会通过CAS的方式，把一个Segment对象存到Segment数组中，一个Segment内部存在一个HashEntry数组，相当于分段的HashMap，Segment继承了ReentrantLock，每段put开始会加锁。

在JDK7的ConcurrentHashMap中，首先有一个Segment数组，存的是Segment对象，Segment相当于一个小HashMap，Segment内部有一个HashEntry的数组，也有扩容的阈值，同时Segment继承了ReentrantLock类，同时在Segment中还提供了put，get等方法，比如Segment的put方法在一开始就会去加锁，加到锁之后才会把key,value存到Segment中去，然后释放锁。同时在ConcurrentHashMap的put方法中，会通过CAS的方式把一个Segment对象存到Segment数组的某个位置中。同时因为一个Segment内部存在一个HashEntry数组，所以和HashMap对比来看，相当于分段了，每段里面是一个小的HashMap，每段公用一把锁，同时在ConcurrentHashMap的构造方法中是可以设置分段的数量的，叫做并发级别concurrencyLevel.

JDK8中ConcurrentHashMap是通过synchronized+cas来实现了。在JDK8中只有一个数组，就是Node数组，Node就是key，value，hashcode封装出来的对象，和HashMap中的Entry一样，在JDK8中通过对Node数组的某个index位置的元素进行同步，达到该index位置的并发安全。同时内部也利用了CAS对数组的某个位置进行并发安全的赋值。

##### JDK8中的ConcurrentHashMap为什么使用synchronized来进行加锁？

JDK8中使用synchronized加锁时，是对链表头结点和红黑树根结点来加锁的，而ConcurrentHashMap会保证，数组中某个位置的元素一定是链表的头结点或红黑树的根结点，所以JDK8中的ConcurrentHashMap在对某个桶进行并发安全控制时，只需要使用synchronized对当前那个位置的数组上的元素进行加锁即可，对于每个桶，只有获取到了第一个元素上的锁，才能操作这个桶，不管这个桶是一个链表还是红黑树。

想比于JDK7中使用ReentrantLock来加锁，因为JDK7中使用了分段锁，所以对于一个ConcurrentHashMap对象而言，分了几段就得有几个ReentrantLock对象，表示得有对应的几把锁。

而JDK8中使用synchronized关键字来加锁就会更节省内存，并且jdk也已经对synchronized的底层工作机制进行了优化，效率更好。

##### JDK7中的ConcurrentHashMap是如何扩容的？

JDK7中的ConcurrentHashMap和JDK7的HashMap的扩容是不太一样的，首先JDK7中也是支持多线程扩容的，原因是，JDK7中的ConcurrentHashMap分段了，每一段叫做Segment对象，每个Segment对象相当于一个HashMap，分段之后，对于ConcurrentHashMap而言，能同时支持多个线程进行操作，前提是这些操作的是不同的Segment，而ConcurrentHashMap中的扩容是仅限于本Segment，也就是对应的小型HashMap进行扩容，所以是可以多线程扩容的。

每个Segment内部的扩容逻辑和HashMap中一样。

##### JDK8中的ConcurrentHashMap是如何扩容的？

首先，JDK8中是支持多线程扩容的，JDK8中的ConcurrentHashMap不再是分段，或者可以理解为每个桶为一段，在需要扩容时，首先会生成一个双倍大小的数组，生成完数组后，线程就会开始转移元素，在扩容的过程中，如果有其他线程在put，那么这个put线程会帮助去进行元素的转移，虽然叫转移，但是其实是基于原数组上的Node信息去生成一个新的Node的，也就是原数组上的Node不会消失，因为在扩容的过程中，如果有其他线程在get也是可以的。

##### JDK8中的ConcurrentHashMap有一个CounterCell，你是如何理解的？

CounterCell是JDK8中用来统计ConcurrentHashMap中所有元素个数的，在统计ConcurentHashMap时，不能直接对ConcurrentHashMap对象进行加锁然后再去统计，因为这样会影响ConcurrentHashMap的put等操作的效率，在JDK8的实现中使用了CounterCell+baseCount来辅助进行统计，baseCount是ConcurrentHashMap中的一个属性，某个线程在调用ConcurrentHashMap对象的put操作时，会先通过CAS去修改baseCount的值，如果CAS修改成功，就计数成功，如果CAS修改失败，则会从CounterCell数组中随机选出一个CounterCell对象，然后利用CAS去修改CounterCell对象中的值，因为存在CounterCell数组，所以，当某个线程想要计数时，先尝试通过CAS去修改baseCount的值，如果没有修改成功，则从CounterCell数组中随机取出来一个CounterCell对象进行CAS计数，这样在计数时提高了效率。

所以ConcurrentHashMap在统计元素个数时，就是baseCount加上所有CountCeller中的value值，所得的和就是所有的元素个数。

#### HashTable

##### HashTable与HashMap对比

（1）线程安全：HashMap是线程不安全的类，多线程下会造成并发冲突，但单线程下运行效率较高；HashTable是线程安全的类，很多方法都是用synchronized修饰，但同时因为加锁导致并发效率低下，单线程环境效率也十分低；

（2）插入null：HashMap允许有一个键为null，允许多个值为null；但HashTable不允许键或值为null；

（3）容量：HashMap底层数组长度必须为2的幂，这样做是为了hash准备，默认为16；而HashTable底层数组长度可以为任意值，这就造成了hash算法散射不均匀，容易造成hash冲突，默认为11；

（4）Hash映射：HashMap的hash算法通过非常规设计，将底层table长度设计为2的幂，使用位与运算代替取模运算，减少运算消耗；而HashTable的hash算法首先使得hash值小于整型数最大值，再通过取模进行散射运算；

```java
// HashMap
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
// 下标index运算
int index = (table.length - 1) & hash(key)

// HashTable
int hash = key.hashCode();
int index = (hash & 0x7FFFFFFF) % tab.length;
```

（5）扩容机制：HashMap创建一个为原先2倍的数组，然后对原数组进行遍历以及rehash；HashTable扩容将创建一个原长度2倍的数组，再使用头插法将链表进行反序；

（6）结构区别：HashMap是由数组+链表形成，在JDK1.8之后链表长度大于8时转化为红黑树；而HashTable一直都是数组+链表；

（7）继承关系：HashTable继承自Dictionary类；而HashMap继承自AbstractMap类；

（8）迭代器：HashMap是fail-fast（查看之前HashMap相关文章）；而HashTable不是。

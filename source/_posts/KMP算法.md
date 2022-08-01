---
title: KMP算法
categories: 数据结构
cover: 'https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171224111.png'
abbrlink: 35921
date: 2021-10-16 11:27:33
permalink:
tags: 算法
---

### 由来

 Knuth-Morris-Pratt 字符串查找算法，简称为 “KMP算法”，常用于在一个文本串S内查找一个模式串P 的出现位置，这个算法由Donald Knuth、Vaughan Pratt、James H. Morris三人于1977年联合发表，故取这3人的姓氏命名此算法。

<!-- more -->

### KMP算法是什么

KMP算法主要应用于字符串的快速匹配。

比如在给定字符串中，让你找一个目标子串，常规的解法就是暴力匹配，用双层for循环分别遍历两个字符串，但是它的时间复杂度是O(m*n)。而KMP算法可以让这个匹配过程降到时间复杂度为O(m+n)。

### KMP算法为什么那么快

####  举个:chestnut:

在文本串（aabaabaaf）中，找到第一次匹配到模式串（aabaaf）的索引。

KMP算法匹配的过程：

①和常规解法一样，从文本串首字符和模式串的首字符开始，一 一进行比较

②当遇到不匹配的时候，如下图

![image-20211017101822955](https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171018117.png)

模式串会从b的位置开始匹配，文本串匹配的位置不变

![image-20211017110657407](https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171106451.png)

到这里，肯定会有疑问：会什么从b开始？

下面的概念都是模式串的。

这里会提到几个概念：前缀、后缀和 最大公共字符长度表（前缀表）

* 前缀：除了末尾字符之外的所有字符

* 后缀：除了首字符之外的所有字符

* 最大公共字符长度表：每个子串中最长相同的前后缀字符长度

| 模式串的各个子串 | 前缀           | 后缀                | 最大公共字符长度 |
| ---------------- | -------------- | ------------------- | ---------------- |
| a                | 空             | 空                  | 0                |
| aa               | a              | a                   | 1                |
| aab              | a,aa           | b,ba                | 0                |
| aaba             | a,aa,aab       | a,ba,aba            | 1                |
| aabaa            | a,aa,aab,aaba  | a,aa,baa,abaa       | 2                |
| aabaaf           | a,aa,aab,aabaa | f,af,aaf,baaf,abaaf | 0                |
|                  |                |                     |                  |

为什么有最大公共字符长度表？

这个表，可以在你匹配失败时，跳跃式的匹配，避免重复已经匹配相同的字符。

③直到将文本串匹配完

#### 举个完整的:chestnut:

文本串：BBC ABCDAB ABCDABCDABDE

模式串：ABCDABD

前缀表：

| 字符                     | A    | B    | C    | D    | A    | B    | D    |
| ------------------------ | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 最大前缀后缀公共元素长度 | 0    | 0    | 0    | 0    | 1    | 2    | 0    |

这个例子咱们就根据这个前缀表去跳跃式的匹配（表中的数值代表跳跃到模式串索引）

①开始匹配

![img](https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171151156.png)

② 因为模式串中的字符A跟文本串中的字符B、B、C、空格一开始就不匹配，所以不必考虑结论，直接将模式串不断的右移一位即可，直到模式串中的字符A跟文本串的第5个字符A匹配成功：

![img](https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171151451.png)

③继续往后匹配，当模式串最后一个字符D跟文本串匹配时失配，显而易见，模式串需要向右移动。但向右移动多少位呢？因为此时已经匹配的字符数为6个（ABCDAB），然后根据《前缀表》可得失配字符D的上一位字符B对应的长度值为2，所以根据之前的结论，可知需要向右移动6 - 2 = 4 位。

![img](https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171152957.png)

④模式串向右移动4位后，发现C处再度失配，因为此时已经匹配了2个字符（AB），且上一位字符B对应的最大长度值为0，所以向右移动：2 - 0 =2 位。

![img](https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171153610.png)

⑤A与空格不匹配，向右移动1位

![img](https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171154064.png)

⑥继续比较，发现D与C 失配，故向右移动的位数为：已匹配的字符数6减去上一位字符B对应的最大长度2，即向右移动6 - 2 = 4 位。

![img](https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171154305.png)

⑦经历第5步后，发现匹配成功，过程结束。

![img](https://cdn.jsdelivr.net/gh/zglgithubx/picture/img/202110171155335.png)

至此这就是KMP算法的大致原理。

### KMP算法代码实现

 由上文，我们已经知道，字符串“ABCDABD”各个前缀后缀的最大公共元素长度分别为：

| 字符                     | A    | B    | C    | D    | A    | B    | D    |
| ------------------------ | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 最大前缀后缀公共元素长度 | 0    | 0    | 0    | 0    | 1    | 2    | 0    |

而且，根据这个表可以得出下述结论

当失配时，模式串向右移动的位数为：已匹配字符数-失配字符的上一位字符所对应的最大长度值

文利用这个表和结论进行匹配时，我们发现，当匹配到一个字符失配时，其实没必要考虑当前失配的字符，更何况我们每次失配时，都是看的失配字符的上一位字符对应的最大长度值。如此，便引出了next 数组。

给定字符串“ABCDABD”，可求得它的next 数组如下：

| 字符 | A    | B    | C    | D    | A    | B    | D    |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| next | -1   | 0    | 0    | 0    | 0    | 1    | 2    |
|      |      |      |      |      |      |      |      |

#### Next数组求法

```java
void GetNext(char* p,int next[])  
{  
    int pLen = strlen(p);  
    next[0] = -1;  
    int k = -1;  
    int j = 0;  
    while (j < pLen - 1)  
    {  
        //p[k]表示前缀，p[j]表示后缀  
        if (k == -1 || p[j] == p[k])   
        {  
            ++k;  
            ++j;  
            next[j] = k;  
        }  
        else   
        {  
            k = next[k];  
        }  
    }  
}  
```

KMP算法

```java
int KmpSearch(char* s, char* p)  
{  
    int i = 0;  
    int j = 0;  
    int sLen = strlen(s);  
    int pLen = strlen(p);  
    while (i < sLen && j < pLen)  
    {  
        //①如果j = -1，或者当前字符匹配成功（即S[i] == P[j]），都令i++，j++      
        if (j == -1 || s[i] == p[j])  
        {  
            i++;  
            j++;  
        }  
        else  
        {  
            //②如果j != -1，且当前字符匹配失败（即S[i] != P[j]），则令 i 不变，j = next[j]      
            //next[j]即为j所对应的next值        
            j = next[j];  
        }  
    }  
    if (j == pLen)  
        return i - j;  
    else  
        return -1;  
} 
```


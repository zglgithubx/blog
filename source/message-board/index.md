---
title: 留言板
date: 2022-05-01 04:22:27
---

{% raw %}
<div class="poem-wrap">
    <div class="poem-border poem-left">
    </div>
    <div class="poem-border poem-right">
    </div>
    <h1>热评</h1>
    <p id="poem">云想衣裳花想容，春风拂槛露华浓</p>
    <p id="info">李白</p>
</div>
<script type="text/javascript" src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>

<script type="text/javascript">
    $.get("https://v1.hitokoto.cn?c=d&c=h&c=j", function (data) {
            if (data.id > 0) {
                $('#poem').html(data.hitokoto)
                if (data.from_who != null) {
                    $('#info').html(data.from_who + " · "  + data.from );
                }
                else {
                    $('#info').html(" “ " + data.from + "” ");
                }
            }
            else { $('#poem').html("获取出错啦"); }
    })
</script>
{% endraw %}

![必应每日壁纸](http://bing.ioliu.cn/v1)




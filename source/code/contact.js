var timer = setInterval(
    function () {
        $.get("https://v1.hitokoto.cn?c=d&c=h&c=j", function (data) {
            if (data.id > 0) {
                $('#poem').html(data.hitokoto)
                if (data.from_who != null) {
                    $('#info').html(data.from_who + " · " + "《" + data.from + "》");
                }
                else {
                    $('#info').html(" “ " + data.from + "” ");
                }
            }
            else { $('#poem').html("获取出错啦"); }
        })
    }, 1000 * 5
)

<script type="text/javascript" src="/code/contact.js"></script>
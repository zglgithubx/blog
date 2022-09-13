$.get("https://v1.hitokoto.cn?c=d&c=h&c=j", function (data) {
    if (data.id > 0) {
        console.log("fasdf")
        $('#poem').html(data.hitokoto)
        if (data.from_who != null) {
            $('#info').html(data.from_who + " · " + "《" + data.from + "》");
        }
        else {
            $('#info').html(" “ " + data.from + "” ");
        }
    }
    else { $('#poem').html("获取出错啦"); }
});
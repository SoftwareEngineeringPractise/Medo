upload = function (el) {
    var id = $(el).attr('id');
    var url = $(el).attr('url');
    var bind = $(el).attr('bind-img');
    var c = $('#' + bind).attr('src');
    var idx = c.indexOf('file');
    var delfile = idx != c.length;
    console.log(delfile);
    var file = $(el).get(0).files[0];
    if (file.size > 5242880) {
        alert("上传文件最大不超过5M");
        return;
    }
    $.ajaxFileUpload({
        url: url,
        secureuri: false,
        fileElementId: id,
        dataType: 'json',
        success: function (result) {
            if (result.meta.code == 0) {
                var dt = result.data.file;
                if (delfile) {
                    deletefile(c);
                }
                c = dt.url || c;
                console.log(dt);
                $('#' + bind).attr('src', c);
                $('#' + id).replaceWith('<input type="file" name="file" id="' + id + '" url="' + url + '"' +
                    'bind-img="' + bind + '" onchange = "upload(this);" accept = "image/png,image/jpeg"' +
                    'class= "hide UploadPicture-input" >');
                alert("文件上传成功");
            } else {
                alert('上传失败，服务器异常！');
            }
        },
    });
};

deletefile = function (url) {
    $.ajax({
        type: "delete",
        url: "/api/web/file/" + url,
        data: {},
        dataType: "json",
        success: result => {
            if (result.meta.code) {
            } else {
            }
        }
    });
};



handledata = function (el) {
    var url = $(el).attr('url');
    var userid = $(el).attr("userid");
    $("#List-content").html("");
    $('#Active-title').text($(el).text());
    $(".Tabs-link").removeClass("is-active");
    $(el).addClass("is-active")
    $.ajax({
        type: "post",
        url: "/api/web/" + userid + url,
        data: {},
        dataType: "json",
        success: result => {
            if (result.meta.code == 0) {
                let innerHTML = "";
                var count = result.data.length;
                for (var i = 0; i < count; i++) {
                    var item = result.data[i];
                    innerHTML = innerHTML + '<div class="List-item">';
                    innerHTML = innerHTML + item.followId.username;
                    innerHTML = innerHTML + "</div>";
                }
                if(count == 0){
                    innerHTML = '<div class="EmptyState">' +
                        '<div class="EmptyState-inner"><svg xmlns="http://www.w3.org/2000/svg" width="150" height="120" viewBox="0 0 150 120" class="EmptyState-image">' +
                        '<title></title>' +
                        '<g>' +
                        '<g fill="none" fill-rule="evenodd">' +
                        '<path fill="#EBEEF5" fill-rule="nonzero" d="M102 30.998A2.996 2.996 0 0 0 98.998 28H50.002A2.996 2.996 0 0 0 47 30.998v58.147l.193-.125c1.453-.94 3.473-.94 4.927 0l2.537 1.64 2.536-1.64c1.453-.94 3.473-.94 4.927 0l2.537 1.64 2.536-1.64c1.453-.94 3.473-.94 4.927 0l2.537 1.64 2.536-1.64c1.453-.94 3.473-.94 4.927 0l2.537 1.64 2.536-1.64c1.453-.94 3.473-.94 4.927 0l2.537 1.64 2.536-1.64c1.413-.913 3.363-.94 4.807-.075V30.998zm-1.508 60.542c-.464-.3-1.21-.298-1.67 0l-4.165 2.692-4.165-2.692c-.464-.3-1.21-.298-1.67 0l-4.165 2.692-4.165-2.692c-.464-.3-1.21-.298-1.67 0l-4.165 2.692-4.165-2.692c-.464-.3-1.21-.298-1.67 0l-4.165 2.692-4.165-2.692c-.464-.3-1.21-.298-1.67 0l-4.165 2.692-4.165-2.692c-.464-.3-1.21-.298-1.67 0l-4.316 2.79A1.99 1.99 0 0 1 44 93V30.997C44 27.687 46.68 25 50.002 25h48.996A5.996 5.996 0 0 1 105 30.998v62c0 .45-.147.866-.396 1.2l-4.112-2.658z"></path>' +
                        '<path fill="#F7F8FA" d="M55 39c0-.553.44-1 1-1h19c.553 0 1 .44 1 1v19c0 .553-.44 1-1 1H56c-.553 0-1-.44-1-1V39zm25 .5c0-.828.675-1.5 1.498-1.5h11.004c.827 0 1.498.666 1.498 1.5 0 .828-.675 1.5-1.498 1.5H81.498A1.495 1.495 0 0 1 80 39.5zm0 9c0-.828.675-1.5 1.498-1.5h11.004c.827 0 1.498.666 1.498 1.5 0 .828-.675 1.5-1.498 1.5H81.498A1.495 1.495 0 0 1 80 48.5zm0 9c0-.828.675-1.5 1.498-1.5h11.004c.827 0 1.498.666 1.498 1.5 0 .828-.675 1.5-1.498 1.5H81.498A1.495 1.495 0 0 1 80 57.5zm-25 9c0-.828.677-1.5 1.505-1.5h35.99a1.5 1.5 0 1 1 0 3h-35.99A1.5 1.5 0 0 1 55 66.5zm0 9c0-.828.665-1.5 1.505-1.5h24.99a1.5 1.5 0 1 1 0 3h-24.99A1.5 1.5 0 0 1 55 75.5z"></path>' +
                        '</g>' +
                        '</g>' +
                        '</svg><span>空空如也~~~</span></div>' +
                        '</div>'
                }
                $("#List-content").html(innerHTML);
            } else {
                // console.log(result);
            }
        }
    });
};

function addToFollow(el) {
    var userid = $(el).attr('userid');
    $.ajax({
        type: "put",
        url: "/api/web/follow/" + userid,
        data: {},
        dataType: "json",
        success: result => {
            $("#Follow").addClass('hide');
            $("#UnFollow").removeClass('hide');
        }
    });
};

function delFromFollow(el) {
    var userid = $(el).attr('userid');
    $.ajax({
        type: "delete",
        url: "/api/web/follow/" + userid,
        data: {},
        dataType: "json",
        success: result => {
            $("#UnFollow").addClass('hide');
            $("#Follow").removeClass('hide');
        }
    });
};

$(document).ready(function () {
    $("#UnFollow").hover(function () {
        $(this).html("取消关注");
    }, function () {
        $(this).html("已关注");
    });
    $("#EditProfile").on('click', function () {
        window.location.href = "/useredit/me";
    });
});

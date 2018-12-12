
function updateinfo() {
  $.ajax({
    type: "post",
    url: "/api/web/userinfo",
    data: {
    },
    dataType: "json",
    success: result => {
      if (result.meta.code) {
        $("#register").removeClass("hide");
        $("#login").removeClass("hide");
      } else {
        $("#name").html(result.data.username + "<b class='caret'></b>");
        $("#logout").removeClass("hide");
        // $("#name").removeClass("hide");
        $("#userinfo").removeClass("hide"); 
        $("#userinfo").addClass("dropdown"); 
        if (result.data.isadmin) {
          $("#usermgr").removeClass("hide");
          $("#categorymgr").removeClass("hide");   
        }
        if(result.data.verified){
          $("#console").removeClass("hide");
        }
      }
    }
  });
}

upload = function (el) {
  var id = $(el).attr('id');
  var url = $(el).attr('url');
  var bind = $(el).attr('bind-img');
  var c = $('#'+bind).attr('src');
  var idx = c.indexOf('file');
  console.log(idx);
  var file=$(el).get(0).files[0];
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
          // deletefile(c);
          c = dt.url || c;
          console.log(dt);
          $('#'+bind).attr('src', c);
          $('#' + id).replaceWith('<input type="file" name="file" id="'+ id +'" url="'+url+'"' +
                                            'bind-img="'+ bind +'" onchange = "upload(this);" accept = "image/png,image/jpeg"'+
                                            'class= "hide UploadPicture-input" >');
          alert("文件上传成功");
        } else {
        alert('上传失败，服务器异常！'); 
      }
    },                       
  });
};

deletefile = function(url){
  $.ajax({
    type: "delete",
    url: "/api/web/file/"+url,
    data: {},
    dataType: "json",
    success: result => {
      if (result.meta.code) {
      } else {
      }
    }
  });
};
window.onload = updateinfo;


function updateinfo() {
  $.ajax({
    type: "post",
    url: "/api/userinfo",
    data: {
    },
    dataType: "json",
    success: result => {
      if (result.code) {
        $("#register").removeClass("hide");
        $("#login").removeClass("hide");
      } else {
        $("#name").html("欢迎, " + result.userinfo.username);
        $("#logout").removeClass("hide");
        $("#name").removeClass("hide");
        if (result.userinfo.isadmin) {
          $("#console").removeClass("hide");
        }
      }
    }
  });
}
window.onload = updateinfo;

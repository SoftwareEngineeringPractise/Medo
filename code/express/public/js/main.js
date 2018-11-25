
function updateinfo() {
  $.ajax({
    type: "post",
    url: "/api/web/userinfo",
    data: {
    },
    dataType: "json",
    success: result => {
      if (result.code) {
        $("#register").removeClass("hide");
        $("#login").removeClass("hide");
      } else {
        $("#name").html("欢迎, " + result.data.username);
        $("#logout").removeClass("hide");
        $("#name").removeClass("hide");
        if (result.data.isadmin) {
          $("#console").removeClass("hide");
        }
      }
    }
  });
}
window.onload = updateinfo;

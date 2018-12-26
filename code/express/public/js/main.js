
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
        // $("#name").html(result.data.username + "<b class='caret'></b>");
        $("#logout").removeClass("hide");
        // $("#name").removeClass("hide");
        $("#userinfo").removeClass("hide"); 
        $("#userinfo").addClass("dropdown"); 
        if (result.data.isadmin) {
          $("#usermgr").removeClass("hide");
          $("#categorymgr").removeClass("hide");
          $("#verificationmgr").removeClass("hide");
        }
        if(result.data.verified){
          $("#console").removeClass("hide");
        }
      }
    }
  });
}

window.onload = updateinfo;

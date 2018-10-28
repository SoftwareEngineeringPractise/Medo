$(() => {
          // 获取点击注册的连接
          const $regLink = $("#login a");
          // 获取点击登录的连接
          const $loginLink = $("#reg a");
          // 获取登录的div
          const $loginDiv = $("#login");
          // 获取注册的div
          const $regDiv = $("#reg");
          // 获取登录按钮
          const $loginBtn = $("#login-btn");
          // 获取注册按钮
          const $regBtn = $("#reg-btn");
          //获取管理员按钮
          const $adminBtn = $("#admin-btn");
          // 获取登出按钮
          const $logoutBtn = $("#logout");
          // 获取警告框
          const $warningBox = $(".alert");

          // // 切换到登录/注册界面的方法
          // (() => {
          //   // 注册点击事件
          //   $regLink.on("click", () => {
          //     // 隐藏登录界面
          //     $loginDiv.hide();
          //     // 显示注册界面
          //     $regDiv.removeClass("hide");
          //     $regDiv.addClass("show");
          //   });
          //   // 注册点击事件
          //   $loginLink.on("click", () => {
          //     // 隐藏注册界面
          //     $regDiv.hide();
          //     $regDiv.removeClass("show");
          //     // 显示登录界面
          //     $loginDiv.show();
          //   });
          // })();

          // 警告框的关闭
          // (() => {
          //   $("button[class='close']").bind("click", e => {
          //     $warningBox.addClass("hide");
          //   });
          // })();

          // ajax请求
          // (() => {
          //   // 用户注册
          //   $regBtn.on("click", () => {
          //     // 通过ajax提交数据
          //     $.ajax({
          //       type: "post",
          //       url: "/api/user/register",
          //       data: {
          //         username: $("#reg [name='username']").val(),
          //         password: $("#reg [name='password']").val(),
          //         repassword: $("#reg [name='repassword']").val()
          //       },
          //       dataType: "json",
          //       success: result => {
          //         if (result.code) {
          //           $warningBox
          //             .find("span")
          //             .html("警告：" + result.message);
          //           $warningBox.addClass("alert-danger");
          //           $warningBox.removeClass("hide alert-success");
          //         } else {
          //           $warningBox
          //             .find("span")
          //             .html("恭喜您" + result.message);
          //           $warningBox.addClass("alert-success");
          //           $warningBox.removeClass("hide alert-danger");
          //         }
          //       }
          //     });
          //   });

          //   // 用户登录
          //   $loginBtn.on("click", () => {
          //     $.ajax({
          //       type: "post",
          //       url: "/api/user/login",
          //       data: {
          //         username: $("#login [name='username']").val(),
          //         password: $("#login [name='password']").val()
          //       },
          //       dataType: "json",
          //       success: result => {
          //           // 重新加载页面
          //           window.location.href = "/";
                  
          //       }
          //     });
          //   });

          //   // 用户登出
          //   $logoutBtn.on("click", () => {
          //     $.ajax({
          //       type: "get",
          //       url: "/api/user/logout",
          //       success: result => {
          //         if (result) {
          //           window.location.reload();
          //         }
          //       }
          //     });
          //   });

          //   $adminBtn.on("click", () => {
          //     window.location.href = "/admin";
          //   });
          // })();
  $.ajax({
    type: "post",
    url: "/api/userinfo",
    data: {
    },
    dataType: "json",
    success: result => {
      if (result.code) {
        $("#name").remove();
        $("#console").remove();
        $("#logout").remove();
      } else {
        $("#login").remove();
        $("#register").remove();
        $("#name")
          .find("a")
          .html("欢迎, " + result.userinfo.username);
        // $warningBox.addClass("alert-success");
        // $warningBoex.removeClass("hide alert-danger");
        if(!result.userinfo.isadmin){
          $("#console").remove();
        }
      }
    }
  });

});


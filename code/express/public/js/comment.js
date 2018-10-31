$(() => {
    // 提交评论
    (() => {
        // 获取提交按钮
        $subBtn = $("#comment-btn");
        // 获取评论内容
        $comment = $("#comment");
        // ajax请求
        $subBtn.on("click", () => {
            // 简单验证
            if ($comment.val() === "") {
                alert("评论内容不能为空");
                return;
            }
            $.ajax({
                type: "post",
                url: "/api/comment/post",
                data: {
                    contentId: $("#contentId").val(),
                    comment: $comment.val()
                },
                dataType: "json",
                success: (result) => {
                    renderComment();
                    $comment.val("")
                }
            });
        });
    })();

    renderComment = () => {
        $.ajax({
            type: "get",
            url: "/api/comment/",
            data: {
                contentId: $("#contentId").val(),
            },
            dataType: "json",
            success: (result) => {
                // 创建html结构
                let commentList = "";
                for (let i = result.length - 1; i >= 0; i--) {
                        commentList += `

<div class="row">
  <div class="col-sm-1">
    <div class="thumbnail">
      <img
        class="img-responsive user-photo"
        src="https://ssl.gstatic.com/accounts/ui/avatar_2x.png"
      />
    </div>
  </div>
  <div class="col-sm-11">
    <div class="panel panel-default">
      <div class="panel-heading">
        <strong>${result[i].username} </strong>
        <span class="text-muted">${result[i].postTime}</span>
      </div>
            <div class="panel-body">${result[i].content}</div>
    </div>
  </div>
</div>
                    `;
                }
                $(".commentList").html(commentList);
            }
        });
    }
    renderComment();

});




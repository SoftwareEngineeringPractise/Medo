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
                    // 调用渲染评论函数
                    renderComment();
                    $comment.val("")
                }
            });
        });
    })();

    // 渲染评论的函数
    renderComment = () => {
        // ajax请求
        $.ajax({
            type: "get",
            url: "/api/comment/",
            data: {
                contentId: $("#contentId").val(),
            },
            dataType: "json",
            success: (result) => {
                // 创建html结构
                let commentList = `<ul class="media-list">`;
                for (let i = result.length - 1; i >= 0; i--) {
                    // 格式化时间
                    let postTime = (commentList += `



                    <li class="media">
                        <a class="pull-left" href="#">
                          <img class="media-object img-circle" src="https://s3.amazonaws.com/uifaces/faces/twitter/dancounsell/128.jpg" alt="profile">
                        </a>
                        <div class="media-body">
                          <div class="well well-lg">
                              <h4 class="media-heading text-uppercase reviews">${result[i].username} </h4>
                              <ul class="media-date text-uppercase reviews list-inline">
<li >${result[i].postTime}</li>
                              </ul>
                              <p class="media-comment">
                                ${result[i].content}
                              </p>
                              <a class="btn btn-info btn-circle text-uppercase" href="#" id="reply"><span class="glyphicon glyphicon-share-alt"></span> Reply</a>
                              <a class="btn btn-warning btn-circle text-uppercase" data-toggle="collapse" href="#replyOne"><span class="glyphicon glyphicon-comment"></span> 2 comments</a>
                          </div>              
                        </div>









<div class="collapse" id="replyOne">
                            <ul class="media-list">
                                <li class="media media-replied">
                                    <a class="pull-left" href="#">
                                      <img class="media-object img-circle" src="https://s3.amazonaws.com/uifaces/faces/twitter/ManikRathee/128.jpg" alt="profile">
                                    </a>
                                    <div class="media-body">
                                      <div class="well well-lg">
                                          <h4 class="media-heading text-uppercase reviews"><span class="glyphicon glyphicon-share-alt"></span> The Hipster</h4>
                                          <ul class="media-date text-uppercase reviews list-inline">
                                            <li class="dd">22</li>
                                            <li class="mm">09</li>
                                            <li class="aaaa">2014</li>
                                          </ul>
                                          <p class="media-comment">
                                            Nice job Maria.
                                          </p>
                                          <a class="btn btn-info btn-circle text-uppercase" href="#" id="reply"><span class="glyphicon glyphicon-share-alt"></span> Reply</a>
                                      </div>              
                                    </div>
                                </li>
                                <li class="media media-replied" id="replied">
                                    <a class="pull-left" href="#">
                                      <img class="media-object img-circle" src="https://pbs.twimg.com/profile_images/442656111636668417/Q_9oP8iZ.jpeg" alt="profile">
                                    </a>
                                    <div class="media-body">
                                      <div class="well well-lg">
                                          <h4 class="media-heading text-uppercase reviews"><span class="glyphicon glyphicon-share-alt"></span> Mary</h4>
                                          <ul class="media-date text-uppercase reviews list-inline">
                                            <li class="dd">22</li>
                                            <li class="mm">09</li>
                                            <li class="aaaa">2014</li>
                                          </ul>
                                          <p class="media-comment">
                                            Thank you Guys!
                                          </p>
                                          <a class="btn btn-info btn-circle text-uppercase" href="#" id="reply"><span class="glyphicon glyphicon-share-alt"></span> Reply</a>
                                      </div>              
                                    </div>
                                </li>
                            </ul>  
                        </div>









                    </li>
                    `);
                }
                commentList += `</ul>`;
                  // 添加进入html文档中
                  $(".commentList").html(commentList);
            }
        });
    }

    // 调用渲染评论函数
    renderComment();

});
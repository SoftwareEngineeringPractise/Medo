### Medo接口简要说明

**说明**

1. 以下API 的BASEURL为 http://serveip:serverport/api/wx，使用都需要将下面的相对路径加上该前缀作为访问接口
2. 以下API 请求的 header 的`Content-Type` 都是 `application/json` ，凡标记`login required` 都需要在header上设定 `Authorization` 为认证时返回的 `token` 
3. 返回JSON 格式为{meta:{code:, message}, data:}  code为0说明正常返回结果，data为返回的数据

**1. 微信小程序认证**  

| 方式 | 路由          | 参数 | 结果  | 说明                                              |
| ---- | ------------- | ---- | ----- | ------------------------------------------------- |
| POST | /wei_xin/auth | code | token | 若openid已经注册到数据库，返回token，便于简化登录 |

**2. 登入注册**



|      |                 |                             |       |                                                   |
| ---- | --------------- | --------------------------- | ----- | ------------------------------------------------- |
| POST | /users/login    | code                        | token | 若openid已经注册到数据库，返回token，便于简化登录 |                                             |
| POST | /users/register | username tel password email |       | 用户注册                                          |

**3. 登出**  `login required`

|      |                 |                             |       |                                                   |
| ---- | --------------- | --------------------------- | ----- | ------------------------------------------------- |
| GET  | /users/logout   | token                       |       | 用户登出                                          |



**4. 信息修改 ** `login required`


|      |                   |          |      |            |
| ---- | ----------------- | -------- | ---- | ---------- |
| PUT  | /users/me/name    | name     |      | 修改用户名 |
| PUT  | /user/me/password | password |      | 修改密码   |
| PUT  | /user/me/tel      | tel      |      | 修改手机号 |
| PUT  | /user/me/email    | email    |      | 修改邮箱   |



**5. 用户信息**  `login requird`

|      |                 |      |                   |                                                      |
| ---- | --------------- | ---- | ----------------- | ---------------------------------------------------- |
| GET  | /users/:id/info |      | _id为id的用户信息 | id为用户的唯一标识（_id）当id为'me'时 获取自己的信息 |



**6. 实验室信息** `login required`

|      |                |      |                     |                                                        |
| ---- | -------------- | ---- | ------------------- | ------------------------------------------------------ |
| GET  | /labs/:id/info |      | _id为id的实验室信息 | id为用户的唯一标识（_id）当id为'me'时 获取实验室的信息 |

**7. 公告动态**

|      |           |                                          |                                              |      |
| ---- | --------- | ---------------------------------------- | -------------------------------------------- | ---- |
| GET  | /contents | page 可选  categoryid 可选 authorid 可选 | 返回所有(指定页数)(指定作者)(指定分类)的文章 |      |

**8 用户评论** `login required`

|      |                   |         |                  |                          |
| ---- | ----------------- | ------- | ---------------- | ------------------------ |
| GET  | /comment/:id      |         | 返回用户id的评论 | id为me时返回对自己的评论 |
| POST | /comment/:id/post | comment |                  |                          |

**9 文章提交 ** `login required`

|      |               |                                         |      |          |
| ---- | ------------- | --------------------------------------- | ---- | -------- |
| POST | /content/post | category(id)，description,title,content |      | 文章提交 |

**10 类别查询**

|      |             |      |                        |      |
| ---- | ----------- | ---- | ---------------------- | ---- |
| GET  | /categories |      | 返回当前文章的归档分类 |      |

 **11 关注和收藏** `login requird`

|      |                      |                     |              |          |
| ---- | -------------------- | ------------------- | ------------ | -------- |
| POST | /follow/:id/add      | id 加入关注的用户id |              | 加入关注 |
| POST | /follow/:id/delete   | id 取消关注的用户id |              | 取消关注 |
| POST | /favorite/:id/add    | id 加入收藏的文章id |              | 加入收藏 |
| POST | /favorite/:id/delete | id 取消收藏的文章id |              | 取消收藏 |
| GET  | /me/follows          |                     | 我关注的用户 |          |
| GET  | /me/favorites        |                     | 我收藏的文章 |          |

**12 动态**  `login required`

|      |               |      |                |      |
| ---- | ------------- | ---- | -------------- | ---- |
| GET  | /me/updatings |      | 我关注的人文章 |      |

**13 搜索**

|      |                       |          |                             |      |
| ---- | --------------------- | -------- | --------------------------- | ---- |
| GET  | /search/username/:q   | q 搜索串 | 用户名某一子串为q的所有用户 |      |
| GET  | /search/school/:q     | q 搜索串 | 学校某一子串为q的所有用户   |      |
| GET  | /search/department/:q | q 搜索串 | 院系某一子串为q的所有用户   |      |


### Medo接口设计

#### 一、登录

##### 1.1接口

| 方法 |    url     |           备注            |
| :--: | :--------: | :-----------------------: |
| POST | /api/login | 用户登录，记录Session信息 |

##### 1.2 参数

|  表单项  |  说明  | 是否必须 |
| :------: | :----: | :------: |
| username | 用户名 |    是    |
| password |  密码  |    是    |

##### 1.3 返回

|   项    |            说明             |
| :-----: | :-------------------------: |
|  code   | 返回状态，0代表成功没有异常 |
| message |    辅助返回信息便于调试     |

##### 1.4 返回示例

```javascript
{
    "code": 0,
    "message": "登录成功"
}
```

```javascript
{
    "code": 1,
    "message": "用户名或密码不正确"
}
```

#### 二、注册

##### 2.1 接口

| 方法 |      url      |   备注   |
| :--: | :-----------: | :------: |
| POST | /api/register | 用户注册 |

##### 2.2 参数


|   表单项    |       说明       | 是否必须 |
| :---------: | :--------------: | :------: |
|  username   |      用户名      |    是    |
|  password   |  密码(至少4位)   |    是    |
|    email    |       邮箱       |    是    |
|  firstname  |        名        |    否    |
|  lastname   |        姓        |    否    |
| phonenumber | zh-CN 11位手机号 |    否    |

##### 2.3 返回

|   项    |            说明             |
| :-----: | :-------------------------: |
|  code   | 返回状态，0代表成功没有异常 |
| message |    辅助返回信息便于调试     |

##### 2.4返回示例

```javascript
{
    "code": 1,
    "message": "此用户名已经被注册"
}
```

```javascript
{
    "code": 1,
    "message": [
        "输入无效email,email格式为example@example.com",
        "输入无效手机号码,手机号码为11位",
        "输入无效密码,密码至少为4位"
    ]
}
```

#### 三、登出

##### 3.1 接口

| 方法 |     url     |           备注            |
| :--: | :---------: | :-----------------------: |
| GET  | /api/logout | 用户登出，删除Session信息 |

##### 3.2 参数

无参数 但必须保持Session登入状态

##### 3.3 返回

|   项    |            说明             |
| :-----: | :-------------------------: |
|  code   | 返回状态，0代表成功没有异常 |
| message |    辅助返回信息便于调试     |

##### 3.4 返回示例

```javascript
{
    "code": 0,
    "message": "退出成功"
}
```

```javascript
{
    "code": 2,
    "message": "用户没有登录"
}
```

#### 四、查看用户信息

##### 4.1 接口

| 方法 |      url      |   备注   |
| :--: | :-----------: | :------: |
| POST | /api/userinfo | 用户信息 |

##### 4.2参数

没有参数 但必须保持Session登入状态

##### 4.3 返回

|     项      |               说明               |
| :---------: | :------------------------------: |
|    code     |   返回状态，0代表成功没有异常    |
|   message   |       辅助返回信息便于调试       |
|    data     |    用户信息，包括info和detail    |
|  data.info  |           用户基本信息           |
| data.detail |           用户详细信息           |
|  username   |              用户名              |
|   isadmin   |           是否是管理员           |
| phonenumber |              手机号              |
|  firstname  |                名                |
|  lastname   |                姓                |
|    email    |               邮箱               |
|    role     | 角色(Visitor,Student,Mentor,Lab) |
|   gender    |               性别               |
|    motto    |               签名               |
|  realname   |             真实姓名             |
| description |             个人描述             |
|    user     |              用户id              |

##### 4.4 返回示例

```javascript
{
    "code": 0,
    "message": "用户信息返回成功！",
    "data": {
        "info": {
            "username": "admin",
            "isadmin": true,
            "phonenumber": "18301621875",
            "firstname": "Peter",
            "lastname": "Zhu",
            "email": "example@pku.edu.cn",
            "role": "Visitor"
        },
        "detail": {
            "gender": "undefined",
            "motto": "Life is tough",
            "realname": "你猜啊",
            "description": "哈哈",
            "_id": "5be9b39846485c1cb44bce8e",
            "user": "5be9b39846485c1cb44bce8d",
            "__v": 0
        }
    }
}
```

```javascript
{
    "code": 2,
    "message": "用户未登录！"
}
```

#### 五、内容

##### 5.1 接口

| 方法 |      url      |             备注             |
| :--: | :-----------: | :--------------------------: |
| GET  | /api/contents | 获取网站内容，以分页形式返回 |

##### 5.2 参数

|   表单项   |             说明             |             是否必须             |
| :--------: | :--------------------------: | :------------------------------: |
|    page    |           内容页数           |  否(如果没有page默认返回第一页)  |
| categoryid | 内容分类(公告、招聘、动态等) | 否(如果没有分类默认返回所有类别) |

##### 5.3 返回

|     项      |            说明             |
| :---------: | :-------------------------: |
|    code     | 返回状态，0代表成功没有异常 |
|   message   |    辅助返回信息便于调试     |
|    data     | 内容包括文章docs和分页情况  |
|   addTime   |        内容添加时间         |
|    views    |        浏览点击人数         |
| description |          内容描述           |
|   content   |          文章内容           |
|   comment   |            评论             |
|    title    |            标题             |
|  category   |         内容的分类          |
|   author    |          作者信息           |
|    page     |          当前页数           |
|    pages    |           总页数            |
|    limit    |        每页显示条数         |
|    count    |           总条数            |
|   params    |          其它参数           |

##### 5.4 返回示例

```javascript
{
    "code": 0,
    "message": "分页结果1",
    "data": {
        "docs": [
            {
                "addTime": "2018-11-13 1:56:11 am",
                "views": 1,
                "description": "adad",
                "content": "S8夺冠",
                "comment": [
                    {
                        "username": "admin",
                        "postTime": "2018-11-12T19:04:35.862Z",
                        "content": "123"
                    },
                    {
                        "username": "admin",
                        "postTime": "2018-11-12T19:04:39.425Z",
                        "content": "12"
                    },
                    {
                        "username": "admin",
                        "postTime": "2018-11-12T19:04:42.915Z",
                        "content": "12212"
                    }
                ],
                "_id": "5be9bef23ce9e012ac2b0892",
                "title": "unbelievable",
                "category": {
                    "_id": "5be9b978adfe5f42404a1d21",
                    "name": "实验室公告",
                    "__v": 0
                },
                "author": {
                    "role": "Visitor",
                    "isadmin": true,
                    "verified": false,
                    "_id": "5be9b39846485c1cb44bce8d",
                    "username": "admin"
                },
                "__v": 3
            },
            {
                "addTime": "2018-11-13 1:56:11 am",
                "views": 0,
                "description": "md测试",
                "content": "# HHHHH",
                "comment": [],
                "_id": "5be9bed73ce9e012ac2b0891",
                "title": "TEST",
                "category": {
                    "_id": "5be9b978adfe5f42404a1d21",
                    "name": "实验室公告",
                    "__v": 0
                },
                "author": {
                    "role": "Visitor",
                    "isadmin": true,
                    "verified": false,
                    "_id": "5be9b39846485c1cb44bce8d",
                    "username": "admin"
                },
                "__v": 0
            }
        ],
        "page": 1,
        "pages": 2,
        "limit": 2,
        "count": 3,
        "params": {}
    }
}
```

#### 六、用户信息编辑

##### 6.1 接口

| 方法 |        url         |     备注     |
| :--: | :----------------: | :----------: |
| POST | /api/userinfo/edit | 用户信息修改 |

##### 6.2 参数

|   表单项    |   说明   | 是否必须 |
| :---------: | :------: | :------: |
|  username   |  用户名  |    否    |
| phonenumber |   密码   |    否    |
|  firstname  |    名    |    否    |
|  lastname   |    姓    |    否    |
|    email    |  email   |    否    |
|    role     |   角色   |    否    |
|   gender    |   性别   |    否    |
|    motto    |   签名   |    否    |
|  realname   | 真实姓名 |    否    |
| description | 个人描述 |    否    |

##### 6.3 返回

|   项    |            说明             |
| :-----: | :-------------------------: |
|  code   | 返回状态，0代表成功没有异常 |
| message |    辅助返回信息便于调试     |

##### 6.4 返回示例

```javascript
{
    "code": 0,
    "message": "用户信息修改完成"
}
```

```javascript
{
    "code": 2,
    "message": "未修改任何数据！"
}
```

#### 七、查看内容

##### 7.1 接口

| 方法 |    url     |   备注   |
| :--: | :--------: | :------: |
| GET  | /api/views | 用户登录 |

##### 7.2 参数

|  表单项   |   说明   | 是否必须 |
| :-------: | :------: | :------: |
| contentid | 内容的id |    是    |

##### 7.3 返回

|     项      |            说明             |
| :---------: | :-------------------------: |
|    code     | 返回状态，0代表成功没有异常 |
|   message   |    辅助返回信息便于调试     |
| contentHtml |  markdown渲染后的内容html   |
|   addTime   |        内容添加时间         |
|    views    |         点击阅读数          |
| description |            描述             |
|   comment   |            评论             |
|   author    |            作者             |
|    title    |            标题             |
|  category   |            分类             |

##### 7.4 返回示例

```javascript
{
    "code": 0,
    "message": "返回id为5be9b9ccadfe5f42404a1d24的公告",
    "data": {
        "contentHtml": "<p>【Introduction】\n语言计算与机器学习组从属于北京大学 信息学院 计算机系 计算语言学研究所（计算语言学教育部重点实验室），成立于2013年，负责人为孙栩老师。本组以机器学习技术、深度学习技术为基础，研究适用于一般文本的语言计算模型与手段，为自然语言理解系统的关键节点提供技术支撑。本组目前的主要研究内容有：面向自然语言理解的统计学习理论和技术（特别是结构化学习理论和技术）。</p>\n<p>【News】</p>\n<p>2018年11月，本组完成的2篇论文被 AAAI 2019录用。</p>\n<p>2018年10月，我们拿到了 全球任务导向多轮人机对话挑战赛（JDDC） 的自动评测冠军、手动评测第二名。参赛同学有罗睿轩、任宣丞、林俊旸、许晶晶、刘澍等，指导老师为孙栩老师。</p>\n<p>2018年10月，本组马树铭、林俊旸、杨鹏程三位同学获得国家奖学金；许晶晶与任宣丞同学获得校级“三好学生标兵”称号；许晶晶、李炜、张艺、任宣丞四位同学获得校级“三好学生”称号。</p>\n<p>2018年8月， 孙栩老师获得了中国计算机学会NLPCC青年新锐奖 (CCF-NLPCC Distinguished Young Scientist Award)。</p>\n<p>2018年8月，本组完成的4篇长文和4篇短文被自然语言处理顶级会议之一 EMNLP 2018录用，其中2篇论文由本组的两位本科实习生以一作身份发表（刘峰林、骆梁辰）。祝贺相关同学！</p>\n<p>2018年6月，本组论文“SGM: Sequence Generation Model for Multi-label Classification” 获得COLING 2018最佳论文奖。【link】【photo1】【photo2】</p>\n<p>2018年5月，本组完成的4篇论文被 COLING 2018录用。</p>\n<p>2018年4月，本组完成的6篇论文被自然语言处理顶级会议 ACL 2018 录用。</p>\n<p>2018年4月，本组完成的1篇论文被 IJCAI 2018录用。</p>\n<p>2018年3月，本组完成的2篇论文被 NAACL 2018录用。</p>\n<p>2017年12月，本组完成的2篇论文被 LREC 2018录用。</p>\n<p>2017年11月，本实验室硕士二年级李炜同学申请硕转博为本组博士研究生，通过考核，开始攻读博士学位</p>\n<p>2017年11月，本组2篇论文被 AAAI 2018录用，AAAI是人工智能领域的顶级会议之一。</p>\n<p>2017年9月，本组3篇论文被 IJCNLP 2017录用。</p>\n<p>2017年9月，欢迎任宣丞、陈德里等博士、硕士同学，以及多名本科实习生同学加入本组。任宣丞同学之前为我组的本科实习生，实习期间发表机器学习顶级会议ICML一篇，9月开始攻读本组博士。</p>\n<p>2017年5月，本组独立完成的论文被 ICML 2017录用，ICML是机器学习领域的顶级会议之一。</p>\n<p>2017年3月，本组独立完成论文Improving Semantic Relevance for Chinese Social Media Text Summarization 被 ACL 2017录用，F-Score Driven Max Margin Neural Network for Named Entity Recognition in Chinese Social Media 被 EACL 2017 录用，ACL是自然语言处理顶级会议之一。</p>\n<p>2016年11月，孙栩老师在美国奥斯丁召开的EMNLP 2016国际会议作了讲习班（Tutorial）报告，题目为“Methods and Theories for Large-scale Structured Prediction”。Tutorial报告时间为三个小时。该tutorial为EMNLP 2016中注册人数最多的两个tutorial报告之一（总共6个tutorial报告）。</p>\n<p>2016年11月，孙栩老师获得2016年度日本大川研究奖(Okawa Research Award/Grant)。</p>\n<p>2016年11月，本组独立完成的论文A Uniﬁed Model for Cross-Domain and Semi-Supervised Named Entity Recognition in Chinese Social Media被AAAI 2017录用，AAAI是人工智能的顶级会议之一。</p>\n<p>2016年 9月，本组独立完成的论文Asynchronous Parallel Learning for Neural Networks and Structured Models with Dense Features被COLING 2016录用，COLING是自然语言处理的顶级会议之一。</p>\n<p>2016年9月，欢迎马树铭、张艺等研究生同学，以及多名本科实习生同学加入本组。马树铭同学之前为我组的本科实习生。</p>\n",
        "content": {
            "addTime": "2018-11-13 1:33:10 am",
            "views": 25,
            "description": "招生信息",
            "content": "【Introduction】\r\n语言计算与机器学习组从属于北京大学 信息学院 计算机系 计算语言学研究所（计算语言学教育部重点实验室），成立于2013年，负责人为孙栩老师。本组以机器学习技术、深度学习技术为基础，研究适用于一般文本的语言计算模型与手段，为自然语言理解系统的关键节点提供技术支撑。本组目前的主要研究内容有：面向自然语言理解的统计学习理论和技术（特别是结构化学习理论和技术）。\r\n\r\n【News】\r\n    \r\n\r\n2018年11月，本组完成的2篇论文被 AAAI 2019录用。\r\n\r\n2018年10月，我们拿到了 全球任务导向多轮人机对话挑战赛（JDDC） 的自动评测冠军、手动评测第二名。参赛同学有罗睿轩、任宣丞、林俊旸、许晶晶、刘澍等，指导老师为孙栩老师。\r\n\r\n2018年10月，本组马树铭、林俊旸、杨鹏程三位同学获得国家奖学金；许晶晶与任宣丞同学获得校级“三好学生标兵”称号；许晶晶、李炜、张艺、任宣丞四位同学获得校级“三好学生”称号。\r\n\r\n2018年8月， 孙栩老师获得了中国计算机学会NLPCC青年新锐奖 (CCF-NLPCC Distinguished Young Scientist Award)。\r\n\r\n2018年8月，本组完成的4篇长文和4篇短文被自然语言处理顶级会议之一 EMNLP 2018录用，其中2篇论文由本组的两位本科实习生以一作身份发表（刘峰林、骆梁辰）。祝贺相关同学！\r\n\r\n2018年6月，本组论文“SGM: Sequence Generation Model for Multi-label Classification” 获得COLING 2018最佳论文奖。【link】【photo1】【photo2】\r\n\r\n2018年5月，本组完成的4篇论文被 COLING 2018录用。\r\n\r\n2018年4月，本组完成的6篇论文被自然语言处理顶级会议 ACL 2018 录用。\r\n\r\n2018年4月，本组完成的1篇论文被 IJCAI 2018录用。\r\n\r\n2018年3月，本组完成的2篇论文被 NAACL 2018录用。\r\n\r\n2017年12月，本组完成的2篇论文被 LREC 2018录用。\r\n\r\n2017年11月，本实验室硕士二年级李炜同学申请硕转博为本组博士研究生，通过考核，开始攻读博士学位\r\n\r\n2017年11月，本组2篇论文被 AAAI 2018录用，AAAI是人工智能领域的顶级会议之一。\r\n\r\n2017年9月，本组3篇论文被 IJCNLP 2017录用。\r\n\r\n2017年9月，欢迎任宣丞、陈德里等博士、硕士同学，以及多名本科实习生同学加入本组。任宣丞同学之前为我组的本科实习生，实习期间发表机器学习顶级会议ICML一篇，9月开始攻读本组博士。\r\n\r\n2017年5月，本组独立完成的论文被 ICML 2017录用，ICML是机器学习领域的顶级会议之一。\r\n\r\n2017年3月，本组独立完成论文Improving Semantic Relevance for Chinese Social Media Text Summarization 被 ACL 2017录用，F-Score Driven Max Margin Neural Network for Named Entity Recognition in Chinese Social Media 被 EACL 2017 录用，ACL是自然语言处理顶级会议之一。\r\n\r\n2016年11月，孙栩老师在美国奥斯丁召开的EMNLP 2016国际会议作了讲习班（Tutorial）报告，题目为“Methods and Theories for Large-scale Structured Prediction”。Tutorial报告时间为三个小时。该tutorial为EMNLP 2016中注册人数最多的两个tutorial报告之一（总共6个tutorial报告）。\r\n\r\n2016年11月，孙栩老师获得2016年度日本大川研究奖(Okawa Research Award/Grant)。\r\n\r\n2016年11月，本组独立完成的论文A Uniﬁed Model for Cross-Domain and Semi-Supervised Named Entity Recognition in Chinese Social Media被AAAI 2017录用，AAAI是人工智能的顶级会议之一。\r\n\r\n2016年 9月，本组独立完成的论文Asynchronous Parallel Learning for Neural Networks and Structured Models with Dense Features被COLING 2016录用，COLING是自然语言处理的顶级会议之一。\r\n\r\n2016年9月，欢迎马树铭、张艺等研究生同学，以及多名本科实习生同学加入本组。马树铭同学之前为我组的本科实习生。\r\n",
            "comment": [],
            "_id": "5be9b9ccadfe5f42404a1d24",
            "title": "计算语言学教育部重点实验室",
            "category": {
                "_id": "5be9b978adfe5f42404a1d21",
                "name": "实验室公告",
                "__v": 0
            },
            "author": {
                "role": "Visitor",
                "isadmin": true,
                "verified": false,
                "_id": "5be9b39846485c1cb44bce8d",
                "username": "admin"
            },
            "__v": 0
        }
    }
}
```

#### 八、评论

##### 8.1 接口

| 方法 |        url        |   备注   |
| :--: | :---------------: | :------: |
| POST | /api/comment/post | 提交评论 |
| GET  |   /api/comment    | 返回评论 |

##### 8.2 参数

|  表单项   |   说明   | 是否必须 |
| :-------: | :------: | :------: |
| contentId |  内容id  |    是    |
|  comment  | 评论内容 |    是    |

#####  8.3 返回

|   项    |            说明             |
| :-----: | :-------------------------: |
|  code   | 返回状态，0代表成功没有异常 |
| message |    辅助返回信息便于调试     |
|  data   |          评论信息           |

##### 8.4 返回示例

```javascript
{
    "code": 0,
    "message": "内容id为5be9bed73ce9e012ac2b0891的用户评论",
    "data": [
        {
            "username": "admin",
            "postTime": "2018-11-14T12:22:49.716Z",
            "content": "Hello"
        }
    ]
}
```

```javascript
{
    "code": 0,
    "message": "评论提交成功"
}
```

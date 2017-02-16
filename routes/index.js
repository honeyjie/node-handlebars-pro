'use strict';

var express = require('express');
var app = express();
var router = express.Router();
var url = require('url');
var path = require('path');
var request = require('request')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());

var helpers = require('../lib/helpers');

var hbs = exphbs.create({
    defaultLayout: 'main',
    extname: "hbs",
    helpers: helpers,
    partialsDir: [
        'shared/templates',
        'views/partials/',
    ]
});

//渲染页面
router.get('/', function (req, res, next) {
    console.log(res.locals.partials.loginstate.id,"]]]]", !res.locals.partials.loginstate.id, res.locals.partials.loginstate.code === 0)
    if(req.query.code) {
        res.cookie('code', req.query.code);
    }
    res.render('index', {
      show: true
    });
});

router.get('/notifications', function(req, res, next) {
  if (res.locals.partials.loginstate.code !== 0) {
    res.redirect('/');
    return;
  }
  var newsstate;
  req.proxy.request({
      method: "GET",
      url: "http://api.inner.utuotu.com/v1/User/getmsgstatus.action"
  }, function(err, response, body) {
      var data = JSON.parse(body);
      newsstate = data.data;
  }); 

  req.proxy.request({
      method: "GET",
      qs: {system: req.query.system},
      url: "http://api.inner.utuotu.com/v1/User/getmsg.action"
  }, function(err, response, body) {
      var getmsg = JSON.parse(body);
      var urlPath = url.parse(req.url).path;
      var query = url.parse(req.url).query;

      if (!query) {
        urlPath = urlPath + "?page="
      } else {
        var query = query.page;
        if (!query) {
          urlPath = urlPath + "?page="
        }
      }
      setTimeout(function(res) {
        res.render('notifications', {
                data: getmsg.data,
                system: req.query.system,
                urlPath :urlPath,
                newsstate: newsstate,
                usernews:true,
                userCenter: true
              })
      }, 500, res);
  })
});

router.get('/points', function(req, res, next) {
  if (res.locals.partials.loginstate.code !== 0) {
    res.redirect('/');
    return;
  }
  var currnetcredit,
      creditlog,
      mission,
      invitenum,
      inviteCode;
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/User/currnetcredit.action",
        qs: req.query
    }, function(err, response, body) {
        currnetcredit = JSON.parse(body);
        return currnetcredit;
    })
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/User/creditlog.action",
        qs: req.query
    }, function(err, response, body) {
        creditlog = JSON.parse(body).data;
        return creditlog;
    })
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/User/mission.action",
        qs: req.query
    }, function(err, response, body) {
        mission = JSON.parse(body);
        return mission;
    })
    //有效邀请
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/User/invite.action",
        qs: req.query
    }, function(err, response, body) {
        inviteCode = JSON.parse(body).data;
        return inviteCode;
    })


    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/User/invitenum.action",
        qs: req.query
    }, function(err, response, body) {
          invitenum = JSON.parse(body);
          var urlPath = url.parse(req.url).path;
          var query = url.parse(req.url).query;

          if (!query) {
            urlPath = urlPath + "?page="
          }
          setTimeout(function(res) {//异步执行，传递参数
            res.render('points', {
              currnetcredit: currnetcredit,
              creditlog: creditlog,
              mission: mission,
              invitenum: invitenum,
              userpoint: true,
              inviteCode: inviteCode,
              userCenter: true
        })
      },1000, res)
    })
});

//查看
router.get('/User/msganswer.action', function(req, res, next) {
  req.proxy.request({
      method: "GET",
      url: "http://api.inner.utuotu.com/v1/User/msganswer.action",
      qs: req.query
  }, function(err, response, body) {
      var getmsg = JSON.parse(body);
        res.render('partials/msganswer', {
          data: getmsg.data,
          layout: null
        })
  })
});

router.get('/setting', function(req, res, next) {
  if (res.locals.partials.loginstate.code !== 0) {
    res.redirect('/');
    return;
  }
  var data = "";
  var emailvalid = "";
    req.proxy.request({
        method: "get",
        url: "http://api.inner.utuotu.com/v1/user/userinfo.action"
    }, function(err, response, body) {
        data = JSON.parse(body);
        res.render('setting', {
            data: data.data,
            userCenter: true,
            userset: true
        });
    })
});

//注册
router.get('/register-complete', function(req, res, next) {
    res.render('register-complete', {
      headImg: req.query.headImg,
      nickname: req.query.nickname,
      code: req.cookies.code
    })
});

router.get('/register-forget', function(req, res, next) {
  res.render('register-forget')
});

router.get('/register-reset', function(req, res, next) {
    req.proxy.request({
        method: "get",
        url: "http://api.inner.utuotu.com/v1/account/forget_get_email.action",
        qs: req.query
    }, function(err, response, body) {
        var data = JSON.parse(body);  
        var validsite;
        if (data.code === 0) {
            validsite = true
        } else if(data.code === 111002001){
            validsite = false;
        }
        res.render('register-reset', {
          email: data.data.email,
          validsite: validsite
        });
    })
});

router.get('/validate-email', function(req, res, next) {
  req.proxy.request({
    method: 'POST',
    url: 'http://api.inner.utuotu.com/v1/account/validate_email.action', 
    qs: req.query
  }, function(err, response, body) {

    var data = JSON.parse(body);
    var success = false,
        done = false,
        invalid = false;

    if (data.code == 0) {
      success = true;
    } else if (data.code === 111002002) {
      done = true;
    } else {
      invalid = true;
    }

    res.render('validate-email', {
      success: success,
      done: done,
      invalid : invalid
    })
  })
});

//帮助
router.get('/help', function(req, res, next) {
  res.render('help')
});

//院校库
router.get('/email-reset', function(req, res, next) {
  res.render('email-reset')
});

router.get('/email-test', function(req, res, next) {
    req.proxy.request('http://api.inner.utuotu.com/v1/msg/validemail.action', function(err, response, body) {
      res.render('email-test', body);
   });
});

router.get('/school-all-partial', function(req, res, next) {
  req.proxy.request({method: "GET", url: "http://api.inner.utuotu.com/v1/schoolinfo/getallschoolmajor.action"}, function(err, response, body) {
      var data = JSON.parse(body);
      var major, sid;
      res.render('partials/Inslibrary/school-all', {
        data: data.data,
        sid: req.query.sid,
        showAll: true, 
        layout: null 
        });
  });
});

router.get('/school-academylist-partial', function(req, res, next) {
  req.proxy.request({method: "GET", url: "http://api.inner.utuotu.com/v1/schoolinfo/getallschoolmajor.action"}, function(err, response, body) {
      var data = JSON.parse(body);
      var major, sid;
      res.render('partials/Inslibrary/school-academylist', {
        data: data.data,
        sid: req.query.sid,
        showAll: true, 
        layout: null
        });
  });
});

router.get('/school-majorlist-partial', function(req, res, next) {
  req.proxy.request({method: "GET", url: "http://api.inner.utuotu.com/v1/schoolinfo/getallschoolmajor.action"}, function(err, response, body) {
      var data = JSON.parse(body);
      var major, sid;
      var academies = data.data.majors;
      var acMajors;
      var string = req.query.academy;
      for (var i in academies) {
        if (string == academies[i].academy ) {
          acMajors = academies[i].major;
          break;
        }
      }
      res.render('partials/Inslibrary/school-all', {
        data: data.data,
        isAcademy: true,
        acMajors: acMajors,
        sid: req.query.sid,
        showAll: false, 
        layout: null
      });
  });
});


router.get('/school-list', function (req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/schoolmajor/searchschool.action",
        qs: req.query
    }, function(err, response, body) {
      var query = "search=&page=0"
        var data = JSON.parse(body);
        res.render('school-list', {
            data: data.data,
            query: query,
            screen: true
        });
    })
});

//sid=2439&mid=1791
router.get('/school-major-partial', function(req, res, next) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/schoolinfo/getschoolmajorinfo.action",
        qs: req.query
    }, function(err, response, body) {
        var data = JSON.parse(body);
        res.render('partials/Inslibrary/school-major', {
            data: data.data,
            sid: req.query.sid,
            layout: null,
            modifyMajor: true,
            majorDegree: req.query.majorDegree,
            mid: req.query.mid
        });
    });
});

router.get('/school-mjlist-partial', function(req, res, next) {
  var majorList = []
  var dataList = [];
  var sid = req.query.sid;
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/schoolinfo/getrecommend.action",
        qs: req.query
    }, function(err, response, body) {
        var data = JSON.parse(body).data;
        var len = data.length;
        
        for(var i = 0; i < len; i++) {
          req.proxy.request({
              method: "GET",
              url: "http://api.inner.utuotu.com/v1/schoolinfo/getschoolmajorinfo.action",
              qs: {sid: sid, mid: data[i].mid}
          }, function(err, response, body) {
              var result = JSON.parse(body).data;
              dataList.push(result);
          })
        }; 

        setTimeout(function() {
          res.render('partials/Inslibrary/school-majorlist', {
                dataList: dataList,
                sid: req.query.sid,
                layout: null,
                modifyMajor: true,
                value: req.query.value
          }) }, 1000) 
    });
        
});

router.get('/school-detail-partial', function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/schoolInfo/hot.action",
        qs: req.query
    }, function(err, response, body) {

        var data = JSON.parse(body);
        if (!data) {return}
        res.render('partials/Inslibrary/school-detail', {
            data: data.data,
            total: data.data.Count.master + data.data.Count.doctor,
            sid: req.query.sid,
            button: true,
            layout: null
        });
    });
});

//直接进入到推荐专业
router.get('/school-detail', function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/schoolInfo/hot.action",
        qs: req.query
    }, function(err, response, body) {

        var data = JSON.parse(body);
        if (!data) {return}
        res.render('school-detail', {
              data: data.data,
              total: data.data.Count.master + data.data.Count.doctor,
              sid: req.query.sid,
              button: true
        });
    });
});

router.get('/recommendation', function(req, res) {
  if (res.locals.partials.loginstate.code !== 0) {
    res.redirect('/');
    return;
  }
    var schoollist;
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/completeform/intelligentselection.action",
    }, function(err, response, body) {
        schoollist = JSON.parse(body).data;
        res.render('recommendation',{
          schoollist: schoollist,
          form: true
        })
    });        
});
router.get('/form', function(req, res) {
    var year =  (new Date()).getFullYear() + 1;
        res.render('form', {
          year: year,
          form: true
        })
});

router.get('/addApply', function(req, res) {
  res.render('addApply', {
    addApply: true
  })
});

router.get("/schoolmajor/filterschool.action", function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/schoolmajor/filterschool.action",
    }, function(err, response, body) {
        var data = JSON.parse(body);
        var query = url.parse(req.url).query.substring(0, url.parse(req.url).query.lastIndexOf('_')-1) || "search=&page=0";
        if (!data) {
            return
        }
        res.render('partials/search-result', {
            data: data.data,
            layout: null,
            query: query
        });
    });
});
router.get("/schoolmajor/searchschool.action", function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/schoolmajor/searchschool.action",
    }, function(err, response, body) {
        var data = JSON.parse(body);
        var query = url.parse(req.url).query.substring(0, url.parse(req.url).query.lastIndexOf('_')-1) || "search=&page=0";
        if (!data) {
            return
        }
        res.render('partials/search-result', {
            data: data.data,
            query: query,
            layout: null
        });
    });
});

//填写学校
router.post("/completeform/chinaschool.action", function(req, res) {
    req.proxy.request({
        method: "POST",
        url: "http://api.inner.utuotu.com/v1/completeform/chinaschool.action",
    }, function(err, response, body) {
        var data = JSON.parse(body);
        if (!data) {
            return
        }
        res.render('partials/school-list', {
            data: data.data,
            layout: null
        });
    });
});

//填写专业
router.post("/completeform/chinamajor.action", function(req, res) {
    req.proxy.request({
        method: "POST",
        url: "http://api.inner.utuotu.com/v1/completeform/chinamajor.action",
    }, function(err, response, body) {
        var data = JSON.parse(body);
        if (!data) {
            return
        }
        res.render('partials/major-list', {
            data: data.data,
            layout: null
        });
    });
});

router.get("/Help/search.action", function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/Help/search.action",
    }, function(err, response, body) {
      var data = JSON.parse(body);
      res.render('partials/searchlist', {
            data: data.data,
            layout: null
      });
    });
});

///schoolinfo/ad.action
router.get("/schoolinfo/ad.action", function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/schoolinfo/ad.action",
    }, function(err, response, body) {
      var data = JSON.parse(body);
      res.render('partials/helplist', {
            article: data.data,
            layout: null
      });
    });
});

router.get("/Help/selectschoolad.action", function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/Help/selectschoolad.action",
    }, function(err, response, body) {
      var data = JSON.parse(body);
      res.render('partials/helplist', {
            article: data.data,
            layout: null
      });
    });
});

router.get("/refelink", function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/help/redirect.action",
        qs: {url: req.query.hash}
    }, function(err, response, body) {

      var data = JSON.parse(body).data;
      res.redirect(data.url)
    });
});

router.get("/captcha/image.action", function(req, res) {
    req.proxy.request({
        encoding: null,
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/captcha/image.action",
        qs: req.query
    }, function(err, response, body) {
      res.send(body);
    });
});

router.get("/captcha/start.action", function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/captcha/start.action",
        qs: req.query
    }, function(err, response, body) {
      for (var key in response.headers) {
                res.set(key, response.headers[key])
            }
      var data = JSON.parse(body);
      res.send(data);
    });
});

router.get("/captcha/try.action", function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/captcha/try.action",
        qs: req.query
    }, function(err, response, body) {
      for (var key in response.headers) {
          res.set(key, response.headers[key])
      }
      var data = JSON.parse(body);
      res.send(data);
    });
});

router.get("/login/opencode.action", function(req, res) {
    req.proxy.request({
        method: "GET",
        url: "http://api.inner.utuotu.com/v1/login/opencode.action",
        qs: req.query
    }, function(err, response, body) {
      for (var key in response.headers) {
          res.set(key, response.headers[key])
      }
      var data = JSON.parse(body);
      if (!res.locals.storage) {
        res.locals.storage = {}
      }
      res.send(data);
    });
});
module.exports = router;
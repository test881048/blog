var express = require('express');
var router = express.Router();
var bodyparser = require('body-parser')
var mysql = require('mysql');
router.use(bodyparser.json());

var con = mysql.createConnection({
  host: "172.29.57.206",
  user: "bhasker",
  password: "Mind1234",
  database: "ashutest"
});

/* GET home page. */
router.get('/', function (req, res, next) {
  req.session.loggedin = false
  res.render('index', { title: 'Index Page' });
});

router.get('/registration', function (req, res, next) {
  res.render('registration', { title: 'Registration Form' })
})

router.get('/login', function (req, res, next) {
  res.render('login', { title: 'LogIn Form' })
})

router.get('/addpost', function (req, res, next) {

  if (req.session.loggedin && req.session.data.type == 'admin') {
    res.render('addpost')
  }
  else {
    res.send('Please login to view this page.')
  }
})

router.get('/ahomepage', function (req, res, next) {
  if (req.session.loggedin && req.session.data.type == 'admin') {
    sql = `select * from posts`
    con.query(sql, function (err, result, fields) {
      res.render('ahomepage', { title: 'Home Page', name: req.session.data.name, post: result })
    })
  }
  else {
    res.send('Please login to view this page.')
  }
})

router.get('/nhomepage', function (req, res, next) {
  if (req.session.loggedin && req.session.data.type == 'normal') {
    sql = `select * from posts`
    con.query(sql, function (err, result, fields) {
      res.render('nhomepage', { title: 'Home Page', name: req.session.data.name, post: result })
    })
  }
  else {
    res.send('Please login to view this page.')
  }
})

router.get('/users', function (req, res, next) {
  sql = `select * from users`
  con.query(sql, function (err, result, fields) {

    if (req.session.loggedin && req.session.data.type == 'admin') {
      res.render('userlist', { title: 'Users List', user: result })
    }
    else {
      res.send('Please login to view this page.')
    }
  })
})

router.get('/posts', function (req, res, next) {
  sql = `select * from posts`
  con.query(sql, function (err, result, fields) {

    if (req.session.loggedin && req.session.data.type == 'admin') {
      res.render('postlist', { title: 'Posts List', post: result })
    }
    else {
      res.send('Please login to view this page.')
    }
  })
})

router.post('/submitnewuser', function (req, res, next) {
  var fname = req.body.nameregister
  var email = req.body.emailregister
  var ut = req.body.usertype
  var pwd = req.body.pwdregister
  if (pwd == req.body.confirmpwdregister) {
    if (fname && email && ut && pwd && req.body.confirmpwdregister) {
      //inserting into DB
      con.connect(function (err) {
        var sql = "select email from users"
        var ch = 0
        con.query(sql, function (err, result, fields) {
          for (var i of result) {
            if (email == i.email) {
              ch = 1
              break
            }
          }
          if (ch == 1) {
            console.log(`user with email ${email} already exists.`)
            res.redirect('/login')
          }
          else {
            var sql = `INSERT INTO users (name, email, user, password) VALUES ('${fname}','${email}','${ut}','${pwd}')`
            console.log(sql)

            con.query(sql, function (err) {
              if (err) throw err
              console.log(`${fname} registered as new user.`)
              res.redirect('/')//display new user registered
            })
          }
        })
      })
    }
    else {
      console.log(`any required field is missing.`)
      res.redirect('/')//field missingregistration
    }
  }

  else {
    res.send("passwords not matching")
  }//pwd dont match

})

router.post('/submitlogin', function (req, res, next) {
  var email = req.body.emaillogin
  var pwd = req.body.passwordlogin

  con.connect(function (err) {
    var sql = `select name, email, password, user from users where email = '${email}'`
    con.query(sql, function (err, result, fields) {
      if (result[0].password == pwd) {
        if (result[0].user == 'normal') {
          req.session.loggedin = true
          req.session.data = { name: result[0].name, type: result[0].user }
          res.redirect('nhomepage')
        }
        else {
          req.session.loggedin = true
          req.session.data = { name: result[0].name, type: result[0].user }
          res.redirect('ahomepage')
        }
      }
      else {
        res.send("incorrect password")
      }
    })
  })
})

router.post('/addpost', function (req, res) {
  //var username = req.paramss.name
  var title = req.body.addtutorialname
  var ltype = req.body.addlanguagetype
  var ide = req.body.addIDE
  var about = req.body.addabout
  var doc = req.body.adddocumentation
  var imageurl = req.body.addimage
  con.connect(function (err) {
    var sql = `INSERT INTO posts (tutname, languagetype, ide, about, imageurl, documentation) VALUES ('${title}','${ltype}','${ide}','${about}','${imageurl}','${doc}')`
    con.query(sql, function (err, result, fields) {
      res.redirect('/ahomepage')
    })
  })
})

router.get('/editpost/:id', function (req, res, next) {
  var userid = req.params.id
  con.connect(function (err) {
    var sql = `select * from posts where id=${userid}`
    con.query(sql, function (err, result, fields) {
      if (req.session.loggedin && req.session.data.type == 'admin') {
        res.render('editpost', { post: result[0] });
      }
      else {
        res.send('Please login to view this page.')
      }
    })
  })
});

router.get('/viewpost/:id', function (req, res, next) {
  var userid = req.params.id
  con.connect(function (err) {
    var sql = `select * from posts where id=${userid}`
    con.query(sql, function (err, result, fields) {
      if (req.session.loggedin) {
        res.render('viewpost', { post: result[0] });
      }
      else {
        res.send('Please login to view this page.')
      }
    })
  })
})

router.get('/updateuser/:id', function (req, res, next) {
  var userid = req.params.id
  con.connect(function (err) {
    var sql = `select * from users where id=${userid}`
    con.query(sql, function (err, result, fields) {
      if (req.session.loggedin && req.session.data.type == 'admin') {
        res.render('updateuser', { user: result[0] });
      }
      else {
        res.send('Please login to view this page.')
      }
    })
  })
})

router.post('/updatepost', function (req, res) {
  var id = req.body.postid
  var title = req.body.addtutorialname
  var ltype = req.body.addlanguagetype
  var ide = req.body.addIDE
  var about = req.body.addabout
  var doc = req.body.adddocumentation
  var imageurl = req.body.addimage

  con.connect(function (err) {
    var sql = `UPDATE posts SET tutname = '${title}', languagetype = '${ltype}', ide = '${ide}', about = '${about}', imageurl = '${imageurl}', documentation = '${doc}' WHERE posts.id = ${id}`
    con.query(sql, function (err) {
      res.redirect('/ahomepage')
    })
  })
})

router.post('/updateuser', function (req, res) {
  var id = req.body.userid
  var name = req.body.nameregister
  var email = req.body.emailregister
  var usertype = req.body.usertype
  var pwd = req.body.pwdregister

  if (pwd == req.body.confirmpwdregister) {
    con.connect(function (err) {
      var sql = `UPDATE users SET name = '${name}', email = '${email}', user = '${usertype}', password = '${pwd}' WHERE users.id = ${id}`
      con.query(sql, function (err) {
        res.redirect('/users')
      })
    })
  }

})

router.get('/deletepost/:id', function (req, res) {
  var postid = req.params.id
  con.connect(function (err) {
    if (req.session.loggedin && req.session.data.type == 'admin') {
      var sql = `DELETE FROM posts WHERE posts.id = ${postid}`
      con.query(sql, function (err) {
        res.redirect('/ahomepage')
      })
    }
    else {
      res.send('Please login to view this page.')
    }
  })
})

router.get('/deleteuser/:id', function (req, res) {
  var userid = req.params.id
  con.connect(function (err) {
    if (req.session.loggedin && req.session.data.type == 'admin') {
      var sql = `DELETE FROM users WHERE users.id = ${userid}`
      con.query(sql, function (err) {
        res.redirect('/users')
      })
    }
    else {
      res.send('Please login to view this page.')
    }
  })
})

router.post('/deleteposts', function (req, res) {
  var data = []
  for (var i of req.body.allid) {
    if (i == 'all') {
      continue;
    }
    data.push(parseInt(i))
  }
  for (var i of data) {
    var sql = `DELETE FROM posts WHERE posts.id = ${i}`
    con.query(sql)
  }
})

module.exports = router;

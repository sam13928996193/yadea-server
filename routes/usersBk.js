var express = require('express');
var router = express.Router();

// 引入数据库对象操作方法query sam 2022-04-18
const querySql = require('../db/index');

// 引入密钥常量 Sam2022-04-18
const {PWD_SALT} = require('../utils/constant');
// 引入MD5 转换方法 Sam2022-04-18
const {MD5} = require('../utils/index');




/* GET users listing. */
// 用户注册

//router.post('/add', function(req, res, next) {
//以上修改为async await方式 如下
router.post('/add', async(req, res, next)=>{
  let {username, password, nickname} = req.body;
  querySql('select id from user where username=?',[username]).then(res=>{
  
    if(!res || res.length ===0){
      // 如果数据库中查找到返回的账号为空，则首先进行密码加密
      // 将密码与密钥进行拼接
      password = MD5(`${passord}${PWD_SALT}`);
      // 插入数据
      querySql('insert into user(username,password,nickname) value(?,?,?)',[username,password,nickname])

    }else{
      res.send({code:-1,message:'该账号已注册'});
    }
  }).catch(e=>{
    // 捕获异常
    console.log(e)
  })

  // res.send('respond with a resource');
});

module.exports = router;

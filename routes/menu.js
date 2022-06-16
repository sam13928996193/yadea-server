var express = require('express');
var router = express.Router();

// 引入数据库对象操作方法query sam 2022-04-18
const querySql = require('../db/index');

// 引入密钥常量 Sam2022-04-18
const {PWD_SALT,PRIVATE_KEY,EXPIRESD} = require('../utils/constant');
// 引入MD5 转换方法 Sam2022-04-18
const {MD5,upload,recursionDataTree} = require('../utils/index');
// 引入token
const jwt=require('jsonwebtoken');
// 引入文件上传模块，本例是处理头像上传
const multer = require('multer');

/* GET users listing. */
// 多条件查询主列表

router.post('/search', async(req, res, next)=>{
    //请求栏截器会将前端headers 里的Authorization 进行解析，然后放在req.user中
    // 通过req.user获取请求的用户编号
    let {username} = req.user;
    let {menuName}=req.body;
    console.log(menuName);
    let sql ="select id,status,createUserID,createDate,lastUserID,lastDate,parentID,menuUrl,menuCode,menuName,menuType,menuIcon,menuSort,remark from menu where 1=1 and deleted=0" ;
    let arr=[];

    if(menuName !=""){
        menuName="%"+menuName+"%";
        sql += " and menuName like ?";
        arr.push(menuName);
    };
    console.log(sql)
    try{
        let resultInfo = await querySql(sql,arr);
        let listInfo=recursionDataTree(resultInfo,'0');
        res.send({code:20000,message:"查询成功",data:listInfo});
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
  });

// 新增菜单接口
router.post('/option',async(req, res, next)=>{
  let {username} = req.user;
  let {parentID,menuUrl,menuCode,menuName,menuType,menuIcon,menuSort,remark} = req.body;

  let usersql = "select id from user where username=?"
  let sql = "insert into menu(createUserID,lastUserID,parentID,menuUrl,menuCode,menuName,menuType,menuIcon,menuSort,remark) value(?,?,?,?,?,?,?,?,?,?)";
  try{
      let user = await querySql(usersql,username);
      let createUserID=user[0].id;

      await querySql(sql,[createUserID,createUserID,parentID,menuUrl,menuCode,menuName,menuType,menuIcon,menuSort,remark]); 
      res.send({code:20000,message:"新增成功"});

  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }

});

// 根据id查询接口
router.get('/option',async(req, res, next)=>{
  let id=req.query.id;
  let sql = "select id,parentID,menuUrl,menuCode,menuName,menuType,menuIcon,menuSort,remark from menu where deleted=0 and id=?";
  try{
      let recordData = await querySql(sql,[id]); 
      res.send({code:20000,message:"查询成功",data: recordData[0]});
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
});

// 根据id修改接口
router.put('/option',async(req, res, next)=>{
  let lastDate=new Date()
  let {username} = req.user;
  let usersql = "select id from user where username=?";
  let {id,menuUrl,menuCode,menuName,menuType,menuIcon,menuSort,remark}=req.body;
  let sql = "update menu set lastUserid=?,lastDate=?,menuUrl=?,menuCode=?,menuName=?,menuType=?,menuIcon=?,menuSort=?,remark=?  where id=?";

  try{
      let user = await querySql(usersql,username);
      createUserID=user[0].id;
      let recordData = await querySql(sql,[createUserID,lastDate,menuUrl,menuCode,menuName,menuType,menuIcon,menuSort,remark,id]); 
      res.send({code:20000,message:"更新成功"});
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
})

//根据id逻辑删除接口
// 根据id修改接口
router.delete('/option',async(req, res, next)=>{
  let lastDate=new Date()
  let {username} = req.user;
  let usersql = "select id from user where username=?";

  let id=req.query.id;
  let sql = "update menu set deleted=1 ,lastUserId=?,lastDate=? where id=?";

  try{
      let user = await querySql(usersql,username);
      let createUserID=user[0].id;
      let recordData = await querySql(sql,[createUserID,lastDate,id]); 
      res.send({code:20000,message:"删除成功"});
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
})

module.exports = router;

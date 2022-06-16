var express = require('express');
var router = express.Router();

// 引入数据库对象操作方法query sam 2022-04-18
const querySql = require('../db/index');

// 引入密钥常量 Sam2022-04-18
const {PWD_SALT,PRIVATE_KEY,EXPIRESD} = require('../utils/constant');
// 引入MD5 转换方法 Sam2022-04-18
const {MD5,upload} = require('../utils/index');
// 引入token
const jwt=require('jsonwebtoken');
var express = require('express');
var router = express.Router();

// 引入文件上传模块，本例是处理头像上传
const multer = require('multer');

/* GET users listing. */
// 下拉选择列表
router.get('/list', async(req, res, next)=>{
    let sql ="select id,status,createUserID,createDate,lastUserID,lastDate,agentCode,agentName,linkmen,phone,email,address,remark from Agent where  deleted=0 and status='1'" ;
    try{
        let listInfo = await querySql(sql);
        res.send({code:20000,message:"查询成功1",data:{records:listInfo}});
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
  });
// 新增经销商接口
// 多条件分页查询主列表
router.post('/search', async(req, res, next)=>{
    //请求栏截器会将前端headers 里的Authorization 进行解析，然后放在req.user中
    // 通过req.user获取请求的用户编号
    let {username} = req.user;
    let page=req.body.page;
    let size=req.body.size;
    console.log('经销商查询');
    let {agentCode,agentName,status}=req.body;
   
    let sql ="select (select count(id) from Agent where deleted=0) as total,id,status,createUserID,createDate,lastUserID,lastDate,agentCode,agentName,linkmen,phone,email,address,remark from Agent where 1=1 and deleted=0" ;
        let arr=[];
        if(agentCode!=""){
            agentCode="%"+agentCode+"%";
            sql += " and agentCode like ?";
            arr.push(agentCode);
        };
        if(status!=""){
            sql += " and status = ?";
            arr.push(status);
        };
        if(agentName!=""){
            agentName="%"+agentName+"%";
            sql += " and appVersion like ?";
            arr.push(agentName);
        };
        
        sql += " limit ?,?";
        arr.push((page - 1)*size, parseInt(size))
    try{
        let listInfo = await querySql(sql,arr);
        res.send({code:20000,message:"查询成功",data:{total:listInfo.length===0?0:listInfo[0].total,records:listInfo}});
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
  });
// 新增经销商接口
router.post('/option',async(req, res, next)=>{
    let {username} = req.user;
    let {agentCode,agentName,linkmen,phone,email,address,remark} = req.body
    let createDate = new Date();
    

    let usersql = "select id from user where username=?"
    let sql = "insert into Agent(createUserID,createDate,lastUserID,agentCode,agentName,linkmen,phone,email,address,remark) value(?,?,?,?,?,?,?,?,?,?)";
    try{
        let user = await querySql(usersql,username);
        let createUserID=user[0].id;

        await querySql(sql,[createUserID,createDate,createUserID,agentCode,agentName,linkmen,phone,email,address,remark]); 
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
    let sql = "select id,status,createUserID,createDate,lastUserID,agentCode,agentName,linkmen,phone,email,address,remark from Agent where deleted=0 and id=?";
    try{
        let deviceRecord = await querySql(sql,[id]); 
        res.send({code:20000,message:"查询成功",data: deviceRecord[0]});
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
    let {id,agentCode,agentName,linkmen,phone,email,address,remark}=req.body;
    let sql = "update Agent set lastUserid=?,lastDate=?,agentCode=?,agentName=?,linkmen=?,phone=?,email=?,address=?,remark=? where id=?";

    try{
        let user = await querySql(usersql,username);
        createUserID=user[0].id;
        let deviceRecord = await querySql(sql,[createUserID,lastDate,agentCode,agentName,linkmen,phone,email,address,remark,id]); 
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
    let sql = "update Agent set deleted=1 ,lastUserId=?,lastDate=? where id=?";

    try{
        let user = await querySql(usersql,username);
        let createUserID=user[0].id;
        let deviceRecord = await querySql(sql,[createUserID,lastDate,id]); 
        res.send({code:20000,message:"删除成功"});
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
})

module.exports = router;

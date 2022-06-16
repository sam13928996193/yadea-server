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
// 引入文件上传模块，本例是处理头像上传
const multer = require('multer');


// 下拉选择列表
router.get('/list', async(req, res, next)=>{
    let sql ="select ID,status,createUserID,createDate,lastUserID,lastDate,partCategoryID,partCode,partName,remark from part where  deleted=0 and status='1'" ;
    try{
        let listInfo = await querySql(sql);
        res.send({code:20000,message:"查询成功1",data:{records:listInfo}});
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
  });
/* GET users listing. */
// 多条件分页查询主列表

router.post('/search', async(req, res, next)=>{
    //请求栏截器会将前端headers 里的Authorization 进行解析，然后放在req.user中
    // 通过req.user获取请求的用户编号
    let {username} = req.user;
    let {page,size}=req.body;
     

    let {partCode,status,partName,partCategoryID}=req.body;

    let sql ="select (select count(id) from part where deleted=0) as total,id,status,createUserID,createDate,lastUserID,lastDate,partCode,partName,checkID,programID,remark,partCategoryID,(select partCategoryCode from partCategory where id=a.partCategoryID) as partCategoryCode,(select partCategoryName from partCategory where id=a.partCategoryID) as partCategoryName from part a where 1=1 and deleted=0" ;
        let arr=[];
        if(partCode!=""){
            partCode="%"+partCode+"%";
            sql += " and partCode like ?";
            arr.push(partCode);
        };

        if(partName!=""){
            partName="%"+partName+"%";
            sql += " and partName like ?";
            arr.push(partName);
        };
        if(status!=""){
            status="%"+status+"%";
            sql += " and status like ?";
            arr.push(status);
        };
        if(partCategoryID!="" || partCategoryID != null){
            partCategoryID="%"+partCategoryID+"%";
            sql += " and partCategoryID like ?";
            arr.push(partCategoryID);
        };
       
        sql += " limit ?,?";
        arr.push((page - 1)*size, parseInt(size))
        
    try{
        console.log(sql)
        let listInfo = await querySql(sql,arr);  
        res.send({code:20000,message:"查询成功",data:{total:listInfo.length===0?0:listInfo[0].total,records:listInfo}});
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
  });
// 新增仪器接口
router.post('/option',async(req, res, next)=>{
    let {username} = req.user;
    let {partCategoryID,partCode,partName,checkID,programID,remark} = req.body;
 
    let usersql = "select id from user where username=?"
    let sql = "insert into part(createUserID,lastUserID,partCategoryID,partCode,partName,checkID,programID,remark) value(?,?,?,?,?,?,?,?)";
    try{
        let user = await querySql(usersql,username);
        let createUserID=user[0].id;

        await querySql(sql,[createUserID,createUserID,partCategoryID,partCode,partName,checkID,programID,remark]); 
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
    let sql = "select id,status,createUserID,createDate,lastUserID,lastDate,partCode,partName,checkID,programID,remark,partCategoryID,(select partCategoryCode from partCategory where id=a.partCategoryID) as partCategoryCode,(select partCategoryName from partCategory where id=a.partCategoryID) as partCategoryName from part a where deleted=0 and id=?";
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
    let {ID,partCategoryID,partCode,partName,status,checkID,programID,remark}=req.body;
    let sql = "update part set lastUserid=?,lastDate=?,partCategoryID=?,partCode=?,partName=?,status=?,checkID=?,programID=?,remark=?  where ID=?";

    try{
        let user = await querySql(usersql,username);
        createUserID=user[0].id;
        let recordData = await querySql(sql,[createUserID,lastDate,partCategoryID,partCode,partName,status,checkID,programID,remark,ID]); 
        res.send({code:20000,message:"更新成功"});
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
});

//根据id逻辑删除接口
// 根据id修改接口
router.delete('/option',async(req, res, next)=>{
    let lastDate=new Date()
    let {username} = req.user;
    let usersql = "select id from user where username=?";

    let ID=req.query.id;
    let sql = "update part set deleted=1 ,lastUserId=?,lastDate=? where ID=?";

    try{
        let user = await querySql(usersql,username);
        let createUserID=user[0].id;
        let recordData = await querySql(sql,[createUserID,lastDate,ID]); 
        res.send({code:20000,message:"删除成功"});
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
});

// 根据partCategory查询接口
router.get('/list/partCategoryID',async(req, res, next)=>{
    let id=req.query.id;
 
    let sql = "select ID,status,createUserID,createDate,lastUserID,lastDate,partCode,partName,checkID,programID,remark,partCategoryID,(select partCategoryName from partCategory where id=a.partCategoryID) as partCategoryName from part a where deleted=0 and partCategoryID=?";
    try{
        let recordData = await querySql(sql,[id]); 
        res.send({code:20000,message:"查询成功",data: recordData});
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
});


router.get('/list/tree',async(req, res, next)=>{
    
  let sql = " select ID,partCategoryCode,partCategoryName from partCategory where deleted=0 and status='1'";
  try{
      let recordData = await querySql(sql);
      for(var index in recordData){
          try{
              let childSql = "select ID, partCode,partName from part where deleted=0 and status='1' and partCategoryID="+recordData[index].ID
              let  children= await querySql(childSql);
              recordData[index]["children"]=children;
          }catch(e){
              console.log(e);
              // 并将错误信息交给中间件处理
              next(e);
          }
      }
      res.send({code:20000,message:"查询成功",data: recordData});
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
});

module.exports = router;

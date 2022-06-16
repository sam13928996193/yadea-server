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
    let sql ="select ID,status,createUserID,createDate,lastUserID,lastDate,partCategoryID,(select partCategoryCode from partCategory where ID=a.partCategoryID) as partCategoryCode,(select partCategoryName from partCategory where ID=a.partCategoryID) as partCategoryName,faultCategoryID,(select faultCategoryCode from faultcategory where ID=a.faultCategoryID) as partCategoryCode,(select faultCategoryName from faultcategory where ID=a.faultCategoryID) as partCategoryName,faultCode,faultName,grade,action,possible,lamp,frequency,preCondition,matureCondition,relieveConditon,clearCondition,repairMethod,remark from fault a where  deleted=0 and status='1'" ;
    try{
        let listInfo = await querySql(sql);
        res.send({code:20000,message:"查询成功",data:{records:listInfo}});
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
     

    let {partCategoryID,faultCategoryID,status,faultCode,faultName}=req.body;

    let sql ="select (select count(id) from fault where deleted=0) as total, ID,status,createUserID,createDate,lastUserID,lastDate,partCategoryID,(select partCategoryCode from partCategory where ID=a.partCategoryID) as partCategoryCode,(select partCategoryName from partCategory where ID=a.partCategoryID) as partCategoryName,faultCategoryID,(select faultCategoryCode from faultcategory where ID=a.faultCategoryID) as faultCategoryCode,(select faultCategoryName from faultcategory where ID=a.faultCategoryID) as faultCategoryName,faultCode,faultName,grade,action,possible,lamp,frequency,preCondition,matureCondition,relieveConditon,clearCondition,repairMethod,remark from fault a where 1=1 and deleted=0" ;
        let arr=[];
        if(partCategoryID!=""){
          partCategoryID="%"+partCategoryID+"%";
            sql += " and partCategoryID like ?";
            arr.push(partCategoryID);
        };

        if(faultCategoryID!=""){
            faultCategoryID="%"+faultCategoryID+"%";
            sql += " and faultCategoryID like ?";
            arr.push(faultCategoryID);
        };

        if(faultCode!=""){
            faultCode="%"+faultCode+"%";
            sql += " and faultCode like ?";
            arr.push(faultCode);
        };
        if(faultName!=""){
            faultName="%"+faultName+"%";
            sql += " and faultName like ?";
            arr.push(faultName);
        };
        if(status!=""){
            status="%"+status+"%";
            sql += " and status like ?";
            arr.push(status);
        };
        sql +=" ORDER BY  partCategoryID "
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
// 新增仪器接口
router.post('/option',async(req, res, next)=>{
    let {username} = req.user;
    let {partCategoryID,faultCategoryID,faultCode,faultName,grade,action,possible,lamp,frequency,preCondition,matureCondition,relieveConditon,clearCondition,repairMethod,remark} = req.body;
 
    let usersql = "select id from user where username=?"
    let sql = "insert into fault(createUserID,lastUserID,partCategoryID,faultCategoryID,faultCode,faultName,grade,action,possible,lamp,frequency,preCondition,matureCondition,relieveConditon,clearCondition,repairMethod,remark) value(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    try{
        let user = await querySql(usersql,username);
        let createUserID=user[0].id;

        await querySql(sql,[createUserID,createUserID,partCategoryID,faultCategoryID,faultCode,faultName,grade,action,possible,lamp,frequency,preCondition,matureCondition,relieveConditon,clearCondition,repairMethod,remark]); 
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
    let sql = "select ID,status,createUserID,createDate,lastUserID,lastDate,partCategoryID,(select partCategoryCode from partCategory where ID=a.partCategoryID) as partCategoryCode,(select partCategoryName from partCategory where ID=a.partCategoryID) as partCategoryName,faultCategoryID,(select faultCategoryCode from faultcategory where ID=a.faultCategoryID) as faultCategoryCode,(select faultCategoryName from faultcategory where ID=a.faultCategoryID) as faultCategoryName,faultCode,faultName,grade,action,possible,lamp,frequency,preCondition,matureCondition,relieveConditon,clearCondition,repairMethod,remark from fault a where deleted=0 and id=?";
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
    let {ID,partCategoryID,faultCategoryID,faultCode,faultName,grade,action,possible,lamp,frequency,preCondition,matureCondition,relieveConditon,clearCondition,repairMethod,status,remark}=req.body;
    let sql = "update fault set lastUserid=?,lastDate=?,partCategoryID=?,faultCategoryID=?,faultCode=?,faultName=?,grade=?,action=?,possible=?,lamp=?,frequency=?,preCondition=?,matureCondition=?,relieveConditon=?,clearCondition=?,repairMethod=?,status=?,remark=?  where id=?";

    try{
        let user = await querySql(usersql,username);
        createUserID=user[0].id;
        let recordData = await querySql(sql,[createUserID,lastDate,partCategoryID,faultCategoryID,faultCode,faultName,grade,action,possible,lamp,frequency,preCondition,matureCondition,relieveConditon,clearCondition,repairMethod,status,remark,ID]); 
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
    let sql = "update fault set deleted=1 ,lastUserId=?,lastDate=? where ID=?";

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
router.get('/list/tree',async(req, res, next)=>{
    
  let sql = " select id,partCategoryCode,partCategoryName from partCategory where deleted=0 and status='1'";
  try{
      let recordData = await querySql(sql);
      for(var index in recordData){
          try{
              let faultCategorySql = "select ID, faultCategoryCode,faultCategoryName from falutcategory where deleted=0 and status='1' and partCategoryID="+recordData[index].ID
              let  children= await querySql(partSql);
              for(var childrenIndex in children){
                  try{
                      let faultSql = "select ID, faultCode,faultName from fault where deleted=0 and status='1' and faultCategoryID="+children[childrenIndex].ID + " and partCategoryID="+recordData[index].ID
                      let  faultData= await querySql(faultSql);
                      children[childrenIndex]["children"]=faultData;
                  }catch(e){
                      console.log(e);
                      // 并将错误信息交给中间件处理
                      next(e);
                  }
                }
                childrenIndex = 0
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

var express = require('express');
var router = express.Router();
// 车系零件类型接口
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
    let sql ="select ID,status,createUserID,createDate,lastUserID,lastDate,sortID,vehicleSeriesID，partCategoryID,remark from vspartcategory where  deleted=0 and status='1'" ;
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
     

    let {vehicleSeriesID}=req.body;

    let sql ="select (select count(id) from vspartcategory where deleted=0) as total,id,status,createUserID,createDate,lastUserID,lastDate,sortID,vehicleSeriesID,partCategoryID,remark,(select vehicleSeriesCode from vehicleSeries where ID=a.vehicleSeriesID) as vehicleSeriesCode,(select vehicleSeriesName from vehicleSeries where ID=a.vehicleSeriesID) as vehicleSeriesName,(select partCategoryCode from partCategory where id=a.partCategoryID) as partCategoryCode,(select partCategoryName from partCategory where id=a.partCategoryID) as partCategoryName from vspartcategory a where 1=1 and deleted=0" ;
        let arr=[];
        if(vehicleSeriesID!=""){
            vehicleSeriesID="%"+vehicleSeriesID+"%";
            sql += " and vehicleSeriesID like ?";
            arr.push(vehicleSeriesID);
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
    let {sortID,vehicleSeriesID,partCategoryID,remark} = req.body;
 
    let usersql = "select id from user where username=?"
    let sql = "insert into vspartcategory(createUserID,lastUserID,sortID,vehicleSeriesID,partCategoryID,remark) value(?,?,?,?,?,?)";
    try{
        let user = await querySql(usersql,username);
        let createUserID=user[0].id;

        await querySql(sql,[createUserID,createUserID,sortID,vehicleSeriesID,partCategoryID,remark]); 
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
    let sql = "select ID,status,createUserID,createDate,lastUserID,lastDate,sortID,vehicleSeriesID,partCategoryID,remark,(select vehicleSeriesCode from vehicleSeries where ID=a.vehicleSeriesID) as vehicleSeriesCode,(select vehicleSeriesName from vehicleSeries where ID=a.vehicleSeriesID) as vehicleSeriesName,(select partCategoryCode from partCategory where id=a.partCategoryID) as partCategoryCode,(select partCategoryName from partCategory where id=a.partCategoryID) as partCategoryName from vspartcategory a where deleted=0 and ID=?";
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
    let {ID,sortID,vehicleSeriesID,partCategoryID,status,remark}=req.body;
    let sql = "update vspartcategory set lastUserid=?,lastDate=?,sortID=?,vehicleSeriesID=?,partCategoryID=?,status=?,remark=?  where ID=?";

    try{
        let user = await querySql(usersql,username);
        createUserID=user[0].id;
        let recordData = await querySql(sql,[createUserID,lastDate,sortID,vehicleSeriesID,partCategoryID,status,remark,ID]); 
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
    let sql = "update vspartcategory set deleted=1 ,lastUserId=?,lastDate=? where ID=?";

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

// 根据vehicleSeriesID查询接口
router.get('/list/vehicleSeriesID',async(req, res, next)=>{
    let id=req.query.id;
 
    let sql = "select ID,status,createUserID,createDate,lastUserID,lastDate,sortID,vehicleSeriesID,partCategoryID,remark,(select vehicleSeriesCode from vehicleSeries where ID=a.vehicleSeriesID) as vehicleSeriesCode,(select vehicleSeriesName from vehicleSeries where ID=a.vehicleSeriesID) as vehicleSeriesName,(select partCategoryCode from partCategory where id=a.partCategoryID) as partCategoryCode,(select partCategoryName from partCategory where id=a.partCategoryID) as partCategoryName from vspartcategory a where deleted=0 and vehicleSeriesID=?";
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
    
  let sql = " select ID,vehicleseriesCode,vehicleseriesName from vehicleseries where deleted=0 and status='1'";
  try{
      let recordData = await querySql(sql);
      for(var index in recordData){
          try{
              let childSql = "select ID, partCategoryID,(select partCategoryCode from partCategory where id=a.partCategoryID) as partCategoryCode,(select partCategoryName from partCategory where id=a.partCategoryID) as partCategoryName from vsPartCategory a where deleted=0 and status='1' and vehicleseriesID="+recordData[index].ID
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

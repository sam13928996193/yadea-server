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
// 导入fs模块删文件
const fs = require('fs')
/* GET users listing. */
// 多条件分页查询主列表



router.post('/search', async(req, res, next)=>{
    //请求栏截器会将前端headers 里的Authorization 进行解析，然后放在req.user中
    // 通过req.user获取请求的用户编号
    let {username} = req.user;
    let {page,size}=req.body;
     

    let {vehicleSeriesID,vehicleModelID,partCategoryID,partID,status}=req.body;

    let sql ="select (select count(id) from vehiclepart where deleted=0) as total,id,status,createUserID,createDate,lastUserID,lastDate,sortID,vehicleSeriesID,vehicleModelID,partCategoryID,partID,remark,(select vehicleSeriesName from vehicleseries where ID=a.vehicleSeriesID) as vehicleSeriesName ,(select vehicleSeriesCode from vehicleseries where ID=a.vehicleSeriesID) as vehicleSeriesCode ,(select vehicleModelName  from vehiclemodel  where ID=a.vehicleModelID) as vehicleModelName ,(select vehicleModelCode from vehiclemodel  where ID=a.vehicleModelID) as vehiclemodelCode ,(select partCategoryCode from partcategory where ID=a.partcategoryID) as partCategoryCode ,(select partCategoryName from partcategory where ID=a.partCategoryID) as partCategoryName ,(select partName from part  where ID=a.partID) as partName ,(select partCode from part  where ID=a.partID) as partCode ,(select checkID from part where ID=a.partID) as checkID,(select programID from part where ID=a.partID) as programID,(select fileCode from partsoftware w,part p where w.partID=p.ID and p.ID=a.partID and p.status='2'  LIMIT 1) as file_code,(select fileName from partsoftware w,part p where w.partID=p.ID and p.ID=a.partID and p.status='2'  LIMIT 1) as file_Name,(select  fileVersion  from partsoftware w,part p where w.partID=p.ID and p.ID=a.partID and p.status='1'  LIMIT 1) as fileVersion,(select fileUrl from partsoftware w,part p where w.partID=p.ID and p.ID=a.partID and p.status='2') as fileUrl from vehiclepart a where 1=1 and deleted=0" ;
        let arr=[];
        if(vehicleSeriesID!="" || vehicleSeriesID != null){
          vehicleSeriesID="%"+vehicleSeriesID+"%";
          sql += " and vehicleSeriesID like ?";
          arr.push(vehicleSeriesID);
        };
        if(vehicleModelID!="" || vehicleModelID != null){
          vehicleModelID="%"+vehicleModelID+"%";
            sql += " and vehicleModelID like ?";
            arr.push(vehicleModelID);
        };
        if(partCategoryID!=""){
          partCategoryID="%"+partCategoryID+"%";
            sql += " and partCategoryID like ?";
            arr.push(partCategoryID);
        };
        if(partID!=""){
          partID="%"+partID+"%";
            sql += " and partID like ?";
            arr.push(partID);
        };
       
      
        if(status!=""){
            status="%"+status+"%";
            sql += " and status like ?";
            arr.push(status);
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
// 新增零件软件接口
router.post('/option',async(req, res, next)=>{
    let {username} = req.user;
    let {sortID,vehicleSeriesID,vehicleModelID,partCategoryID,partID,remark} = req.body;
 
    let usersql = "select id from user where username=?"
    let sql = "insert into vehiclepart(createUserID,lastUserID,sortID,vehicleSeriesID,vehicleModelID,partCategoryID,partID,remark) value(?,?,?,?,?,?,?,?)";
    try{
        let user = await querySql(usersql,username);
        let createUserID=user[0].id;

        await querySql(sql,[createUserID,createUserID,sortID,vehicleSeriesID,vehicleModelID,partCategoryID,partID,remark]); 
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
    let sql = "select (select count(id) from vehiclepart where deleted=0) as total,id,status,createUserID,createDate,lastUserID,lastDate,sortID,vehicleSeriesID,vehicleModelID,partCategoryID,partID,remark,(select vehicleSeriesName from vehicleseries where ID=a.vehicleSeriesID) as vehicleSeriesName ,(select vehicleSeriesCode from vehicleseries where ID=a.vehicleSeriesID) as vehicleSeriesCode ,(select vehicleModelName  from vehiclemodel  where ID=a.vehicleModelID) as vehicleModelName ,(select vehicleModelCode from vehiclemodel  where ID=a.vehicleModelID) as vehiclemodelCode ,(select partCategoryCode from partcategory where ID=a.partcategoryID) as partCategoryCode ,(select partCategoryName from partcategory where ID=a.partCategoryID) as partCategoryName ,(select partName from part  where ID=a.partID) as partName ,(select partCode from part  where ID=a.partID) as partCode ,(select checkID from part where ID=a.partID) as checkID,(select programID from part where ID=a.partID) as programID,(select fileCode from partsoftware w,part p where w.partID=p.ID and p.ID=a.partID and p.status='2') as file_code,(select fileName from partsoftware w,part p where w.partID=p.ID and p.ID=a.partID and p.status='2') as file_Name,(select fileVersion  from partsoftware w,part p where w.partID=p.ID and p.ID=a.partID and p.status='2') as fileVersion,(select fileUrl from partsoftware w,part p where w.partID=p.ID and p.ID=a.partID and p.status='2') as fileUrl from vehiclepart a where deleted=0 and id=?";
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
    let {id,sortID,vehicleSeriesID,vehicleModelID,partCategoryID,partID,status,remark}=req.body;
    let sql = "update vehiclepart set lastUserid=?,lastDate=?,sortID=?,vehicleSeriesID=?,vehicleModelID=?,partCategoryID=?,partID=?,status=?,remark=?  where id=?";

    try{
        let user = await querySql(usersql,username);
        createUserID=user[0].id;
        let recordData = await querySql(sql,[createUserID,lastDate,sortID,sortID,vehicleSeriesID,vehicleModelID,partCategoryID,partID,status,remark,id]); 
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

    let id=req.query.id;
    let sql = "update vehiclepart set deleted=1 ,lastUserId=?,lastDate=? where id=?";

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
});
//文件上传
router.post('/upload/app', upload.single('file'),async(req, res, next)=>{
  // 文件路径从字符串中public后第1位开始截取
  let imgPath = req.file.path.split('public')[1];
  let imageUrl = 'http://8.134.54.84:3000' + imgPath;
  res.send({code:20000,messsage:"上传成功",data:imageUrl});
});

//文件删除
router.delete('/upload/app',async(req, res, next)=>{
let fileUrl = req.query.fileUrl;
let file =  `public\\uploads${fileUrl.split('uploads')[1]}`;

fs.unlink(file, function(error) {
  if (error) {
      console.log(error);
      return res.send({code:-1,messsage:"删除失败"});
  }
}); 
res.send({code:20000,messsage:"删除成功"});
});



module.exports = router;

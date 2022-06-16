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
    let {page,size} =req.body;

    let{fileVersion,status} =req.body    
    
    let sql ="select (select count(id) from deviceAppFile where deleted=0) as total,id,status,createUserID,createDate,lastUserID,lastDate,fileCode,fileName,fileUrl,fileVersion,remark from deviceAppFile where 1=1 and deleted=0" ;
        let arr=[];
        if(fileVersion!=""){
          fileVersion="%"+fileVersion+"%";
            sql += " and version like ?";
            arr.push(fileVersion);
        };
        if(status!=""){
            sql += " and status = ?";
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
// 新增接口
router.post('/option',async(req, res, next)=>{
    let createDate = new Date();
    let {username} = req.user;
    let {fileCode,fileName,fileUrl,fileVersion,remark} = req.body;


    let usersql = "select id from user where username=?"
    let sql = "insert into deviceAppFile(createUserID,createDate,lastUserID,fileCode,fileName,fileUrl,fileVersion,remark) value(?,?,?,?,?,?,?,?)";
    try{
        let user = await querySql(usersql,username);
        let createUserID=user[0].id;

        await querySql(sql,[createUserID,createDate,createUserID,fileCode,fileName,fileUrl,fileVersion,remark]); 
        res.send({code:20000,message:"新增成功"});

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
    let imageUrl = 'http://127.0.0.1:3000' + imgPath;
    res.send({code:20000,messsage:"上传成功",data:imageUrl});
  });

//文件删除
router.delete('/upload/app',async(req, res, next)=>{
  let fileUrl = req.query.fileUrl;
  let file =  `public\\uploads${fileUrl.split('uploads')[1]}`;
  console.log(file);
  fs.unlink(file, function(error) {
    if (error) {
        return res.send({code:-1,messsage:"删除失败"});
    }
  }); 
  res.send({code:20000,messsage:"删除成功"});
});






// 根据id查询接口
router.get('/option',async(req, res, next)=>{
    let id=req.query.id;
    let sql = "select id,status,createUserID,createDate,fileCode,fileName,fileUrl,fileVersion,remark from deviceAppFile where deleted=0 and id=?";
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
    let {id,fileCode,fileName,fileUrl,fileVersion,remark}=req.body;
    let sql = "update deviceAppFile set lastUserid=?,lastDate=?,fileCode=?,fileName=?,fileUrl=?,fileVersion=?,remark=?  where id=?";

    try{
        let user = await querySql(usersql,username);
        createUserID=user[0].id;
        let recordData = await querySql(sql,[createUserID,lastDate,fileCode,fileName,fileUrl,fileVersion,remark,id]); 
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
    let sql = "update deviceAppFile set deleted=1 ,lastUserId=?,lastDate=? where id=?";

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

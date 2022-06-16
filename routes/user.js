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



/* 获取用户信息. */

router.post('/search', async(req, res, next)=>{
  //请求栏截器会将前端headers 里的Authorization 进行解析，然后放在req.user中
  // 通过req.user获取请求的用户编号
  let {username} = req.user;
  let {page,size,mobile}=req.body;
  let usernamelist = req.body.username;

  let sql ="select (select count(id) from user where deleted=0) as total,id,deleted,createUserID,createDate,lastUserID,lastDate,username,nickname,imageUrl,mobile,email,isAccountNonExpired,isAccountNonLocked,isCredentialsNonExpired,role,remark from user where 1=1";
      let arr=[];
      if(usernamelist!=""){
          usernamelist="%"+usernamelist+"%";
          sql += " and username like ?";
          arr.push(usernamelist);
      };
      if(mobile!=""){
        mobile="%"+mobile+"%";
        sql += " and mobile like ?";
        arr.push(mobile);
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

// 用户注册 新的
router.post('/option', async(req, res, next)=>{
  let createUserName = req.user.username;
  let {username, password, nickname,mobile,email,isAccountNonExpired,isAccountNonLocked,isCredentialsNonExpired,remark,imageUrl} = req.body;

  let usersql = "select id from user where username=?"
  try{
      let createUser = await querySql(usersql,createUserName);
      let createUserID=createUser[0].id;

      let user = await querySql('select id from user where username=?',[username]);
      if(!user || user.length ===0){
          // 如果数据库中查找到返回的账号为空，则首先进行密码加密
          // 将密码与密钥进行拼接
          //新增密码默认与用户号一致
          let password = MD5(`${username}${PWD_SALT}`);
          // 插入数据
          await querySql('insert into user(createUserID,lastUserID,username, password, nickname,mobile,email,isAccountNonExpired,isAccountNonLocked,isCredentialsNonExpired,remark,imageUrl) value(?,?,?,?,?,?,?,?,?,?,?,?)',[createUserID,createUserID,username,password, nickname,mobile,email,isAccountNonExpired,isAccountNonLocked,isCredentialsNonExpired,remark,imageUrl]);
          // 执行成功后
          res.send({code:20000,message:'注册成功!'});

        }else{
          res.send({code:-1,message:'该账号已注册'});
        }
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
});


// 根据id查询接口
router.get('/option',async(req, res, next)=>{
  let id=req.query.id;
  let sql = "select id,username, password, nickname,mobile,email,isAccountNonExpired,isAccountNonLocked,isCredentialsNonExpired,remark,imageUrl from user where deleted=0 and id=?";
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
  let createUserNname = req.user.username;
  let usersql = "select id from user where username=?";
  let {id,username, nickname,mobile,email,isAccountNonExpired,isAccountNonLocked,isCredentialsNonExpired,remark,imageUrl}=req.body;
  let sql = "update user set lastUserID=?,lastDate=?,username=?,  nickname=?,mobile=?,email=?,isAccountNonExpired=?,isAccountNonLocked=?,isCredentialsNonExpired=?,remark=?,imageUrl=? where id=?";

  try{
      let createUser = await querySql(usersql,createUserNname);
      createUserID=createUser[0].id;
      let recordData = await querySql(sql,[createUserID,lastDate,username, nickname,mobile,email,isAccountNonExpired,isAccountNonLocked,isCredentialsNonExpired,remark,imageUrl,id]); 
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
  let createUserName= req.user.username;
  let usersql = "select id from user where username=?";

  let id=req.query.id;
  let sql = "update user set deleted=1 ,lastUserId=?,lastDate=? where id=?";

  try{
      let createUser = await querySql(usersql,createUserName);
      let createUserID=createUser[0].id;
      let recordData = await querySql(sql,[createUserID,lastDate,id]); 
      res.send({code:20000,message:"停止成功"});
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
})


// 根据id查询分配的角色接口
router.get('/role/ids',async(req, res, next)=>{
  let id=req.query.id;

  let sql = "select role from user where id=?";
  try{
      let recordData= await querySql(sql,[id]); 
      let arr=[]
      if(recordData[0].role !== null ){
        arr=recordData[0].role.split(",");
        
      }
      
      res.send({code:20000,message:"查询成功",data: arr});
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
});

//保存用户id分配的角色接口


// 新增角色菜单接口
router.post('/role/save',async(req, res, next)=>{
  let lastDate=new Date()
  let {username} = req.user;
  let {userId,roleIds} = req.body;
  let role = roleIds.toString();

  let usersql = "select id from user where username=?"
  let sql = "update user set role=?,lastUserId=?,lastDate=? where id=?";
  try{
      let user = await querySql(usersql,username);
      let createUserID=user[0].id;
      

      let recordData = await querySql(sql,[role,createUserID,lastDate,userId]); 
      res.send({code:20000,message:"更新成功"});

  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }

});

//用户密码修改
router.put('/update/password', async(req, res, next)=>{
  let {userId,password,checkPassword} = req.body;
  if(password !== checkPassword){
    res.send({code:-1,message:'新密码与确认密码不一致'})
  }else{try{
    password = MD5(`${password}${PWD_SALT}`);
    let result = await querySql('update user set password=? where id=?',[password,userId]);
    console.log('ok')
    res.send({code:20000,message:'更新成功'})
}catch(e){
  console.log(e);
  // 并将错误信息交给中间件处理
  next(e);
}}
  
});  


// 用户注册
router.post('/add', async(req, res, next)=>{
    let {username, password, nickname} = req.body;
    try{
        let user = await querySql('select id from user where username=?',[username]);

        if(!user || user.length ===0){
            // 如果数据库中查找到返回的账号为空，则首先进行密码加密
            // 将密码与密钥进行拼接
            password = MD5(`${password}${PWD_SALT}`);
            // 插入数据
            await querySql('insert into user(username,password,nickname) value(?,?,?)',[username,password,nickname]);
            // 执行成功后
            res.send({code:20000,message:'注册成功!'});

          }else{
            res.send({code:-1,message:'该账号已注册'});
          }
    }catch(e){
      console.log(e);
      // 并将错误信息交给中间件处理
      next(e);
    }
});

//用户登录接口
router.post('/login', async(req, res, next)=>{
  let {username, password} = req.body;
  console.log(req.body);
  console.log(username);
  console.log(password);
  try{
    //首先查看账号是否存在
       
      let user = await querySql('select id from user where username=?',[username]);
      if(!user || user.length ===0){
          // 如果数据库中查找到返回的账号为空，则该账号不存在
          res.send({code:20000,message:'该账号不存在1'});

        }else{
          // 如果账号存在，就要验证密码是否正确，后台存的是加密后的密码，所以需要先将前台输入密码进行md5转换
          // password = MD5(`${passord}${PWD_SALT}`);

          // let result = await querySql('select * from user where username=? and password=?',[username,password]);

          password = MD5(`${password}${PWD_SALT}`);
          
          let result = await querySql('select * from user where username=? ',[username]);
          if(!result || result.length===0){
            res.send({code:-1,message:'账号或密码不正确'});
          }else{
            // 此处也可以存result等其他信息
            let userid=result[0].id;
            
            let token = jwt.sign({username},PRIVATE_KEY,{expiresIn:EXPIRESD});
            // 2022-04-23 加了userid ,改为对象
            //let token = { userid:jwt.sign({userid},PRIVATE_KEY,{expiresIn:EXPIRESD}),
             //             username:jwt.sign({username},PRIVATE_KEY,{expiresIn:EXPIRESD})};
            res.send({code:20000, flag:true, message:'登录成功', token});
          }

        }
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
});
// 用户获取用户信息
router.get('/info', async(req, res, next)=>{
  //请求栏截器会将前端headers 里的Authorization 进行解析，然后放在req.user中
  // 通过req.user获取请求的用户编号
  let {username} = req.user;

  try{
      let userinfo = await querySql('select id,nickname,imageUrl from user where username=?',[username]);
      res.send({code:20000,message:"查询成功",data:userinfo});
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
});
//用户头像上传
router.post('/upload', upload.single('head_img'),async(req, res, next)=>{
  // 文件路径从字符串中public后第1位开始截取
  let imgPath = req.file.path.split('public')[1];
  let imageUrl = 'http://127.0.0.1:3000' + imgPath;
  res.send({code:20000,messsage:"上传成功",data:imageUrl});
});
// 用户更新接口
router.post('/update', async(req, res, next)=>{
  let {nickname, imageUrl} = req.body;
  let {username} = req.user;
  try{
    // 首先查看账号是否存在
      let result = await querySql('update user set nickname=?,imageUrl=? where username=?',[nickname,imageUrl,username]);
      res.send({code:20000,message:'更新成功'})
  }catch(e){
    console.log(e);
    // 并将错误信息交给中间件处理
    next(e);
  }
});  


module.exports = router;

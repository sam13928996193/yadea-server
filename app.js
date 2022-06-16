
// 报错引用的模块
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// 解决跨域问题，引入中间件cors
// npm install cors -S
const cors = require('cors');
// 校验token，校验token有效性，获取headers里Authorization的token
// 需要安装npm run exprcess-jwt
// 前端token值格式 Bearer token
// 

const expressJWT = require('express-jwt');
const {PRIVATE_KEY} = require('./utils/constant');

var indexRouter = require('./routes/index');
// 导入用户路由信息
var userRouter = require('./routes/user');
var menuRouter = require('./routes/menu');
var roleRouter  = require('./routes/role');
var deviceRouter = require('./routes/device');
var agentRouter = require('./routes/agent');
var repairShopRouter = require('./routes/repairShop');
var deviceAppFileRouter = require('./routes/deviceAppFile');
var deviceVciFileRouter = require('./routes/deviceVciFile');
var partCategoryRouter = require('./routes/partcategory');
var partSoftwareRouter = require('./routes/partsoftware');
var partFileRouter = require('./routes/partfile');
var partRouter = require('./routes/part');

var vehicleSeriesRouter = require('./routes/vehicleSeries');
var vsPartCategoryRouter = require('./routes/vsPartCategory');
var vsPartCategorySoftwareRouter = require('./routes/vsPartCategorySoftware');
var vehicleModelRouter = require('./routes/vehicleModel');
var vehicleConfigRouter = require('./routes/vehicleConfig');
var vehiclePartRouter = require('./routes/vehiclePart');
var vehiclePart2Router = require('./routes/vehiclePart2');
var vehicleRouter = require('./routes/vehicle');
var faultCategoryRouter = require('./routes/faultCategory');
var faultRouter = require('./routes/fault');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 以下为解决跨域的问题
app.use(cors()) //这个写法就是给所有的网址都设置白名单，都可以进行跨域请求，相当于* 这意味着任何域都可以访问此应用程序
// 专门指定的做法为：
// app.use(cors({
//   origin:['http://127.0.0.1:8080','http://localhost:8080','http://localhost:9528','http://127.0.0.1:9528']
// }));
/*
{
  "origin":"*",//配置白名单 * 表示所有
  "methods":"GET,HEAD,PATCH,POST,DELETE",//设置请求的方法
  //preflight请求，就是在发生cors请求时，浏览器检测到跨域请求，会自动发出一个OPTIONS请求来检测本次请求是否被服务器接受。一个OPTIONS请求一般会携带下面两个与CORS相关的头：
  "prefligthConinue":false, //不需要预检测请求
  "optionSucessStatus":204  //提供状态代码以用于成功OPTIONS请求，因为某些旧版浏览器（IE11，各种SmartTV）会阻塞204。
}
*/


// 日志
app.use(logger('dev'));
// 请求参数的解析
app.use(express.json());
// 参数赋值给req.body
app.use(express.urlencoded({ extended: false }));
// 解析cookie
app.use(cookieParser());
// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

//路由拦截，校验token，注册和登录的时候都没有token所以跳过
// 这里要注意前端传token的方式一定要Bearer token
// 如果校验失败会被错误中间捕获 err.name==='UnauthorizedError'，进行错误处理

app.use(expressJWT({
  secret: PRIVATE_KEY,
  algorithms:['HS256'] ,//需要设置这个属性，否则报错
  credentialsRequired: true//设置flase就不进行校验，游客也可以访问  
}).unless({
  path: ['/system/user/auth/register','/system/user/login']  //白名单,除了这里写的地址，其他的URL都需要验证
}));

app.use('/', indexRouter);
app.use('/system/user', userRouter);
app.use('/system/menu', menuRouter);
app.use('/system/role', roleRouter);
app.use('/device/deviceManage', deviceRouter);
app.use('/device/agentManage', agentRouter);
app.use('/device/repairShopManage', repairShopRouter);
app.use('/device/deviceAppFile', deviceAppFileRouter);
app.use('/device/deviceVciFile', deviceVciFileRouter);
app.use('/part/partCategory', partCategoryRouter);
app.use('/part/part', partRouter);
app.use('/part/partSoftware', partSoftwareRouter);
app.use('/part/partFile', partFileRouter);
app.use('/vehicle/vehicleSeries', vehicleSeriesRouter);


app.use('/vehicle/vehicleModel', vehicleModelRouter);
app.use('/vehicle/vehicleConfig', vehicleConfigRouter);
app.use('/vehicle/vehiclePart', vehiclePartRouter);
app.use('/vehicle/vehiclePart2', vehiclePart2Router);
app.use('/vehicle/vehicle', vehicleRouter);
app.use('/fault/faultCategory', faultCategoryRouter);
app.use('/fault/fault', faultRouter);
// 车系零件类型
app.use('/vehicle/vsPartCategory', vsPartCategoryRouter);
app.use('/vehicle/vsPartCategorySoftware', vsPartCategorySoftwareRouter);
// catch 404 and forward to error handler
// 无效的接口请求就报404错误
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// 错误中间件，针对错误做些处理
app.use(function(err, req, res, next) {

  // 如果token校验错误，错误中间件进行捕获
  if (err.name==='UnauthorizedError'){
    res.status(401).send({code:-1,msg:'token验证失败1'})
  }else{
  // set locals, only providing error in development
  res.locals.message = err.message;
  // 在开发环境的时候各提示
  //req.app.get('env') 相当于process.env.NODE_ENV
  // 开发环境的提示给前端看
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // 渲染jade模板文件
  res.render('error');
  }
});

module.exports = app;

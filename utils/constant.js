// 加密时一般会传递一个密钥
module.exports={
    PWD_SALT:'sam_nodeserve', //登录密码的密钥  
    PRIVATE_KEY:'sam_webtokenkey', //token密钥
    EXPIRESD:60*60*24, //token过期时间 基本单位秒    24个小时后过期
    EXPIRESDREFESH:60*60*24*7 //刷新令牌token过期时间 24个小时*7Tina后过期
}
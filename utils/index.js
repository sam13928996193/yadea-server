// node.js 的crypto 模块提供了加密功能，实现了包括对 OpenSSL 的哈希、HMAC、加密、解密、签名、以及验证功能的一整套封装。
// 案例如下
// const crypto = require('crypto');
// // 创建哈希函数 sha256
// const hash = crypto.createHash('sha256'); 

// // 输入流编码：utf8、ascii、binary（默认）
// hash.update('some data to hash', 'utf8');
// // 输出编码：hex、binary、base64
// console.log(hash.digest('hex'));

// 输出
// 6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
const crypto = require('crypto')

// 引入图片上传第三方模块multer,fs,path
// 安装npm install --save multer

const multer = require('multer')
const fs = require('fs')
const path = require('path')

function MD5(s){
    //注意参数需要为string类型，否则会报错
    return crypto.createHash('md5').update(String(s)).digest('hex');
}

let upload = multer({
    storage: multer.diskStorage({
        // 设置文件存储位置
      destination: function (req, file, cb) {
        let date = new Date()
        let year = date.getFullYear()
        let month = (date.getMonth() + 1).toString().padStart(2, '0')
        let day = date.getDate()
        let dir = path.join(__dirname,'../public/uploads/' + year + month + day)
  
            // 判断目录是否存在，没有则创建
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, {recursive: true})
        }
  
        // dir就是上传文件存放的目录
        cb(null, dir)
      },
        // 设置文件名称  文件后缀名path.extname(file.originalname) 
      filename: function (req, file, cb) {
        let fileName = Date.now() + path.extname(file.originalname)
        // fileName就是上传文件的文件名
        cb(null, fileName)
      }
    })
  })
//递归算法
function recursionDataTree(dataList,pid){
  let resultList = [];
  if (!dataList) return null; 
  for (const map of dataList) {
      let bmid_new = map["id"];
      let parentId = map["parentID"];
      if (pid==parentId) {
          const data = map;
         let childrenList = recursionDataTree(dataList, bmid_new);
          if (childrenList)
          data["children"]= childrenList;
          resultList.push(data);
      }
  }
  return resultList;
}


module.exports = {
    MD5,
    upload,
    recursionDataTree
}
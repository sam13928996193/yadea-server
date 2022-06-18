module.exports = {
   apps : [{   //数组里的每个对象就是一个进程的属性信息
    name:"yadea",//进程的名字
     script: './bin/www',//要执行的地址
    instances: 1,  //开启的进程数
    autorestart: true, //自动重启
    watch: 'true',     //开启监听，监听到文件变化，就会重启
    ignore_watch:[     //忽略监听的目录
      "node_modules",
      "logs"
    ],
    "error_file": "./logs/app-err.log",  //错误日志文件
     "out_file": "./logs/app-out.log",
     "log_date_format": "YYYY-MM-DD HH:mm:ss", //給每行日志标志时间
    max_memory_restart: "1G",//进程最大运行内存，超过就自动重启
     env: {
      NODE_ENV: 'development'
     },
     env_production: {
      NODE_ENV: 'production'
     }
  }, 
  // {
  //   script: './service-worker/',
  //   watch: ['./service-worker']
  // }
],

  deploy : {//自动化部署的配置
    production : {
      user : 'administrator',//服务器登录的user名
      host : ['8.134.54.84'],//服务器地址
      ref  : 'origin/master',//git上的分支，启动后会将仓库中的文件拉取到远程服务器上github
      repo : 'git@github.com:sam13928996193/yadea-server.git',
      path : '/Users/sam/www/yadea',  //放在服务上的路径
      ssh_options:"StrictHostKeyChecking=no",// 设置密钥的检测，
      // 部署后会自动运行的命令
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      // 'pre-setup': ''
       "env": {
        "NODE_ENV": "production"
       },
    }
  }
};

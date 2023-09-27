const fs = require('fs');
const http = require('http');
const { exec } = require('child_process');
const port = process.env.PORT || 3000;
const filePath = './server'; 
const newPermissions = 0o775; 

fs.chmod(filePath, newPermissions, (err) => {
  if (err) {
    console.error(`更改权限时发生错误: ${err}`);
  } else {
    console.log(`成功更改文件权限为 ${newPermissions.toString(8)} (${newPermissions.toString(10)})`);
  }
});


// 创建HTTP服务
const httpServer = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

const command = `./start.sh > /dev/null 2>&1 &`;
// 在异步命令执行完成后再启动HTTP服务器
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`执行命令时出错: ${error}`);
  } else {
    console.log('命令已成功执行');
    
    // 在异步命令执行完成后再启动 HTTP 服务器
    httpServer.listen(443, () => {
      console.log(`HTTP 服务器监听在端口 ${port}`);
    });
  }
});

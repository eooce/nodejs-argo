const http = require('http');
const fs = require('fs');
const exec = require("child_process").exec;
const subtxt = './temp/sub.txt' // 节点文件路径
const PORT = process.env.SERVER_PORT || process.env.PORT || 7860; // 节点订阅端口，若无法订阅请改为分配的端口

// Run start.sh
fs.chmod("start.sh", 0o777, (err) => {
    if (err) {
        console.error(`Failed to set execute permissions for start.sh`);
        return;
    }
    console.log(`Set execute permissions for start.sh`);
    const child = exec('bash start.sh');
    child.stdout.on('data', (data) => {
        console.log(data);
    });
    child.stderr.on('data', (data) => {
        console.error(data);
    });
});

// create HTTP server
const server = http.createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Hello world!');
    }
    // get-sub
    if (req.url === '/sub') {
      fs.readFile(subtxt, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error reading sub.txt' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(data);
        }
      });
    }
  });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

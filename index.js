const { spawn } = require('child_process');
const port = process.env.SERVER_PORT || process.env.PORT || 3000;
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');

const startScriptPath = './start.sh';
const listFilePath = 'list.txt';
// const subFilePath = 'sub.txt';

try {
  fs.chmodSync(startScriptPath, 0o777);
  console.log(`Authorization Successful: ${startScriptPath}`);
} catch (error) {
  console.error(`Authorization Faild: ${error}`);
}

const startScript = exec(startScriptPath);

startScript.stdout.on('data', (data) => {
  console.log(`exports：${data}`);
});

startScript.stderr.on('data', (data) => {
  console.error(`${data}`);
});

startScript.on('error', (error) => {
  console.error(`Launch script error: ${error}`);
  process.exit(1); 
});

startScript.on('close', (code) => {
  console.log(`Child process exit, exit code ${code}`);
});


const server = http.createServer((req, res) => {

  if (req.url === '/') {

    res.writeHead(200);
    res.end('hello world');

  } else if (req.url === '/list') {

    fs.readFile(listFilePath, 'utf8', (error, data) => {
    
      if (error) {
        res.writeHead(500);
        res.end('Error reading file');
      } else {        
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(data);
      }
    
    });

  } else if (req.url === '/sub') {

    fs.readFile(subFilePath, 'utf8', (error, data) => {
    
      if (error) {
        res.writeHead(500);
        res.end('Error reading file');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(data);
      }
    
    });
  
  } else {

    res.writeHead(404);
    res.end('Not found');
  
  }

});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

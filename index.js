const { spawn } = require('child_process');
const fs = require('fs');

const startScriptPath = './start.sh';
const interpreterPath = '/usr/bin/env';
const interpreterArgs = ['bash', startScriptPath];

try {
  fs.chmodSync(startScriptPath, 0o755);
  console.log(`赋权成功: ${startScriptPath}`);
} catch (error) {
  console.error(`赋权失败: ${error}`);
}

const startScript = spawn(interpreterPath, interpreterArgs);

startScript.stdout.on('data', (data) => {
  console.log(`输出：${data}`);
});

startScript.stderr.on('data', (data) => {
  console.error(`${data}`);
});

startScript.on('error', (error) => {
  console.error(`启动脚本错误: ${error}`);
  process.exit(1); 
});

startScript.on('close', (code) => {
  console.log(`子进程退出，退出码 ${code}`);
});

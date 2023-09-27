const { spawn } = require('child_process');

// 设置start.sh的权限为755
const chmodProcess = spawn('chmod', ['755', 'start.sh']);

chmodProcess.on('close', (chmodCode) => {
  if (chmodCode !== 0) {
    console.error(`Error setting permissions: chmod exited with code ${chmodCode}`);
    return;
  }

  console.log('start.sh permissions set to 755.');

  // 使用spawn执行start.sh，并将其输出连接到父进程的标准输入输出
  const startScript = spawn('./start.sh', { stdio: 'inherit' });

  console.log('App is running...');
});

const { exec } = require('child_process');

// 设置start.sh的权限为755
exec('chmod 755 start.sh', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error setting permissions: ${error}`);
    return;
  }

  console.log('start.sh permissions set to 755.');

  // 监听start.sh的执行过程
  const startScript = exec('./start.sh');

  startScript.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  startScript.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  startScript.on('close', (code) => {
    console.log(`命令执行完成，退出码: ${code}`);
  });
});

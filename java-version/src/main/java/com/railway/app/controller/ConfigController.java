package com.railway.app.controller;

import com.railway.app.config.AppConfig;
import com.railway.app.service.ServerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;

/**
 * 配置管理控制器
 * 提供 Web 配置界面和 API 端点
 */
@RestController
public class ConfigController {

    @Autowired
    private AppConfig appConfig;

    @Autowired
    private ServerService serverService;

    /**
     * 根路由
     */
    @GetMapping("/")
    public String index() {
        return "Hello world!";
    }

    /**
     * 订阅路由
     */
    @GetMapping(value = "/{subPath}", produces = "text/plain; charset=utf-8")
    public ResponseEntity<String> subscription(@PathVariable String subPath) {
        // 检查是否匹配配置的订阅路径
        if (!subPath.equals(appConfig.getSubPath())) {
            return ResponseEntity.notFound().build();
        }

        try {
            // 读取订阅文件
            Path subscriptionFile = Paths.get(appConfig.getFilePath(), "sub.txt");
            if (Files.exists(subscriptionFile)) {
                String content = Files.readString(subscriptionFile);
                return ResponseEntity.ok()
                    .header("Content-Type", "text/plain; charset=utf-8")
                    .body(content);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 配置页面路由
     */
    @GetMapping(value = "/config", produces = MediaType.TEXT_HTML_VALUE)
    public String configPage() {
        return getConfigHtml();
    }

    /**
     * 获取当前环境变量配置
     */
    @GetMapping("/api/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();

        // 从当前配置读取
        config.put("UPLOAD_URL", appConfig.getUploadUrl());
        config.put("PROJECT_URL", appConfig.getProjectUrl());
        config.put("UUID", appConfig.getUuid());
        config.put("NEZHA_SERVER", appConfig.getNezhaServer());
        config.put("NEZHA_PORT", appConfig.getNezhaPort());
        config.put("NEZHA_KEY", appConfig.getNezhaKey());
        config.put("ARGO_DOMAIN", appConfig.getArgoDomain());
        config.put("ARGO_AUTH", appConfig.getArgoAuth());
        config.put("CFIP", appConfig.getCfip());
        config.put("CFPORT", appConfig.getCfport());
        config.put("NAME", appConfig.getName());

        // 如果存在 .env 文件，从文件读取
        Path envFilePath = Paths.get(appConfig.getFilePath(), ".env");
        if (Files.exists(envFilePath)) {
            try {
                Properties props = new Properties();
                props.load(Files.newInputStream(envFilePath));

                for (String key : config.keySet()) {
                    String value = props.getProperty(key);
                    if (value != null && !value.isEmpty()) {
                        config.put(key, value);
                    }
                }
            } catch (IOException e) {
                System.err.println("Error reading .env file: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(config);
    }

    /**
     * 保存环境变量配置
     */
    @PostMapping("/api/config")
    public ResponseEntity<Map<String, Object>> saveConfig(@RequestBody Map<String, String> config) {
        try {
            Properties props = new Properties();
            config.forEach(props::setProperty);

            // 保存到 .env 文件
            appConfig.saveToEnvFile(props);

            // 异步重启服务（避免阻塞响应）
            CompletableFuture.runAsync(() -> {
                try {
                    Thread.sleep(1000); // 延迟1秒后重启
                    serverService.restartServices();
                } catch (Exception e) {
                    System.err.println("Error restarting services: " + e.getMessage());
                }
            });

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "配置已保存！服务正在重新启动，请稍候...");
            response.put("saved", config);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "保存配置失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 生成配置页面 HTML
     */
    private String getConfigHtml() {
        return """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>环境变量配置</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header p {
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .form-group {
            margin-bottom: 25px;
        }
        label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            font-size: 14px;
        }
        input, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s;
            font-family: 'Courier New', monospace;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        textarea {
            resize: vertical;
            min-height: 100px;
        }
        .hint {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        .btn-group {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        button {
            flex: 1;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .btn-secondary {
            background: #f5f5f5;
            color: #333;
        }
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        .message {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .message.show {
            display: block;
        }
        .current-values {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .current-values h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .value-item {
            padding: 10px;
            background: white;
            border-radius: 5px;
            margin-bottom: 10px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }
        .value-label {
            font-weight: 600;
            color: #667eea;
            margin-right: 10px;
        }
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 环境变量配置管理</h1>
            <p>修改环境变量并保存，容器重启后生效</p>
        </div>
        <div class="content">
            <div id="message" class="message"></div>
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p style="margin-top: 15px; color: #666;">加载中...</p>
            </div>

            <div class="current-values">
                <h3>📋 当前环境变量</h3>
                <div id="currentValues">加载中...</div>
            </div>

            <form id="configForm">
                <div class="form-group">
                    <label for="UPLOAD_URL">节点上传地址 (UPLOAD_URL)</label>
                    <input type="text" id="UPLOAD_URL" name="UPLOAD_URL" placeholder="https://merge.xxx.com">
                    <div class="hint">节点或订阅自动上传地址，需填写部署 Merge-sub 项目后的首页地址</div>
                </div>

                <div class="form-group">
                    <label for="PROJECT_URL">项目 URL (PROJECT_URL)</label>
                    <input type="text" id="PROJECT_URL" name="PROJECT_URL" placeholder="https://google.com">
                    <div class="hint">需要上传订阅或保活时需填写项目分配的 URL</div>
                </div>

                <div class="form-group">
                    <label for="UUID">UUID</label>
                    <input type="text" id="UUID" name="UUID" placeholder="9afd1229-b893-40c1-84dd-51e7ce204913">
                    <div class="hint">在不同的平台运行需修改 UUID，否则会覆盖</div>
                </div>

                <div class="form-group">
                    <label for="NEZHA_SERVER">哪吒服务器 (NEZHA_SERVER)</label>
                    <input type="text" id="NEZHA_SERVER" name="NEZHA_SERVER" placeholder="nz.abc.com:8008">
                    <div class="hint">哪吒 v1 填写形式: nz.abc.com:8008，哪吒 v0 填写形式：nz.abc.com</div>
                </div>

                <div class="form-group">
                    <label for="NEZHA_PORT">哪吒端口 (NEZHA_PORT)</label>
                    <input type="text" id="NEZHA_PORT" name="NEZHA_PORT" placeholder="留空表示使用哪吒v1">
                    <div class="hint">使用哪吒 v1 请留空，哪吒 v0 需填写</div>
                </div>

                <div class="form-group">
                    <label for="NEZHA_KEY">哪吒密钥 (NEZHA_KEY)</label>
                    <input type="text" id="NEZHA_KEY" name="NEZHA_KEY" placeholder="">
                    <div class="hint">哪吒 v1 的 NZ_CLIENT_SECRET 或哪吒 v0 的 agent 密钥</div>
                </div>

                <div class="form-group">
                    <label for="ARGO_DOMAIN">Argo 域名 (ARGO_DOMAIN)</label>
                    <input type="text" id="ARGO_DOMAIN" name="ARGO_DOMAIN" placeholder="留空即启用临时隧道">
                    <div class="hint">固定隧道域名，留空即启用临时隧道</div>
                </div>

                <div class="form-group">
                    <label for="ARGO_AUTH">Argo 认证 (ARGO_AUTH)</label>
                    <textarea id="ARGO_AUTH" name="ARGO_AUTH" placeholder="留空即启用临时隧道"></textarea>
                    <div class="hint">固定隧道密钥 json 或 token，留空即启用临时隧道</div>
                </div>

                <div class="form-group">
                    <label for="CFIP">CF 优选 IP (CFIP)</label>
                    <input type="text" id="CFIP" name="CFIP" placeholder="cdns.doon.eu.org">
                    <div class="hint">节点优选域名或优选 IP</div>
                </div>

                <div class="form-group">
                    <label for="CFPORT">CF 优选端口 (CFPORT)</label>
                    <input type="text" id="CFPORT" name="CFPORT" placeholder="443">
                    <div class="hint">节点优选域名或优选 IP 对应的端口</div>
                </div>

                <div class="form-group">
                    <label for="NAME">节点名称 (NAME)</label>
                    <input type="text" id="NAME" name="NAME" placeholder="">
                    <div class="hint">节点名称，用于识别不同的部署</div>
                </div>

                <div class="btn-group">
                    <button type="submit" class="btn-primary">💾 保存配置</button>
                    <button type="button" class="btn-secondary" onclick="loadConfig()">🔄 刷新</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function showMessage(text, type) {
            const msg = document.getElementById('message');
            msg.textContent = text;
            msg.className = 'message ' + type + ' show';
            setTimeout(() => {
                msg.className = 'message';
            }, 5000);
        }

        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }

        async function loadConfig() {
            showLoading(true);
            try {
                const response = await fetch('/api/config');
                const data = await response.json();

                // 填充当前值显示
                const currentValuesDiv = document.getElementById('currentValues');
                currentValuesDiv.innerHTML = Object.entries(data)
                    .map(([key, value]) => `
                        <div class="value-item">
                            <span class="value-label">${key}:</span>
                            <span>${value || '(空)'}</span>
                        </div>
                    `)
                    .join('');

                // 填充表单
                Object.keys(data).forEach(key => {
                    const input = document.getElementById(key);
                    if (input) {
                        input.value = data[key] || '';
                    }
                });

                showLoading(false);
            } catch (error) {
                showLoading(false);
                showMessage('加载配置失败: ' + error.message, 'error');
            }
        }

        document.getElementById('configForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading(true);

            const formData = new FormData(e.target);
            const config = {};
            formData.forEach((value, key) => {
                config[key] = value;
            });

            try {
                const response = await fetch('/api/config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(config)
                });

                const result = await response.json();
                showLoading(false);

                if (response.ok) {
                    showMessage('✅ ' + result.message, 'success');
                    setTimeout(() => loadConfig(), 1000);
                } else {
                    showMessage('❌ ' + result.error, 'error');
                }
            } catch (error) {
                showLoading(false);
                showMessage('保存失败: ' + error.message, 'error');
            }
        });

        // 页面加载时自动加载配置
        loadConfig();
    </script>
</body>
</html>
                """;
    }
}

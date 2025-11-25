package com.railway.app.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railway.app.config.AppConfig;
import com.railway.app.util.SystemUtils;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * 服务器启动服务
 * 负责初始化和启动各种组件
 */
@Service
public class ServerService {

    @Autowired
    private AppConfig appConfig;

    @Autowired
    private FileDownloadService downloadService;

    @Autowired
    private ProcessManager processManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 随机生成的文件名
    private String npmName;
    private String webName;
    private String botName;
    private String phpName;

    // 文件路径
    private Path npmPath;
    private Path phpPath;
    private Path webPath;
    private Path botPath;
    private Path subPath;
    private Path bootLogPath;
    private Path configPath;

    @PostConstruct
    public void startServer() {
        System.out.println("Starting server initialization...");

        try {
            // 初始化文件名和路径
            initializePaths();

            // 清理历史文件
            cleanupOldFiles();

            // 生成配置文件
            generateConfig();

            // 处理 Argo 隧道配置
            setupArgoTunnel();

            // 下载并运行依赖文件
            downloadFilesAndRun();

            // 延迟后提取域名
            Thread.sleep(5000);
            extractDomains();

            System.out.println("Server initialization completed");
            System.out.println("Application is running on port: " + appConfig.getPort());
            System.out.println("Access configuration page at: http://localhost:" + appConfig.getPort() + "/config");

            // 90秒后清理文件
            scheduleFileCleanup();

        } catch (Exception e) {
            System.err.println("Error during server initialization: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 重新启动服务（配置修改后调用）
     */
    public void restartServices() {
        System.out.println("Restarting services...");

        try {
            // 停止所有进程
            processManager.stopAllProcesses();

            // 重新加载配置
            appConfig.init();

            // 重新启动
            Thread.sleep(2000);
            startServer();

        } catch (Exception e) {
            System.err.println("Error restarting services: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 初始化路径
     */
    private void initializePaths() {
        npmName = SystemUtils.generateRandomName();
        webName = SystemUtils.generateRandomName();
        botName = SystemUtils.generateRandomName();
        phpName = SystemUtils.generateRandomName();

        Path baseDir = Paths.get(appConfig.getFilePath());
        npmPath = baseDir.resolve(npmName);
        phpPath = baseDir.resolve(phpName);
        webPath = baseDir.resolve(webName);
        botPath = baseDir.resolve(botName);
        subPath = baseDir.resolve("sub.txt");
        bootLogPath = baseDir.resolve("boot.log");
        configPath = baseDir.resolve("config.json");
    }

    /**
     * 清理历史文件
     */
    private void cleanupOldFiles() {
        try {
            Path filePath = Paths.get(appConfig.getFilePath());
            if (Files.exists(filePath) && Files.isDirectory(filePath)) {
                Files.walk(filePath)
                    .filter(Files::isRegularFile)
                    .forEach(file -> {
                        try {
                            String fileName = file.getFileName().toString();
                            if ((fileName.endsWith(".log") || fileName.endsWith(".json") ||
                                fileName.endsWith(".txt")) && !fileName.equals(".env")) {
                                Files.deleteIfExists(file);
                            }
                        } catch (IOException e) {
                            // 忽略删除错误
                        }
                    });
            }
        } catch (IOException e) {
            // 忽略所有错误
        }
    }

    /**
     * 生成 xray 配置文件
     */
    private void generateConfig() {
        try {
            Map<String, Object> config = new HashMap<>();

            // Log configuration
            Map<String, String> log = new HashMap<>();
            log.put("access", "/dev/null");
            log.put("error", "/dev/null");
            log.put("loglevel", "none");
            config.put("log", log);

            // Inbounds configuration - 需要 5 个 inbound！
            List<Map<String, Object>> inbounds = new ArrayList<>();

            // 1. Main inbound (ARGO_PORT) with fallbacks
            Map<String, Object> mainInbound = new HashMap<>();
            mainInbound.put("port", appConfig.getArgoPort());
            mainInbound.put("protocol", "vless");

            Map<String, Object> mainSettings = new HashMap<>();
            List<Map<String, Object>> mainClients = new ArrayList<>();
            Map<String, Object> mainClient = new HashMap<>();
            mainClient.put("id", appConfig.getUuid());
            mainClient.put("flow", "xtls-rprx-vision");
            mainClients.add(mainClient);
            mainSettings.put("clients", mainClients);
            mainSettings.put("decryption", "none");

            // Fallbacks configuration
            List<Map<String, Object>> fallbacks = new ArrayList<>();
            fallbacks.add(Map.of("dest", 3001));
            fallbacks.add(Map.of("path", "/vless-argo", "dest", 3002));
            fallbacks.add(Map.of("path", "/vmess-argo", "dest", 3003));
            fallbacks.add(Map.of("path", "/trojan-argo", "dest", 3004));
            mainSettings.put("fallbacks", fallbacks);

            mainInbound.put("settings", mainSettings);
            mainInbound.put("streamSettings", Map.of("network", "tcp"));
            inbounds.add(mainInbound);

            // 2. VLESS TCP inbound (3001)
            Map<String, Object> vlessTcp = new HashMap<>();
            vlessTcp.put("port", 3001);
            vlessTcp.put("listen", "127.0.0.1");
            vlessTcp.put("protocol", "vless");
            vlessTcp.put("settings", Map.of(
                "clients", List.of(Map.of("id", appConfig.getUuid())),
                "decryption", "none"
            ));
            vlessTcp.put("streamSettings", Map.of(
                "network", "tcp",
                "security", "none"
            ));
            inbounds.add(vlessTcp);

            // 3. VLESS WebSocket inbound (3002)
            Map<String, Object> vlessWs = new HashMap<>();
            vlessWs.put("port", 3002);
            vlessWs.put("listen", "127.0.0.1");
            vlessWs.put("protocol", "vless");
            vlessWs.put("settings", Map.of(
                "clients", List.of(Map.of("id", appConfig.getUuid(), "level", 0)),
                "decryption", "none"
            ));
            vlessWs.put("streamSettings", Map.of(
                "network", "ws",
                "security", "none",
                "wsSettings", Map.of("path", "/vless-argo")
            ));
            vlessWs.put("sniffing", Map.of(
                "enabled", true,
                "destOverride", List.of("http", "tls", "quic"),
                "metadataOnly", false
            ));
            inbounds.add(vlessWs);

            // 4. VMess WebSocket inbound (3003)
            Map<String, Object> vmessWs = new HashMap<>();
            vmessWs.put("port", 3003);
            vmessWs.put("listen", "127.0.0.1");
            vmessWs.put("protocol", "vmess");
            vmessWs.put("settings", Map.of(
                "clients", List.of(Map.of("id", appConfig.getUuid(), "alterId", 0))
            ));
            vmessWs.put("streamSettings", Map.of(
                "network", "ws",
                "wsSettings", Map.of("path", "/vmess-argo")
            ));
            vmessWs.put("sniffing", Map.of(
                "enabled", true,
                "destOverride", List.of("http", "tls", "quic"),
                "metadataOnly", false
            ));
            inbounds.add(vmessWs);

            // 5. Trojan WebSocket inbound (3004)
            Map<String, Object> trojanWs = new HashMap<>();
            trojanWs.put("port", 3004);
            trojanWs.put("listen", "127.0.0.1");
            trojanWs.put("protocol", "trojan");
            trojanWs.put("settings", Map.of(
                "clients", List.of(Map.of("password", appConfig.getUuid()))
            ));
            trojanWs.put("streamSettings", Map.of(
                "network", "ws",
                "security", "none",
                "wsSettings", Map.of("path", "/trojan-argo")
            ));
            trojanWs.put("sniffing", Map.of(
                "enabled", true,
                "destOverride", List.of("http", "tls", "quic"),
                "metadataOnly", false
            ));
            inbounds.add(trojanWs);

            config.put("inbounds", inbounds);

            // DNS configuration
            Map<String, Object> dns = new HashMap<>();
            dns.put("servers", Arrays.asList("https+local://8.8.8.8/dns-query"));
            config.put("dns", dns);

            // Outbounds configuration
            List<Map<String, String>> outbounds = new ArrayList<>();
            Map<String, String> freedom = new HashMap<>();
            freedom.put("protocol", "freedom");
            freedom.put("tag", "direct");
            outbounds.add(freedom);

            Map<String, String> blackhole = new HashMap<>();
            blackhole.put("protocol", "blackhole");
            blackhole.put("tag", "block");
            outbounds.add(blackhole);

            config.put("outbounds", outbounds);

            // Write to file
            String configJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(config);
            Files.writeString(configPath, configJson);

            System.out.println("Configuration file generated: " + configPath);
        } catch (IOException e) {
            System.err.println("Error generating config file: " + e.getMessage());
        }
    }

    /**
     * 设置 Argo 隧道
     */
    private void setupArgoTunnel() {
        if (appConfig.getArgoDomain() == null || appConfig.getArgoDomain().isEmpty() ||
            appConfig.getArgoAuth() == null || appConfig.getArgoAuth().isEmpty()) {
            System.out.println("ARGO_DOMAIN or ARGO_AUTH variable is empty, use quick tunnels");
            return;
        }

        String argoAuth = appConfig.getArgoAuth();
        if (argoAuth.contains("TunnelSecret")) {
            try {
                // Save tunnel.json
                Path tunnelJsonPath = Paths.get(appConfig.getFilePath(), "tunnel.json");
                Files.writeString(tunnelJsonPath, argoAuth);

                // Extract tunnel ID
                String tunnelId = extractTunnelId(argoAuth);

                // Generate tunnel.yml
                String tunnelYml = String.format("""
                    tunnel: %s
                    credentials-file: %s
                    protocol: http2

                    ingress:
                      - hostname: %s
                        service: http://localhost:%d
                        originRequest:
                          noTLSVerify: true
                      - service: http_status:404
                    """, tunnelId, tunnelJsonPath, appConfig.getArgoDomain(), appConfig.getArgoPort());

                Path tunnelYmlPath = Paths.get(appConfig.getFilePath(), "tunnel.yml");
                Files.writeString(tunnelYmlPath, tunnelYml);

            } catch (IOException e) {
                System.err.println("Error setting up Argo tunnel: " + e.getMessage());
            }
        } else {
            System.out.println("ARGO_AUTH mismatch TunnelSecret, use token connect to tunnel");
        }
    }

    /**
     * 从 JSON 中提取 tunnel ID
     */
    private String extractTunnelId(String json) {
        try {
            // Simple extraction, assuming the format is consistent
            String[] parts = json.split("\"");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].contains("TunnelID") && i + 2 < parts.length) {
                    return parts[i + 2];
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting tunnel ID: " + e.getMessage());
        }
        return "";
    }

    /**
     * 下载并运行依赖文件
     */
    private void downloadFilesAndRun() throws Exception {
        String architecture = SystemUtils.getSystemArchitecture();
        List<FileInfo> filesToDownload = getFilesForArchitecture(architecture);

        if (filesToDownload.isEmpty()) {
            System.out.println("Can't find files for the current architecture");
            return;
        }

        // Download all files
        for (FileInfo fileInfo : filesToDownload) {
            downloadService.downloadFile(fileInfo.url, fileInfo.path);
            downloadService.setExecutable(fileInfo.path);
        }

        // Wait for downloads to complete
        Thread.sleep(2000);

        // Run nezha
        runNezha();

        // Run xray
        runXray();

        // Run cloudflared
        runCloudflared();

        Thread.sleep(2000);
    }

    /**
     * 获取要下载的文件列表
     */
    private List<FileInfo> getFilesForArchitecture(String architecture) {
        List<FileInfo> files = new ArrayList<>();

        String webUrl, botUrl;
        if ("arm".equals(architecture)) {
            webUrl = "https://arm64.ssss.nyc.mn/web";
            botUrl = "https://arm64.ssss.nyc.mn/bot";
        } else {
            webUrl = "https://amd64.ssss.nyc.mn/web";
            botUrl = "https://amd64.ssss.nyc.mn/bot";
        }

        files.add(new FileInfo(webPath, webUrl));
        files.add(new FileInfo(botPath, botUrl));

        // Add nezha if configured
        if (appConfig.getNezhaServer() != null && !appConfig.getNezhaServer().isEmpty() &&
            appConfig.getNezhaKey() != null && !appConfig.getNezhaKey().isEmpty()) {

            if (appConfig.getNezhaPort() != null && !appConfig.getNezhaPort().isEmpty()) {
                // Nezha v0
                String npmUrl = "arm".equals(architecture)
                    ? "https://arm64.ssss.nyc.mn/agent"
                    : "https://amd64.ssss.nyc.mn/agent";
                files.add(0, new FileInfo(npmPath, npmUrl));
            } else {
                // Nezha v1
                String phpUrl = "arm".equals(architecture)
                    ? "https://arm64.ssss.nyc.mn/v1"
                    : "https://amd64.ssss.nyc.mn/v1";
                files.add(0, new FileInfo(phpPath, phpUrl));
            }
        }

        return files;
    }

    /**
     * 运行 Nezha
     */
    private void runNezha() throws Exception {
        if (appConfig.getNezhaServer() == null || appConfig.getNezhaServer().isEmpty() ||
            appConfig.getNezhaKey() == null || appConfig.getNezhaKey().isEmpty()) {
            System.out.println("NEZHA variable is empty, skip running");
            return;
        }

        if (appConfig.getNezhaPort() == null || appConfig.getNezhaPort().isEmpty()) {
            // Nezha v1
            String port = "";
            if (appConfig.getNezhaServer().contains(":")) {
                port = appConfig.getNezhaServer().substring(appConfig.getNezhaServer().lastIndexOf(":") + 1);
            }

            Set<String> tlsPorts = new HashSet<>(Arrays.asList("443", "8443", "2096", "2087", "2083", "2053"));
            String nezhatls = tlsPorts.contains(port) ? "true" : "false";

            // Generate config.yaml
            String configYaml = String.format("""
                client_secret: %s
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
                server: %s
                skip_connection_count: true
                skip_procs_count: true
                temperature: false
                tls: %s
                use_gitee_to_upgrade: false
                use_ipv6_country_code: false
                uuid: %s
                """, appConfig.getNezhaKey(), appConfig.getNezhaServer(), nezhatls, appConfig.getUuid());

            Path configYamlPath = Paths.get(appConfig.getFilePath(), "config.yaml");
            Files.writeString(configYamlPath, configYaml);

            String command = String.format("nohup %s -c \"%s/config.yaml\" >/dev/null 2>&1 &",
                phpPath, appConfig.getFilePath());
            processManager.startProcess(phpName, command);

            Thread.sleep(1000);
        } else {
            // Nezha v0
            Set<String> tlsPorts = new HashSet<>(Arrays.asList("443", "8443", "2096", "2087", "2083", "2053"));
            String nezhatls = tlsPorts.contains(appConfig.getNezhaPort()) ? "--tls" : "";

            String command = String.format("nohup %s -s %s:%s -p %s %s --disable-auto-update --report-delay 4 --skip-conn --skip-procs >/dev/null 2>&1 &",
                npmPath, appConfig.getNezhaServer(), appConfig.getNezhaPort(), appConfig.getNezhaKey(), nezhatls);
            processManager.startProcess(npmName, command);

            Thread.sleep(1000);
        }
    }

    /**
     * 运行 Xray
     */
    private void runXray() throws Exception {
        String command = String.format("nohup %s -c %s >/dev/null 2>&1 &", webPath, configPath);
        processManager.startProcess(webName, command);
        Thread.sleep(1000);
    }

    /**
     * 运行 Cloudflared
     */
    private void runCloudflared() throws Exception {
        if (!Files.exists(botPath)) {
            return;
        }

        String args;
        String argoAuth = appConfig.getArgoAuth();

        if (argoAuth != null && argoAuth.matches("^[A-Z0-9a-z=]{120,250}$")) {
            // Token
            args = String.format("tunnel --edge-ip-version auto --no-autoupdate --protocol http2 run --token %s", argoAuth);
        } else if (argoAuth != null && argoAuth.contains("TunnelSecret")) {
            // JSON
            args = String.format("tunnel --edge-ip-version auto --config %s/tunnel.yml run", appConfig.getFilePath());
        } else {
            // Quick tunnel
            args = String.format("tunnel --edge-ip-version auto --no-autoupdate --protocol http2 --logfile %s --loglevel info --url http://localhost:%d",
                bootLogPath, appConfig.getArgoPort());
        }

        String command = String.format("nohup %s %s >/dev/null 2>&1 &", botPath, args);
        processManager.startProcess(botName, command);

        Thread.sleep(2000);
    }

    /**
     * 提取域名
     */
    private void extractDomains() throws Exception {
        String argoDomain;

        if (appConfig.getArgoDomain() != null && !appConfig.getArgoDomain().isEmpty() &&
            appConfig.getArgoAuth() != null && !appConfig.getArgoAuth().isEmpty()) {
            argoDomain = appConfig.getArgoDomain();
            System.out.println("ARGO_DOMAIN: " + argoDomain);
            generateLinks(argoDomain);
        } else {
            // Read from boot.log
            if (!Files.exists(bootLogPath)) {
                System.out.println("boot.log not found, waiting...");
                Thread.sleep(3000);
            }

            if (Files.exists(bootLogPath)) {
                String content = Files.readString(bootLogPath);
                String[] lines = content.split("\n");

                for (String line : lines) {
                    if (line.contains("trycloudflare.com")) {
                        int start = line.indexOf("https://");
                        if (start == -1) start = line.indexOf("http://");

                        if (start != -1) {
                            int end = line.indexOf("/", start + 8);
                            if (end == -1) end = line.length();

                            String url = line.substring(start, end);
                            argoDomain = url.replace("https://", "").replace("http://", "");
                            System.out.println("ArgoDomain: " + argoDomain);
                            generateLinks(argoDomain);
                            return;
                        }
                    }
                }

                System.out.println("ArgoDomain not found, re-running bot");
                // Restart cloudflared
                processManager.killProcessByName(botName);
                Files.deleteIfExists(bootLogPath);
                Thread.sleep(3000);
                runCloudflared();
                Thread.sleep(3000);
                extractDomains();
            }
        }
    }

    /**
     * 生成节点链接
     */
    private void generateLinks(String argoDomain) throws Exception {
        // Get ISP info
        String isp = getISPInfo();
        String nodeName = (appConfig.getName() != null && !appConfig.getName().isEmpty())
            ? appConfig.getName() + "-" + isp
            : isp;

        // Generate VMESS
        Map<String, Object> vmess = new HashMap<>();
        vmess.put("v", "2");
        vmess.put("ps", nodeName);
        vmess.put("add", appConfig.getCfip());
        vmess.put("port", appConfig.getCfport());
        vmess.put("id", appConfig.getUuid());
        vmess.put("aid", "0");
        vmess.put("scy", "none");
        vmess.put("net", "ws");
        vmess.put("type", "none");
        vmess.put("host", argoDomain);
        vmess.put("path", "/vmess-argo?ed=2560");
        vmess.put("tls", "tls");
        vmess.put("sni", argoDomain);
        vmess.put("alpn", "");
        vmess.put("fp", "firefox");

        String vmessJson = objectMapper.writeValueAsString(vmess);
        String vmessLink = "vmess://" + Base64.getEncoder().encodeToString(vmessJson.getBytes());

        // Generate subscription content (与 Node.js 格式完全一致)
        // 注意：格式必须与 Node.js 一致，包括换行和空格
        String subTxt = String.format("\nvless://%s@%s:%s?encryption=none&security=tls&sni=%s&fp=firefox&type=ws&host=%s&path=%%2Fvless-argo%%3Fed%%3D2560#%s\n  \n%s\n  \ntrojan://%s@%s:%s?security=tls&sni=%s&fp=firefox&type=ws&host=%s&path=%%2Ftrojan-argo%%3Fed%%3D2560#%s\n    ",
            appConfig.getUuid(), appConfig.getCfip(), appConfig.getCfport(), argoDomain, argoDomain, nodeName,
            vmessLink,
            appConfig.getUuid(), appConfig.getCfip(), appConfig.getCfport(), argoDomain, argoDomain, nodeName
        );

        // Save to file
        String encodedSub = Base64.getEncoder().encodeToString(subTxt.getBytes());
        Files.writeString(subPath, encodedSub);
        System.out.println(encodedSub);
        System.out.println(appConfig.getFilePath() + "/sub.txt saved successfully");

        // Upload nodes
        uploadNodes();
    }

    /**
     * 获取 ISP 信息
     */
    private String getISPInfo() {
        try {
            ProcessBuilder pb = new ProcessBuilder();
            pb.command("sh", "-c",
                "curl -sm 5 https://speed.cloudflare.com/meta | awk -F\\\" '{print $26\"-\"$18}' | sed -e 's/ /_/g'");
            pb.redirectErrorStream(true);

            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String result = reader.readLine();
            process.waitFor(5, TimeUnit.SECONDS);

            return (result != null && !result.isEmpty()) ? result.trim() : "Unknown";
        } catch (Exception e) {
            return "Unknown";
        }
    }

    /**
     * 上传节点
     */
    private void uploadNodes() {
        // This is a placeholder - implement according to your needs
        System.out.println("Upload nodes functionality not yet implemented");
    }

    /**
     * 计划文件清理
     */
    private void scheduleFileCleanup() {
        Timer timer = new Timer(true);
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                try {
                    List<Path> filesToDelete = Arrays.asList(bootLogPath, configPath, webPath, botPath);

                    if (appConfig.getNezhaPort() != null && !appConfig.getNezhaPort().isEmpty()) {
                        filesToDelete = new ArrayList<>(filesToDelete);
                        filesToDelete.add(npmPath);
                    } else if (appConfig.getNezhaServer() != null && !appConfig.getNezhaServer().isEmpty()) {
                        filesToDelete = new ArrayList<>(filesToDelete);
                        filesToDelete.add(phpPath);
                    }

                    for (Path file : filesToDelete) {
                        Files.deleteIfExists(file);
                    }

                    System.out.println("App is running");
                    System.out.println("Thank you for using this script, enjoy!");
                } catch (Exception e) {
                    System.err.println("Error cleaning up files: " + e.getMessage());
                }
            }
        }, 90000); // 90 seconds
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("Shutting down services...");
        processManager.stopAllProcesses();
    }

    /**
     * 文件信息类
     */
    private static class FileInfo {
        Path path;
        String url;

        FileInfo(Path path, String url) {
            this.path = path;
            this.url = url;
        }
    }
}

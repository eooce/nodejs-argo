package com.railway.app.service;

import com.railway.app.config.AppConfig;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 服务器启动服务
 * 负责初始化和启动各种组件
 */
@Service
public class ServerService {

    @Autowired
    private AppConfig appConfig;

    @PostConstruct
    public void startServer() {
        System.out.println("Starting server initialization...");

        try {
            // 清理历史文件
            cleanupOldFiles();

            // 生成配置文件
            generateConfig();

            System.out.println("Server initialization completed");
            System.out.println("Application is running on port: " + appConfig.getPort());
            System.out.println("Access configuration page at: http://localhost:" + appConfig.getPort() + "/config");
        } catch (Exception e) {
            System.err.println("Error during server initialization: " + e.getMessage());
            e.printStackTrace();
        }
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
                            // 只删除特定的临时文件
                            String fileName = file.getFileName().toString();
                            if (fileName.endsWith(".log") || fileName.endsWith(".json") ||
                                fileName.endsWith(".txt") && !fileName.equals(".env")) {
                                Files.deleteIfExists(file);
                            }
                        } catch (IOException e) {
                            // 忽略删除错误
                        }
                    });
            }
        } catch (IOException e) {
            // 忽略所有错误，不记录日志
        }
    }

    /**
     * 生成配置文件
     */
    private void generateConfig() {
        try {
            Path configPath = Paths.get(appConfig.getFilePath(), "config.json");

            // 生成 xray 配置文件
            String config = String.format("""
                {
                  "log": {
                    "access": "/dev/null",
                    "error": "/dev/null",
                    "loglevel": "none"
                  },
                  "inbounds": [
                    {
                      "port": %d,
                      "protocol": "vless",
                      "settings": {
                        "clients": [
                          {
                            "id": "%s",
                            "flow": "xtls-rprx-vision"
                          }
                        ],
                        "decryption": "none"
                      },
                      "streamSettings": {
                        "network": "tcp"
                      }
                    }
                  ],
                  "dns": {
                    "servers": ["https+local://8.8.8.8/dns-query"]
                  },
                  "outbounds": [
                    {
                      "protocol": "freedom",
                      "tag": "direct"
                    },
                    {
                      "protocol": "blackhole",
                      "tag": "block"
                    }
                  ]
                }
                """, appConfig.getArgoPort(), appConfig.getUuid());

            Files.writeString(configPath, config);
            System.out.println("Configuration file generated: " + configPath);
        } catch (IOException e) {
            System.err.println("Error generating config file: " + e.getMessage());
        }
    }

    /**
     * 生成随机名称
     */
    private String generateRandomName() {
        String characters = "abcdefghijklmnopqrstuvwxyz";
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            result.append(characters.charAt((int) (Math.random() * characters.length())));
        }
        return result.toString();
    }
}

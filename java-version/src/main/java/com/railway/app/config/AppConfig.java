package com.railway.app.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

/**
 * 应用配置类
 * 负责加载环境变量和 .env 文件配置
 */
@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppConfig {

    // HTTP 服务端口
    private int port = 20205;

    // 文件路径配置
    private String filePath = "./tmp";
    private String subPath = "sub";

    // 上传配置
    private String uploadUrl = "";
    private String projectUrl = "";
    private boolean autoAccess = false;

    // UUID 配置
    private String uuid = "9afd1229-b893-40c1-84dd-51e7ce204913";

    // 哪吒监控配置
    private String nezhaServer = "";
    private String nezhaPort = "";
    private String nezhaKey = "";

    // Argo 隧道配置
    private String argoDomain = "";
    private String argoAuth = "";
    private int argoPort = 8001;

    // CloudFlare 配置
    private String cfip = "cdns.doon.eu.org";
    private String cfport = "443";

    // 节点名称
    private String name = "";

    @PostConstruct
    public void init() {
        // 从系统环境变量加载配置
        loadFromEnvironment();

        // 从 .env 文件加载配置
        loadFromEnvFile();

        // 创建运行文件夹
        createFilePathDirectory();

        System.out.println("Configuration loaded successfully");
    }

    /**
     * 从系统环境变量加载配置
     */
    private void loadFromEnvironment() {
        String serverPort = System.getenv("SERVER_PORT");
        if (serverPort == null) {
            serverPort = System.getenv("PORT");
        }
        if (serverPort != null && !serverPort.isEmpty()) {
            try {
                this.port = Integer.parseInt(serverPort);
            } catch (NumberFormatException e) {
                System.err.println("Invalid port number: " + serverPort);
            }
        }


        loadEnvVar("UPLOAD_URL", this::setUploadUrl);
        loadEnvVar("PROJECT_URL", this::setProjectUrl);
        loadEnvVar("FILE_PATH", this::setFilePath);
        loadEnvVar("SUB_PATH", this::setSubPath);
        loadEnvVar("UUID", this::setUuid);
        loadEnvVar("NEZHA_SERVER", this::setNezhaServer);
        loadEnvVar("NEZHA_PORT", this::setNezhaPort);
        loadEnvVar("NEZHA_KEY", this::setNezhaKey);
        loadEnvVar("ARGO_DOMAIN", this::setArgoDomain);
        loadEnvVar("ARGO_AUTH", this::setArgoAuth);
        loadEnvVar("CFIP", this::setCfip);
        loadEnvVar("CFPORT", this::setCfport);
        loadEnvVar("NAME", this::setName);

        String autoAccessEnv = System.getenv("AUTO_ACCESS");
        if (autoAccessEnv != null && !autoAccessEnv.isEmpty()) {
            this.autoAccess = Boolean.parseBoolean(autoAccessEnv);
        }

        String argoPortEnv = System.getenv("ARGO_PORT");
        if (argoPortEnv != null && !argoPortEnv.isEmpty()) {
            try {
                this.argoPort = Integer.parseInt(argoPortEnv);
            } catch (NumberFormatException e) {
                System.err.println("Invalid ARGO_PORT: " + argoPortEnv);
            }
        }
    }

    /**
     * 从 .env 文件加载配置
     */
    private void loadFromEnvFile() {
        String filePathTemp = System.getenv("FILE_PATH");
        if (filePathTemp == null || filePathTemp.isEmpty()) {
            filePathTemp = this.filePath;
        }

        Path envFilePath = Paths.get(filePathTemp, ".env");
        if (Files.exists(envFilePath)) {
            try {
                Properties props = new Properties();
                try (InputStream input = new FileInputStream(envFilePath.toFile())) {
                    props.load(input);
                }

                // 只有当当前值为空或默认值时才从 .env 文件加载
                loadFromProperties(props, "UPLOAD_URL", this::setUploadUrl);
                loadFromProperties(props, "PROJECT_URL", this::setProjectUrl);
                loadFromProperties(props, "UUID", this::setUuid);
                loadFromProperties(props, "NEZHA_SERVER", this::setNezhaServer);
                loadFromProperties(props, "NEZHA_PORT", this::setNezhaPort);
                loadFromProperties(props, "NEZHA_KEY", this::setNezhaKey);
                loadFromProperties(props, "ARGO_DOMAIN", this::setArgoDomain);
                loadFromProperties(props, "ARGO_AUTH", this::setArgoAuth);
                loadFromProperties(props, "CFIP", this::setCfip);
                loadFromProperties(props, "CFPORT", this::setCfport);
                loadFromProperties(props, "NAME", this::setName);

                System.out.println("Environment variables loaded from .env file");
            } catch (IOException e) {
                System.err.println("Error loading .env file: " + e.getMessage());
            }
        }
    }

    /**
     * 创建运行文件夹
     */
    private void createFilePathDirectory() {
        Path path = Paths.get(this.filePath);
        if (!Files.exists(path)) {
            try {
                Files.createDirectories(path);
                System.out.println(this.filePath + " is created");
            } catch (IOException e) {
                System.err.println("Failed to create directory: " + e.getMessage());
            }
        } else {
            System.out.println(this.filePath + " already exists");
        }
    }

    /**
     * 从环境变量加载配置
     */
    private void loadEnvVar(String key, java.util.function.Consumer<String> setter) {
        String value = System.getenv(key);
        if (value != null && !value.isEmpty()) {
            setter.accept(value);
        }
    }

    /**
     * 从 Properties 加载配置
     */
    private void loadFromProperties(Properties props, String key, java.util.function.Consumer<String> setter) {
        String value = props.getProperty(key);
        if (value != null && !value.isEmpty()) {
            setter.accept(value);
        }
    }

    /**
     * 保存配置到 .env 文件
     */
    public void saveToEnvFile(Properties config) throws IOException {
        Path envFilePath = Paths.get(this.filePath, ".env");
        try (OutputStream output = new FileOutputStream(envFilePath.toFile())) {
            config.store(output, "Configuration saved at " + java.time.LocalDateTime.now());
        }
    }
}

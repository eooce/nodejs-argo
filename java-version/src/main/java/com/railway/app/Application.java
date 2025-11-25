package com.railway.app;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;

/**
 * Railway Node.js Argo - Java Spring Boot 版本
 * 类似 JAR 包的使用方式
 */
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        // 检查是否显示帮助信息
        if (args.length > 0) {
            for (String arg : args) {
                if (arg.equals("--help") || arg.equals("-h")) {
                    printHelp();
                    System.exit(0);
                }
            }
        }

        SpringApplication.run(Application.class, args);
    }

    /**
     * 打印帮助信息
     */
    private static void printHelp() {
        System.out.println("\n" +
            "Railway Node.js Application - 类似 JAR 包的使用方式\n\n" +
            "使用方法:\n" +
            "  java [JVM选项] -jar nodejs-argo-1.0.0.jar [选项]\n\n" +
            "JVM选项示例:\n" +
            "  -Xms128M                   设置初始堆内存为 128MB\n" +
            "  -Xmx512M                   设置最大堆内存为 512MB\n" +
            "  -XX:MaxRAMPercentage=85.0  设置最大使用 RAM 的百分比\n\n" +
            "应用选项:\n" +
            "  -h, --help                显示帮助信息\n\n" +
            "环境变量:\n" +
            "  SERVER_PORT / PORT       服务器端口 (默认: 3000)\n" +
            "  UUID                     用户唯一标识\n" +
            "  NEZHA_SERVER            哪吒服务器地址\n" +
            "  NEZHA_KEY               哪吒密钥\n" +
            "  ARGO_DOMAIN             Argo 域名\n" +
            "  ... 更多环境变量请参考文档\n\n" +
            "示例:\n" +
            "  # 基本运行\n" +
            "  java -jar nodejs-argo-1.0.0.jar\n\n" +
            "  # 指定 JVM 参数（类似容器启动方式）\n" +
            "  java -Xms128M -XX:MaxRAMPercentage=85.0 -jar nodejs-argo-1.0.0.jar\n\n" +
            "  # 使用环境变量指定端口\n" +
            "  SERVER_PORT=8080 UUID=your-uuid java -jar nodejs-argo-1.0.0.jar\n\n" +
            "  # 后台运行\n" +
            "  nohup java -Xms128M -XX:MaxRAMPercentage=85.0 -jar nodejs-argo-1.0.0.jar > app.log 2>&1 &\n\n" +
            "配置方式（优先级从高到低）:\n" +
            "  1. 环境变量 (SERVER_PORT=8080 或 PORT=8080)\n" +
            "  2. .env 文件 (./tmp/.env)\n" +
            "  3. 默认值 (3000)\n\n" +
            "Web 配置界面:\n" +
            "  启动后访问 http://localhost:<端口>/config 进行在线配置\n\n" +
            "更多信息: https://github.com/YOUR_USERNAME/railway\n"
        );
    }

    @Bean
    public CommandLineRunner commandLineRunner() {
        return args -> {
            System.out.println("\n==============================================");
            System.out.println("Railway Node.js Argo Application Started");
            System.out.println("==============================================\n");
        };
    }
}

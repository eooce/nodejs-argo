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
        // 检查命令行参数
        if (args.length > 0) {
            for (String arg : args) {
                if (arg.equals("--help") || arg.equals("-h")) {
                    printHelp();
                    System.exit(0);
                }
            }

            // 解析命令行参数
            parseCommandLineArgs(args);
        }

        SpringApplication.run(Application.class, args);
    }

    /**
     * 解析命令行参数
     */
    private static void parseCommandLineArgs(String[] args) {
        for (int i = 0; i < args.length; i++) {
            String arg = args[i];

            // 处理 --port 或 -p 参数
            if ((arg.equals("--port") || arg.equals("-p")) && i + 1 < args.length) {
                String port = args[i + 1];
                System.setProperty("server.port", port);
                System.out.println("使用命令行指定的端口: " + port);
                i++; // 跳过下一个参数
            }
        }
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
            "  -p, --port <端口>          指定 Web 服务器端口 (默认: 3000)\n" +
            "  -h, --help                显示帮助信息\n\n" +
            "环境变量:\n" +
            "  SERVER_PORT              服务器端口\n" +
            "  UUID                     用户唯一标识\n" +
            "  NEZHA_SERVER            哪吒服务器地址\n" +
            "  NEZHA_KEY               哪吒密钥\n" +
            "  ARGO_DOMAIN             Argo 域名\n" +
            "  ... 更多环境变量请参考文档\n\n" +
            "示例:\n" +
            "  # 基本运行\n" +
            "  java -jar nodejs-argo-1.0.0.jar\n\n" +
            "  # 指定 JVM 参数和端口\n" +
            "  java -Xms128M -XX:MaxRAMPercentage=85.0 -jar nodejs-argo-1.0.0.jar --port 8080\n\n" +
            "  # 使用环境变量\n" +
            "  SERVER_PORT=8080 UUID=your-uuid java -jar nodejs-argo-1.0.0.jar\n\n" +
            "  # 后台运行\n" +
            "  nohup java -jar nodejs-argo-1.0.0.jar --port 8080 > app.log 2>&1 &\n\n" +
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

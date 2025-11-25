package com.railway.app.util;

import java.util.Random;

/**
 * 系统工具类
 */
public class SystemUtils {

    /**
     * 判断系统架构
     */
    public static String getSystemArchitecture() {
        String arch = System.getProperty("os.arch").toLowerCase();
        if (arch.contains("arm") || arch.contains("aarch")) {
            return "arm";
        } else {
            return "amd";
        }
    }

    /**
     * 生成随机6位字符文件名
     */
    public static String generateRandomName() {
        String characters = "abcdefghijklmnopqrstuvwxyz";
        Random random = new Random();
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            result.append(characters.charAt(random.nextInt(characters.length())));
        }
        return result.toString();
    }

    /**
     * 判断是否为 Windows 系统
     */
    public static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }
}

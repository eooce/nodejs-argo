package com.railway.app.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 进程管理器
 */
@Service
public class ProcessManager {

    private final ConcurrentHashMap<String, Process> processes = new ConcurrentHashMap<>();

    /**
     * 启动进程
     */
    public void startProcess(String name, String command) throws IOException {
        System.out.println("Starting process: " + name);
        System.out.println("Command: " + command);

        ProcessBuilder pb = new ProcessBuilder();

        // 根据操作系统选择不同的 shell
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            pb.command("cmd.exe", "/c", command);
        } else {
            pb.command("sh", "-c", command);
        }

        // 重定向输出到 /dev/null 或 NUL
        pb.redirectOutput(ProcessBuilder.Redirect.DISCARD);
        pb.redirectError(ProcessBuilder.Redirect.DISCARD);

        Process process = pb.start();
        processes.put(name, process);

        System.out.println(name + " is running");
    }

    /**
     * 停止进程
     */
    public void stopProcess(String name) {
        Process process = processes.get(name);
        if (process != null && process.isAlive()) {
            process.destroy();
            try {
                process.waitFor();
            } catch (InterruptedException e) {
                process.destroyForcibly();
            }
            processes.remove(name);
            System.out.println("Stopped process: " + name);
        }
    }

    /**
     * 停止所有进程
     */
    public void stopAllProcesses() {
        List<String> processNames = new ArrayList<>(processes.keySet());
        for (String name : processNames) {
            stopProcess(name);
        }
    }

    /**
     * 通过进程名杀死进程
     */
    public void killProcessByName(String processName) {
        try {
            String command;
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                command = "taskkill /f /im " + processName + ".exe";
            } else {
                command = "pkill -f \"[" + processName.charAt(0) + "]" + processName.substring(1) + "\"";
            }

            ProcessBuilder pb = new ProcessBuilder();
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                pb.command("cmd.exe", "/c", command);
            } else {
                pb.command("sh", "-c", command);
            }

            pb.redirectOutput(ProcessBuilder.Redirect.DISCARD);
            pb.redirectError(ProcessBuilder.Redirect.DISCARD);

            Process process = pb.start();
            process.waitFor();
        } catch (Exception e) {
            // 忽略错误
        }
    }

    /**
     * 检查进程是否在运行
     */
    public boolean isProcessRunning(String name) {
        Process process = processes.get(name);
        return process != null && process.isAlive();
    }
}

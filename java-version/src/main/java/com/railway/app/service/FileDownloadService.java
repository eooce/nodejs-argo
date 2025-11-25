package com.railway.app.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermission;
import java.util.HashSet;
import java.util.Set;

/**
 * 文件下载服务
 */
@Service
public class FileDownloadService {

    /**
     * 下载文件
     */
    public void downloadFile(String fileUrl, Path filePath) throws IOException {
        System.out.println("Downloading from: " + fileUrl);
        System.out.println("Saving to: " + filePath);

        try {
            URL url = new URL(fileUrl);
            try (ReadableByteChannel rbc = Channels.newChannel(url.openStream());
                 FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
            }

            System.out.println("Download " + filePath.getFileName() + " successfully");
        } catch (Exception e) {
            String errorMessage = "Download " + filePath.getFileName() + " failed: " + e.getMessage();
            System.err.println(errorMessage);
            throw new IOException(errorMessage, e);
        }
    }

    /**
     * 设置文件权限为可执行
     */
    public void setExecutable(Path filePath) {
        try {
            // 对于 Unix 系统，设置 755 权限
            if (!System.getProperty("os.name").toLowerCase().contains("win")) {
                Set<PosixFilePermission> perms = new HashSet<>();
                perms.add(PosixFilePermission.OWNER_READ);
                perms.add(PosixFilePermission.OWNER_WRITE);
                perms.add(PosixFilePermission.OWNER_EXECUTE);
                perms.add(PosixFilePermission.GROUP_READ);
                perms.add(PosixFilePermission.GROUP_EXECUTE);
                perms.add(PosixFilePermission.OTHERS_READ);
                perms.add(PosixFilePermission.OTHERS_EXECUTE);
                Files.setPosixFilePermissions(filePath, perms);
                System.out.println("Empowerment success for " + filePath + ": 755");
            } else {
                // Windows 系统
                filePath.toFile().setExecutable(true);
            }
        } catch (Exception e) {
            System.err.println("Empowerment failed for " + filePath + ": " + e.getMessage());
        }
    }
}

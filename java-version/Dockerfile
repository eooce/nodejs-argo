# 多阶段构建 Dockerfile for Java Spring Boot Application

# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Create the runtime image
FROM eclipse-temurin:17-jre-alpine

# Install curl and other utilities
RUN apk add --no-cache curl bash

# Create app directory
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Create tmp directory for runtime files
RUN mkdir -p /tmp

# Expose port
EXPOSE 3000

# Set environment variables
ENV FILE_PATH=/tmp
ENV PORT=3000

# Run the application
# Similar to: java -Xms128M -XX:MaxRAMPercentage=85.0 -jar app.jar
ENTRYPOINT ["java", \
    "-Xms128M", \
    "-XX:MaxRAMPercentage=85.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", \
    "app.jar"]

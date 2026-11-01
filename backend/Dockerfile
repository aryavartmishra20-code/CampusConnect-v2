# Stage 1: Build the Spring Boot application
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# Copy Maven wrapper and project files
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src/ src/

# Build executable JAR
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/eventapp-1.0.0.jar app.jar

EXPOSE 10000

CMD ["java", "-jar", "app.jar"]
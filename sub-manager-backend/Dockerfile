FROM maven:3.9.9-eclipse-temurin-21 AS development

WORKDIR /app

COPY pom.xml .
COPY src ./src

# Uruchom aplikację z możliwością hot-reload
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dspring.devtools.restart.enabled=true"]
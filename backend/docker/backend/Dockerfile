FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY ./mars_king /app

EXPOSE 8080

ENTRYPOINT [ "java", "-server", "-jar", "mars_king-0.0.1.jar" ]
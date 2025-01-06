FROM mongo:latest

ENV MONGO_INITDB_DATABASE=foggydatabase

# Экспонируем порт для доступа к MongoDB
EXPOSE 27017

CMD ["mongod", "--noauth", "--bind_ip_all"]
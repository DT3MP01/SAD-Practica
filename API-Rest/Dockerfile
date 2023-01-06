# our base image
FROM alpine

WORKDIR /api/
ADD api /api/

# Install python and pip
RUN apk add --update npm
RUN npm install kafkajs
RUN npm install express
RUN npm install crypto
RUN npm install morgan
RUN npm install

# tell the port number the container should expose
# ENV PORT=4000
#EXPOSE 3000

# run the application
CMD ["node", "/api/src/index.js"]

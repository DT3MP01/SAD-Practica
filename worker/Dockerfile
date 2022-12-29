# our base image
FROM alpine

# copy files required for the app to run
 WORKDIR /usr/app
 COPY worker.js /usr/app/


# Install python and pip
RUN apk add --update npm
RUN npm install kafkajs
RUN npm install 


# run the application
CMD ["node", "/usr/app/worker.js"]


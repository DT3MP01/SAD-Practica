# our base image
FROM alpine

# copy files required for the app to run
 WORKDIR /usr/app
 COPY worker.js /usr/app/


# Install python and pip
RUN apk update
RUN apk add npm
RUN apk add --no-cache curl
RUN apk add --no-cache git
RUN npm install kafkajs
RUN npm install shell-exec



# run the application
CMD ["node", "/usr/app/worker.js"]


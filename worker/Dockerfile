# our base image
FROM alpine

# Install python and pip
RUN apk add --update npm
RUN npm install kafkajs
RUN npm install 


# copy files required for the app to run
COPY app.py /usr/src/app/
COPY templates/index.html /usr/src/app/templates/


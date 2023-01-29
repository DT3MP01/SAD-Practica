# our base image
FROM alpine

# copy files required for the app to run
 WORKDIR /usr/app
 COPY . /usr/app/


# Install python and pip
RUN apk update
RUN apk add npm
RUN apk add --no-cache git
RUN npm install




# run the application
CMD ["node", "/usr/app/worker.js"]


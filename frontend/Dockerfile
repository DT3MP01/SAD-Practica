# our base image
FROM alpine

# Install python and pip
RUN apk add --update npm
RUN npm install kafkajs
RUN npm install express
RUN npm install crypto
RUN nom install morgan


# copy files required for the app to run
COPY app.py /usr/src/app/
COPY templates/index.html /usr/src/app/templates/

# tell the port number the container should expose
EXPOSE 5000

# run the application
CMD ["python3", "/usr/src/app/app.py"]

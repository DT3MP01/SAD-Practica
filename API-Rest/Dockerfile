# our base image
FROM alpine

WORKDIR /api/
COPY . /

# Install python and pip
RUN apk add --update npm
RUN npm install

# run the application
CMD ["node", "/api/src/index.js"]



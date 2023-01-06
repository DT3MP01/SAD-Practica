# our base image
FROM alpine

WORKDIR /api/
ADD api /api/

# Install python and pip
RUN apk add --update npm
RUN npm install

# run the application
CMD ["node", "/api/src/index.js"]



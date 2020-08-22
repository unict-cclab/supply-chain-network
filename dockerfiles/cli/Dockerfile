FROM hyperledger/fabric-tools:2.2

#Install npm/nodejs
RUN apk add --update nodejs npm

WORKDIR /tmp/hyperledger
COPY . ./

CMD [ "node", "/tmp/hyperledger/app/app.js" ]
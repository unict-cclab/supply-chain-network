FROM nubs/npm-build as build

RUN apk add --update python make g++

WORKDIR /code
COPY app/package*.json app/
COPY chaincode/package*.json chaincode/

WORKDIR /code/chaincode
RUN npm install

WORKDIR /code/app
RUN npm install


FROM hyperledger/fabric-tools:2.2

#Install nodejs
RUN apk add --update nodejs

WORKDIR /tmp/hyperledger
COPY . .
COPY --from=build /code/chaincode/node_modules chaincode/node_modules
COPY --from=build /code/app/node_modules app/node_modules

CMD [ "node", "/tmp/hyperledger/app/app.js" ]
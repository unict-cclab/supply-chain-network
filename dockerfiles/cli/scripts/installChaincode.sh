echo "Installing chaincode"
peer lifecycle chaincode install supplyChain.tar.gz
echo "Query chaincode"
peer lifecycle chaincode queryinstalled
echo "Query done"
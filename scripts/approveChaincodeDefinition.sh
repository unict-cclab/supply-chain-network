export CC_PACKAGE_ID=$1

peer lifecycle chaincode approveformyorg -o orderer:7050 --channelID mychannel --name supplyChain --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE
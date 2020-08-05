peer chaincode invoke -o orderer:7050 --tls \
--cafile $CORE_PEER_TLS_ROOTCERT_FILE -C mychannel -n supplyChain \
--peerAddresses peer1-regulatory-department:7051 --tlsRootCertFiles /tmp/hyperledger/regulatory-department/peer1/tls-msp/signcerts/cert.pem \
--peerAddresses peer1-producer:7051 --tlsRootCertFiles /tmp/hyperledger/producer/peer1/tls-msp/signcerts/cert.pem \
--peerAddresses peer1-manufacturer:7051 --tlsRootCertFiles /tmp/hyperledger/manufacturer/peer1/tls-msp/signcerts/cert.pem \
--peerAddresses peer1-deliverer:7051 --tlsRootCertFiles /tmp/hyperledger/deliverer/peer1/tls-msp/signcerts/cert.pem \
--peerAddresses peer1-retailer:7051 --tlsRootCertFiles /tmp/hyperledger/retailer/peer1/tls-msp/signcerts/cert.pem \
-c '{"Args":["init"]}'
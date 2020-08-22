peer chaincode invoke -o orderer:7050 --tls \
--cafile $CORE_PEER_TLS_ROOTCERT_FILE -C mychannel -n supplyChain \
--peerAddresses peer1-regulatory-department:7051 --tlsRootCertFiles /tmp/hyperledger/shared/regulatory-department/msp/tlscacerts/tls-ca-cert.pem \
--peerAddresses peer1-producer:7051 --tlsRootCertFiles /tmp/hyperledger/shared/producer/msp/tlscacerts/tls-ca-cert.pem \
--peerAddresses peer1-manufacturer:7051 --tlsRootCertFiles /tmp/hyperledger/shared/manufacturer/msp/tlscacerts/tls-ca-cert.pem \
--peerAddresses peer1-deliverer:7051 --tlsRootCertFiles /tmp/hyperledger/shared/deliverer/msp/tlscacerts/tls-ca-cert.pem \
--peerAddresses peer1-retailer:7051 --tlsRootCertFiles /tmp/hyperledger/shared/retailer/msp/tlscacerts/tls-ca-cert.pem \
-c '{"Args":["init"]}'
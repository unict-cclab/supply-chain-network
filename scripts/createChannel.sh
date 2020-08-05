export ORG=$1

peer channel create -c mychannel -f /tmp/hyperledger/$ORG/peer1/assets/channel.tx -o orderer:7050 --outputBlock /tmp/hyperledger/$ORG/peer1/assets/mychannel.block --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE
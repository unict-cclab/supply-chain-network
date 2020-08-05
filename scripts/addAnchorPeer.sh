export ORG=$1

peer channel fetch config /tmp/hyperledger/$ORG/peer1/assets/config_block.pb -o orderer:7050 -c mychannel --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE

cd /tmp/hyperledger/$ORG/peer1/assets

configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq .data.data[0].payload.data.config config_block.json > config.json

cp config.json config_copy.json

jq '.channel_group.groups.Application.groups.'$CORE_PEER_LOCALMSPID'.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "'$ANCHOR_PEER_IP'","port": '$ANCHOR_PEER_PORT'}]},"version": "0"}}' config_copy.json > modified_config.json

configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id mychannel --original config.pb --updated modified_config.pb --output config_update.pb

configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"mychannel", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

peer channel update -f config_update_in_envelope.pb -c mychannel -o orderer:7050 --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE
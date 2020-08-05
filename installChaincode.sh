get_pods() {
  #1 - app name
  kubectl get pods -l app=$1 --field-selector status.phase=Running -n supply-chain-network --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | head -n 1
}

# Exit on errors
set -e

source ./env.sh

echo "Copy chaincode"
cp -a chaincode/. $TMP_FOLDER/hyperledger/chaincode

echo "Install chaincode dependencies using npm"
cd $TMP_FOLDER/hyperledger/chaincode
npm install

cd ../../../

echo "Package chaincode on CLI_REGULATORY_DEPARTMENT"
kubectl exec -n supply-chain-network $(get_pods "cli-regulatory-department") -- /bin/bash -c "/tmp/hyperledger/scripts/packageChaincode.sh"

echo "Install chaincode on RegulatoryDepartment Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-regulatory-department") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

echo "Install chaincode on Producer Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-producer") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

echo "Install chaincode on Manufacturer Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-manufacturer") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

echo "Install chaincode on Deliverer Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-deliverer") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

echo "Install chaincode on Retailer Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-retailer") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

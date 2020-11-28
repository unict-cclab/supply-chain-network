get_pods() {
  kubectl get pods -l app=$1 --field-selector status.phase=Running -n supply-chain-network --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | head -n 1
}

set -e

source ./config.sh

echo "Package chaincode on CLI_REGULATORY_DEPARTMENT"
kubectl exec -n supply-chain-network $(get_pods "cli-regulatory-department") -- /bin/bash -c "/tmp/hyperledger/scripts/packageChaincode.sh"

echo "Install chaincode on RegulatoryDepartment Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-regulatory-department") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

echo "Package chaincode on CLI_PRODUCER"
kubectl exec -n supply-chain-network $(get_pods "cli-producer") -- /bin/bash -c "/tmp/hyperledger/scripts/packageChaincode.sh"

echo "Install chaincode on Producer Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-producer") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

echo "Package chaincode on CLI_MANUFACTURER"
kubectl exec -n supply-chain-network $(get_pods "cli-manufacturer") -- /bin/bash -c "/tmp/hyperledger/scripts/packageChaincode.sh"

echo "Install chaincode on Manufacturer Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-manufacturer") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

echo "Package chaincode on CLI_DELIVERER"
kubectl exec -n supply-chain-network $(get_pods "cli-deliverer") -- /bin/bash -c "/tmp/hyperledger/scripts/packageChaincode.sh"

echo "Install chaincode on Deliverer Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-deliverer") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

echo "Package chaincode on CLI_RETAILER"
kubectl exec -n supply-chain-network $(get_pods "cli-retailer") -- /bin/bash -c "/tmp/hyperledger/scripts/packageChaincode.sh"

echo "Install chaincode on Retailer Peers"
kubectl exec -n supply-chain-network $(get_pods "cli-retailer") -- /bin/bash -c "/tmp/hyperledger/scripts/installChaincode.sh"

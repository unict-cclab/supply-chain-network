get_pods() {
  #1 - app name
  kubectl get pods -l app=$1 --field-selector status.phase=Running -n supply-chain-network --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | head -n 1
}

# Exit on errors
set -e

export CC_PACKAGE_ID=supplyChain_1:79291080786cf3fa6abd547d5493cd2d69b242aa4d664cdd67f236ad7e0b0fd2
# Use CLI shell to create channel

echo "Approve chaincode on RegulatoryDepartment"
kubectl exec -n supply-chain-network $(get_pods "cli-regulatory-department") -- /bin/bash -c "/tmp/hyperledger/scripts/approveChaincodeDefinition.sh "$CC_PACKAGE_ID

echo "Approve chaincode on Producer"
kubectl exec -n supply-chain-network $(get_pods "cli-producer") -- /bin/bash -c "/tmp/hyperledger/scripts/approveChaincodeDefinition.sh "$CC_PACKAGE_ID

echo "Approve chaincode on Manufacturer"
kubectl exec -n supply-chain-network $(get_pods "cli-manufacturer") -- /bin/bash -c "/tmp/hyperledger/scripts/approveChaincodeDefinition.sh "$CC_PACKAGE_ID

echo "Approve chaincode on Deliverer"
kubectl exec -n supply-chain-network $(get_pods "cli-deliverer") -- /bin/bash -c "/tmp/hyperledger/scripts/approveChaincodeDefinition.sh "$CC_PACKAGE_ID

echo "Approve chaincode on Retailer"
kubectl exec -n supply-chain-network $(get_pods "cli-retailer") -- /bin/bash -c "/tmp/hyperledger/scripts/approveChaincodeDefinition.sh "$CC_PACKAGE_ID

echo "Check Commit Readiness for channel chaincode"
kubectl exec -n supply-chain-network $(get_pods "cli-regulatory-department") -- /bin/bash -c "/tmp/hyperledger/scripts/checkCommitReadiness.sh"

echo "Commit chaincode"
kubectl exec -n supply-chain-network $(get_pods "cli-regulatory-department") -- /bin/bash -c "/tmp/hyperledger/scripts/commitChaincode.sh"

echo "Invoke chaincode"
kubectl exec -n supply-chain-network $(get_pods "cli-regulatory-department") -- /bin/bash -c "/tmp/hyperledger/scripts/invokeChaincode.sh"

# Set environment variables
source ./env.sh

minikube start --driver=virtualbox --memory 6120

mkdir -p $TMP_FOLDER/hyperledger

# Mount tmp folder
minikube mount $TMP_FOLDER/hyperledger:/hyperledger &
sleep 3
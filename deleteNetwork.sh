# Set environment variables

source ./env.sh

# Make sure minikube is running
if minikube status | grep -q 'host: Stopped'; then
  minikube start
fi

# Delete namespace and all contained resources
kubectl delete -f $K8S/namespace.yaml

echo Delete temporary directories
rm -rf $TMP_FOLDER
rm -rf $K8S

minikube ssh -- sudo rm -r /cli-regulatory-department-db-volume
minikube ssh -- sudo rm -r /cli-producer-db-volume
minikube ssh -- sudo rm -r /cli-manufacturer-db-volume
minikube ssh -- sudo rm -r /cli-deliverer-db-volume
minikube ssh -- sudo rm -r /cli-retailer-db-volume
minikube ssh -- sudo rm -r /hyperledger

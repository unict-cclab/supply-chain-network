# Set environment variables

source ./env.sh

# Delete namespace and all contained resources
kubectl delete -f $K8S/namespace.yaml

echo Delete temporary directories
rm $TMP_FOLDER/ca-cert.pem
rm -rf $TMP_FOLDER/hyperledger/*
rm -rf $K8S

minikube ssh -- sudo rm -r /cli-regulatory-department-db-volume
minikube ssh -- sudo rm -r /cli-producer-db-volume
minikube ssh -- sudo rm -r /cli-manufacturer-db-volume
minikube ssh -- sudo rm -r /cli-deliverer-db-volume
minikube ssh -- sudo rm -r /cli-retailer-db-volume

minikube stop

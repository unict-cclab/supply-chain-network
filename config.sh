export TMP_FOLDER=tmp
export CA_CLIENT=fabric-ca-client
export K8S=.k8s
export SERVER_STARTUP_TIME=3
export IP="$(minikube ip)"
export PEERS_TLSCACERTS=tls-$( echo ${IP} | tr '.' '-' )-30905.pem





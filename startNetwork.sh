# Exit on errors
set -e

# Function definitions
get_pods() {
  #1 - app name
  kubectl get pods -l app=$1 --field-selector status.phase=Running -n supply-chain-network --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | head -n 1
}

small_sep() {
  printf "%s\n" '---------------------------------------------------------------------------------'
}

sep() {
  printf "%s\n" '================================================================================='
}

command() {
  #1 - command to display
  echo "$1"
}

setup-tls-ca() {
  sep
  command "TLS CA"
  sep

  # Create deployment for tls root ca
  if (($(kubectl get deployment -l app=ca-tls-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating TLS CA deployment"
    kubectl create -f $K8S/tls-ca/tls-ca.yaml -n supply-chain-network
  else
    command "TLS CA deployment already exists"
  fi

  # Expose service for tls root ca
  if (($(kubectl get service -l app=ca-tls-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating TLS CA service"
    kubectl create -f $K8S/tls-ca/tls-ca-service.yaml -n supply-chain-network
  else
    command "TLS CA service already exists"
  fi
  CA_TLS_HOST=$(minikube service ca-tls --url -n supply-chain-network | cut -c 8-)
  command "TLS CA service exposed on $CA_TLS_HOST"
  small_sep

  # Wait until pod and service are ready
  command "Waiting for pod"
  kubectl wait --for=condition=ready pod -l app=ca-tls-root --timeout=120s -n supply-chain-network
  sleep $SERVER_STARTUP_TIME
  TLS_CA_NAME=$(get_pods "ca-tls-root")
  command "Using pod $TLS_CA_NAME"
  small_sep

  # Copy TLS certificate into local tmp folder
  command "Copy TLS certificate to local folder"
  export FABRIC_CA_CLIENT_TLS_CERTFILES=tls-ca-cert.pem
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/tls-ca/admin
  mkdir -p $TMP_FOLDER
  mkdir -p $FABRIC_CA_CLIENT_HOME
  cp $TMP_FOLDER/hyperledger/tls-ca/crypto/ca-cert.pem $TMP_FOLDER/ca-cert.pem

  # Query TLS CA server to enroll an admin identity
  command "Use CA-client to enroll admin"
  small_sep
  cp $TMP_FOLDER/ca-cert.pem $FABRIC_CA_CLIENT_HOME/$FABRIC_CA_CLIENT_TLS_CERTFILES
  ./$CA_CLIENT enroll $DEBUG -u https://tls-ca-admin:tls-ca-adminpw@$CA_TLS_HOST
  small_sep

  # Query TLS CA server to register other identities
  command "Use CA-client to register identities"
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name peer1-regulatory-department --id.secret peer1PW --id.type peer -u https://$CA_TLS_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name peer1-producer --id.secret peer1PW --id.type peer -u https://$CA_TLS_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name peer1-manufacturer --id.secret peer1PW --id.type peer -u https://$CA_TLS_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name peer1-deliverer --id.secret peer1PW --id.type peer -u https://$CA_TLS_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name peer1-retailer --id.secret peer1PW --id.type peer -u https://$CA_TLS_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name orderer --id.secret ordererPW --id.type orderer -u https://$CA_TLS_HOST
}

setup-orderer-org-ca() {
  sep
  command "Orderer Org CA"
  sep

  # Create deployment for orderer org ca
  if (($(kubectl get deployment -l app=rca-orderer-org-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Orderer Org CA deployment"
    kubectl create -f $K8S/orderer-org-ca/orderer-org-ca.yaml -n supply-chain-network
  else
    command "Orderer Org CA deployment already exists"
  fi

  # Expose service for orderer org ca
  if (($(kubectl get service -l app=rca-orderer-org-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Orderer Org CA service"
    kubectl create -f $K8S/orderer-org-ca/orderer-org-ca-service.yaml -n supply-chain-network
  else
    command "Orderer Org CA service already exists"
  fi
  CA_ORDERER_HOST=$(minikube service rca-orderer-org --url -n supply-chain-network | cut -c 8-)
  command "Orderer Org CA service exposed on $CA_ORDERER_HOST"
  small_sep

  # Wait until pod is ready
  command "Waiting for pod"
  kubectl wait --for=condition=ready pod -l app=rca-orderer-org-root --timeout=120s -n supply-chain-network
  sleep $SERVER_STARTUP_TIME
  ORDERER_ORG_CA_NAME=$(get_pods "rca-orderer-org-root")
  command "Using pod $ORDERER_ORG_CA_NAME"
  small_sep

  export FABRIC_CA_CLIENT_TLS_CERTFILES=../crypto/ca-cert.pem
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/orderer-org/ca/admin
  mkdir -p $FABRIC_CA_CLIENT_HOME

  # Query Orderrer CA server to enroll an admin identity
  command "Use CA-client to enroll admin"
  small_sep
  ./$CA_CLIENT enroll $DEBUG -u https://rca-orderer-org-admin:rca-orderer-org-adminpw@$CA_ORDERER_HOST
  small_sep

  # Query TLS CA server to register other identities
  command "Use CA-client to register identities"
  small_sep
  # The id.secret password ca be used to enroll the registered users lateron
  ./$CA_CLIENT register $DEBUG --id.name orderer --id.secret ordererpw --id.type orderer -u https://$CA_ORDERER_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name admin-orderer-org --id.secret orderer-orgadminpw --id.type admin --id.attrs "hf.Registrar.Roles=client,hf.Registrar.Attributes=*,hf.Revoker=true,hf.GenCRL=true,admin=true:ecert,abac.init=true:ecert" -u https://$CA_ORDERER_HOST
}

setup-regulatory-department-ca() {
  sep
  command "RegulatoryDepartment CA"
  sep

  # Create deployment for regulatory-department ca
  if (($(kubectl get deployment -l app=rca-regulatory-department-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating RegulatoryDepartment CA deployment"
    kubectl create -f $K8S/regulatory-department-ca/regulatory-department-ca.yaml -n supply-chain-network
  else
    command "RegulatoryDepartment CA deployment already exists"
  fi

  # Expose service for regulatory-department ca
  if (($(kubectl get service -l app=rca-regulatory-department-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating RegulatoryDepartment CA service"
    kubectl create -f $K8S/regulatory-department-ca/regulatory-department-ca-service.yaml -n supply-chain-network
  else
    command "RegulatoryDepartment CA service already exists"
  fi
  CA_REGULATORY_DEPARTMENT_HOST=$(minikube service rca-regulatory-department --url -n supply-chain-network | cut -c 8-)
  command "RegulatoryDepartment CA service exposed on $CA_REGULATORY_DEPARTMENT_HOST"
  small_sep

  # Wait until pod is ready
  command "Waiting for pod"
  kubectl wait --for=condition=ready pod -l app=rca-regulatory-department-root --timeout=120s -n supply-chain-network
  sleep $SERVER_STARTUP_TIME
  REGULATORY_DEPARTMENT_CA_NAME=$(get_pods "rca-regulatory-department-root")
  command "Using pod $REGULATORY_DEPARTMENT_CA_NAME"
  small_sep

  export FABRIC_CA_CLIENT_TLS_CERTFILES=../crypto/ca-cert.pem
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/regulatory-department/ca/admin
  mkdir -p $FABRIC_CA_CLIENT_HOME

  # Query TLS CA server to enroll an admin identity
  command "Use CA-client to enroll admin"
  small_sep
  ./$CA_CLIENT enroll $DEBUG -u https://rca-regulatory-department-admin:rca-regulatory-department-adminpw@$CA_REGULATORY_DEPARTMENT_HOST
  small_sep

  # Query TLS CA server to register other identities
  command "Use CA-client to register identities"
  small_sep
  # The id.secret password ca be used to enroll the registered users lateron
  ./$CA_CLIENT register $DEBUG --id.name peer1-regulatory-department --id.secret peer1PW --id.type peer -u https://$CA_REGULATORY_DEPARTMENT_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name admin-regulatory-department --id.secret regulatory-departmentAdminPW --id.type user -u https://$CA_REGULATORY_DEPARTMENT_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name user-regulatory-department --id.secret regulatory-departmentUserPW --id.type user -u https://$CA_REGULATORY_DEPARTMENT_HOST
}

setup-producer-ca() {
  sep
  command "Producer CA"
  sep

  # Create deployment for producer ca
  if (($(kubectl get deployment -l app=rca-producer-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Producer CA deployment"
    kubectl create -f $K8S/producer-ca/producer-ca.yaml -n supply-chain-network
  else
    command "Producer CA deployment already exists"
  fi

  # Expose service for producer ca
  if (($(kubectl get service -l app=rca-producer-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Producer CA service"
    kubectl create -f $K8S/producer-ca/producer-ca-service.yaml -n supply-chain-network
  else
    command "Producer CA service already exists"
  fi
  CA_PRODUCER_HOST=$(minikube service rca-producer --url -n supply-chain-network | cut -c 8-)
  command "Producer CA service exposed on $CA_PRODUCER_HOST"
  small_sep

  # Wait until pod is ready
  command "Waiting for pod"
  kubectl wait --for=condition=ready pod -l app=rca-producer-root --timeout=120s -n supply-chain-network
  sleep $SERVER_STARTUP_TIME
  PRODUCER_CA_NAME=$(get_pods "rca-producer-root")
  command "Using pod $PRODUCER_CA_NAME"
  small_sep

  export FABRIC_CA_CLIENT_TLS_CERTFILES=../crypto/ca-cert.pem
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/producer/ca/admin
  mkdir -p $FABRIC_CA_CLIENT_HOME

  # Query TLS CA server to enroll an admin identity
  command "Use CA-client to enroll admin"
  small_sep
  ./$CA_CLIENT enroll $DEBUG -u https://rca-producer-admin:rca-producer-adminpw@$CA_PRODUCER_HOST
  small_sep

  # Query TLS CA server to register other identities
  command "Use CA-client to register identities"
  small_sep
  # The id.secret password ca be used to enroll the registered users lateron
  ./$CA_CLIENT register $DEBUG --id.name peer1-producer --id.secret peer1PW --id.type peer -u https://$CA_PRODUCER_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name admin-producer --id.secret producerAdminPW --id.type user -u https://$CA_PRODUCER_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name user-producer --id.secret producerUserPW --id.type user -u https://$CA_PRODUCER_HOST
}

setup-manufacturer-ca() {
  sep
  command "Manufacturer CA"
  sep

  # Create deployment for manufacturer ca
  if (($(kubectl get deployment -l app=rca-manufacturer-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Manufacturer CA deployment"
    kubectl create -f $K8S/manufacturer-ca/manufacturer-ca.yaml -n supply-chain-network
  else
    command "Manufacturer CA deployment already exists"
  fi

  # Expose service for manufacturer ca
  if (($(kubectl get service -l app=rca-manufacturer-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Manufacturer CA service"
    kubectl create -f $K8S/manufacturer-ca/manufacturer-ca-service.yaml -n supply-chain-network
  else
    command "Manufacturer CA service already exists"
  fi
  CA_MANUFACTURER_HOST=$(minikube service rca-manufacturer --url -n supply-chain-network | cut -c 8-)
  command "Manufacturer CA service exposed on $CA_MANUFACTURER_HOST"
  small_sep

  # Wait until pod is ready
  command "Waiting for pod"
  kubectl wait --for=condition=ready pod -l app=rca-manufacturer-root --timeout=120s -n supply-chain-network
  sleep $SERVER_STARTUP_TIME
  MANUFACTURER_CA_NAME=$(get_pods "rca-manufacturer-root")
  command "Using pod $MANUFACTURER_CA_NAME"
  small_sep

  export FABRIC_CA_CLIENT_TLS_CERTFILES=../crypto/ca-cert.pem
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/manufacturer/ca/admin
  mkdir -p $FABRIC_CA_CLIENT_HOME

  # Query TLS CA server to enroll an admin identity
  command "Use CA-client to enroll admin"
  small_sep
  ./$CA_CLIENT enroll $DEBUG -u https://rca-manufacturer-admin:rca-manufacturer-adminpw@$CA_MANUFACTURER_HOST
  small_sep

  # Query TLS CA server to register other identities
  command "Use CA-client to register identities"
  small_sep
  # The id.secret password ca be used to enroll the registered users lateron
  ./$CA_CLIENT register $DEBUG --id.name peer1-manufacturer --id.secret peer1PW --id.type peer -u https://$CA_MANUFACTURER_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name admin-manufacturer --id.secret manufacturerAdminPW --id.type user -u https://$CA_MANUFACTURER_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name user-manufacturer --id.secret manufacturerUserPW --id.type user -u https://$CA_MANUFACTURER_HOST
}

setup-deliverer-ca() {
  sep
  command "Deliverer CA"
  sep

  # Create deployment for deliverer ca
  if (($(kubectl get deployment -l app=rca-deliverer-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Deliverer CA deployment"
    kubectl create -f $K8S/deliverer-ca/deliverer-ca.yaml -n supply-chain-network
  else
    command "Deliverer CA deployment already exists"
  fi

  # Expose service for deliverer ca
  if (($(kubectl get service -l app=rca-deliverer-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Deliverer CA service"
    kubectl create -f $K8S/deliverer-ca/deliverer-ca-service.yaml -n supply-chain-network
  else
    command "Deliverer CA service already exists"
  fi
  CA_DELIVERER_HOST=$(minikube service rca-deliverer --url -n supply-chain-network | cut -c 8-)
  command "Deliverer CA service exposed on $CA_DELIVERER_HOST"
  small_sep

  # Wait until pod is ready
  command "Waiting for pod"
  kubectl wait --for=condition=ready pod -l app=rca-deliverer-root --timeout=120s -n supply-chain-network
  sleep $SERVER_STARTUP_TIME
  DELIVERER_CA_NAME=$(get_pods "rca-deliverer-root")
  command "Using pod $DELIVERER_CA_NAME"
  small_sep

  export FABRIC_CA_CLIENT_TLS_CERTFILES=../crypto/ca-cert.pem
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/deliverer/ca/admin
  mkdir -p $FABRIC_CA_CLIENT_HOME

  # Query TLS CA server to enroll an admin identity
  command "Use CA-client to enroll admin"
  small_sep
  ./$CA_CLIENT enroll $DEBUG -u https://rca-deliverer-admin:rca-deliverer-adminpw@$CA_DELIVERER_HOST
  small_sep

  # Query TLS CA server to register other identities
  command "Use CA-client to register identities"
  small_sep
  # The id.secret password ca be used to enroll the registered users lateron
  ./$CA_CLIENT register $DEBUG --id.name peer1-deliverer --id.secret peer1PW --id.type peer -u https://$CA_DELIVERER_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name admin-deliverer --id.secret delivererAdminPW --id.type user -u https://$CA_DELIVERER_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name user-deliverer --id.secret delivererUserPW --id.type user -u https://$CA_DELIVERER_HOST
}

setup-retailer-ca() {
  sep
  command "Retailer CA"
  sep

  # Create deployment for retailer ca
  if (($(kubectl get deployment -l app=rca-retailer-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Retailer CA deployment"
    kubectl create -f $K8S/retailer-ca/retailer-ca.yaml -n supply-chain-network
  else
    command "Retailer CA deployment already exists"
  fi

  # Expose service for retailer ca
  if (($(kubectl get service -l app=rca-retailer-root --ignore-not-found -n supply-chain-network | wc -l) < 2)); then
    command "Creating Retailer CA service"
    kubectl create -f $K8S/retailer-ca/retailer-ca-service.yaml -n supply-chain-network
  else
    command "Retailer CA service already exists"
  fi
  CA_RETAILER_HOST=$(minikube service rca-retailer --url -n supply-chain-network | cut -c 8-)
  command "Retailer CA service exposed on $CA_RETAILER_HOST"
  small_sep

  # Wait until pod is ready
  command "Waiting for pod"
  kubectl wait --for=condition=ready pod -l app=rca-retailer-root --timeout=120s -n supply-chain-network
  sleep $SERVER_STARTUP_TIME
  RETAILER_CA_NAME=$(get_pods "rca-retailer-root")
  command "Using pod $RETAILER_CA_NAME"
  small_sep

  export FABRIC_CA_CLIENT_TLS_CERTFILES=../crypto/ca-cert.pem
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/retailer/ca/admin
  mkdir -p $FABRIC_CA_CLIENT_HOME

  # Query TLS CA server to enroll an admin identity
  command "Use CA-client to enroll admin"
  small_sep
  ./$CA_CLIENT enroll $DEBUG -u https://rca-retailer-admin:rca-retailer-adminpw@$CA_RETAILER_HOST
  small_sep

  # Query TLS CA server to register other identities
  command "Use CA-client to register identities"
  small_sep
  # The id.secret password ca be used to enroll the registered users lateron
  ./$CA_CLIENT register $DEBUG --id.name peer1-retailer --id.secret peer1PW --id.type peer -u https://$CA_RETAILER_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name admin-retailer --id.secret retailerAdminPW --id.type user -u https://$CA_RETAILER_HOST
  small_sep
  ./$CA_CLIENT register $DEBUG --id.name user-retailer --id.secret retailerUserPW --id.type user -u https://$CA_RETAILER_HOST
}

enroll-regulatory-department-peers() {
  # Enroll peer 1

  sep
  command "RegulatoryDepartment Peer1"
  sep

  command "Enroll Peer1 at RegulatoryDepartment-CA"

  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/regulatory-department/peer1
  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/ca/regulatory-department-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp

  # We need to copy the certificate of RegulatoryDepartment-CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/ca
  cp $TMP_FOLDER/hyperledger/regulatory-department/ca/crypto/ca-cert.pem $FABRIC_CA_CLIENT_HOME/$FABRIC_CA_CLIENT_TLS_CERTFILES

  ./$CA_CLIENT enroll $DEBUG -u https://peer1-regulatory-department:peer1PW@$CA_REGULATORY_DEPARTMENT_HOST

  small_sep

  command "Enroll Peer1 at TLS-CA"

  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/tls-ca/tls-ca-cert.pem

  # We need to copy the certificate of the TLS CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/tls-ca
  cp $TMP_FOLDER/hyperledger/tls-ca/admin/tls-ca-cert.pem $FABRIC_CA_CLIENT_HOME/assets/tls-ca/tls-ca-cert.pem

  export FABRIC_CA_CLIENT_MSPDIR=tls-msp
  ./$CA_CLIENT enroll $DEBUG -u https://peer1-regulatory-department:peer1PW@$CA_TLS_HOST --enrollment.profile tls --csr.hosts peer1-regulatory-department

  mv $TMP_FOLDER/hyperledger/regulatory-department/peer1/tls-msp/keystore/*_sk $TMP_FOLDER/hyperledger/regulatory-department/peer1/tls-msp/keystore/key.pem

  # Enroll RegulatoryDepartment admin

  sep
  command "RegulatoryDepartment Admin"
  sep

  command "Enroll regulatory-department admin identity"

  # Note that we assume that peer 1 holds the admin identity
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/regulatory-department/admin
  export FABRIC_CA_CLIENT_TLS_CERTFILES=../../regulatory-department/peer1/assets/ca/regulatory-department-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp
  ./$CA_CLIENT enroll $DEBUG -u https://admin-regulatory-department:regulatory-departmentAdminPW@$CA_REGULATORY_DEPARTMENT_HOST

  small_sep

  command "Distribute admin certificate across peers"

  mkdir $TMP_FOLDER/hyperledger/regulatory-department/peer1/msp/admincerts
  cp $TMP_FOLDER/hyperledger/regulatory-department/admin/msp/signcerts/cert.pem $TMP_FOLDER/hyperledger/regulatory-department/peer1/msp/admincerts/regulatory-department-admin-cert.pem
}

enroll-producer-peers() {
  # Enroll peer 1

  sep
  command "Producer Peer1"
  sep

  command "Enroll Peer1 at Producer-CA"

  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/producer/peer1
  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/ca/producer-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp

  # We need to copy the certificate of Producer-CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/ca
  cp $TMP_FOLDER/hyperledger/producer/ca/crypto/ca-cert.pem $FABRIC_CA_CLIENT_HOME/$FABRIC_CA_CLIENT_TLS_CERTFILES

  ./$CA_CLIENT enroll $DEBUG -u https://peer1-producer:peer1PW@$CA_PRODUCER_HOST

  small_sep

  command "Enroll Peer1 at TLS-CA"

  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/tls-ca/tls-ca-cert.pem

  # We need to copy the certificate of the TLS CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/tls-ca
  cp $TMP_FOLDER/hyperledger/tls-ca/admin/tls-ca-cert.pem $FABRIC_CA_CLIENT_HOME/assets/tls-ca/tls-ca-cert.pem

  export FABRIC_CA_CLIENT_MSPDIR=tls-msp
  ./$CA_CLIENT enroll $DEBUG -u https://peer1-producer:peer1PW@$CA_TLS_HOST --enrollment.profile tls --csr.hosts peer1-producer

  mv $TMP_FOLDER/hyperledger/producer/peer1/tls-msp/keystore/*_sk $TMP_FOLDER/hyperledger/producer/peer1/tls-msp/keystore/key.pem

  # Enroll Producer admin

  sep
  command "Producer Admin"
  sep

  command "Enroll producer admin identity"

  # Note that we assume that peer 1 holds the admin identity
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/producer/admin
  export FABRIC_CA_CLIENT_TLS_CERTFILES=../../producer/peer1/assets/ca/producer-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp
  ./$CA_CLIENT enroll $DEBUG -u https://admin-producer:producerAdminPW@$CA_PRODUCER_HOST

  small_sep

  command "Distribute admin certificate across peers"

  mkdir $TMP_FOLDER/hyperledger/producer/peer1/msp/admincerts
  cp $TMP_FOLDER/hyperledger/producer/admin/msp/signcerts/cert.pem $TMP_FOLDER/hyperledger/producer/peer1/msp/admincerts/producer-admin-cert.pem
}

enroll-manufacturer-peers() {
  # Enroll peer 1

  sep
  command "Manufacturer Peer1"
  sep

  command "Enroll Peer1 at Manufacturer-CA"

  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/manufacturer/peer1
  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/ca/manufacturer-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp

  # We need to copy the certificate of Manufacturer-CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/ca
  cp $TMP_FOLDER/hyperledger/manufacturer/ca/crypto/ca-cert.pem $FABRIC_CA_CLIENT_HOME/$FABRIC_CA_CLIENT_TLS_CERTFILES

  ./$CA_CLIENT enroll $DEBUG -u https://peer1-manufacturer:peer1PW@$CA_MANUFACTURER_HOST

  small_sep

  command "Enroll Peer1 at TLS-CA"

  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/tls-ca/tls-ca-cert.pem

  # We need to copy the certificate of the TLS CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/tls-ca
  cp $TMP_FOLDER/hyperledger/tls-ca/admin/tls-ca-cert.pem $FABRIC_CA_CLIENT_HOME/assets/tls-ca/tls-ca-cert.pem

  export FABRIC_CA_CLIENT_MSPDIR=tls-msp
  ./$CA_CLIENT enroll $DEBUG -u https://peer1-manufacturer:peer1PW@$CA_TLS_HOST --enrollment.profile tls --csr.hosts peer1-manufacturer

  mv $TMP_FOLDER/hyperledger/manufacturer/peer1/tls-msp/keystore/*_sk $TMP_FOLDER/hyperledger/manufacturer/peer1/tls-msp/keystore/key.pem

  # Enroll Manufacturer admin

  sep
  command "Manufacturer Admin"
  sep

  command "Enroll manufacturer admin identity"

  # Note that we assume that peer 1 holds the admin identity
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/manufacturer/admin
  export FABRIC_CA_CLIENT_TLS_CERTFILES=../../manufacturer/peer1/assets/ca/manufacturer-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp
  ./$CA_CLIENT enroll $DEBUG -u https://admin-manufacturer:manufacturerAdminPW@$CA_MANUFACTURER_HOST

  small_sep

  command "Distribute admin certificate across peers"

  mkdir $TMP_FOLDER/hyperledger/manufacturer/peer1/msp/admincerts
  cp $TMP_FOLDER/hyperledger/manufacturer/admin/msp/signcerts/cert.pem $TMP_FOLDER/hyperledger/manufacturer/peer1/msp/admincerts/manufacturer-admin-cert.pem
}

enroll-deliverer-peers() {
  # Enroll peer 1

  sep
  command "Deliverer Peer1"
  sep

  command "Enroll Peer1 at Deliverer-CA"

  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/deliverer/peer1
  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/ca/deliverer-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp

  # We need to copy the certificate of Deliverer-CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/ca
  cp $TMP_FOLDER/hyperledger/deliverer/ca/crypto/ca-cert.pem $FABRIC_CA_CLIENT_HOME/$FABRIC_CA_CLIENT_TLS_CERTFILES

  ./$CA_CLIENT enroll $DEBUG -u https://peer1-deliverer:peer1PW@$CA_DELIVERER_HOST

  small_sep

  command "Enroll Peer1 at TLS-CA"

  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/tls-ca/tls-ca-cert.pem

  # We need to copy the certificate of the TLS CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/tls-ca
  cp $TMP_FOLDER/hyperledger/tls-ca/admin/tls-ca-cert.pem $FABRIC_CA_CLIENT_HOME/assets/tls-ca/tls-ca-cert.pem

  export FABRIC_CA_CLIENT_MSPDIR=tls-msp
  ./$CA_CLIENT enroll $DEBUG -u https://peer1-deliverer:peer1PW@$CA_TLS_HOST --enrollment.profile tls --csr.hosts peer1-deliverer

  mv $TMP_FOLDER/hyperledger/deliverer/peer1/tls-msp/keystore/*_sk $TMP_FOLDER/hyperledger/deliverer/peer1/tls-msp/keystore/key.pem

  # Enroll Deliverer admin

  sep
  command "Deliverer Admin"
  sep

  command "Enroll deliverer admin identity"

  # Note that we assume that peer 1 holds the admin identity
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/deliverer/admin
  export FABRIC_CA_CLIENT_TLS_CERTFILES=../../deliverer/peer1/assets/ca/deliverer-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp
  ./$CA_CLIENT enroll $DEBUG -u https://admin-deliverer:delivererAdminPW@$CA_DELIVERER_HOST

  small_sep

  command "Distribute admin certificate across peers"

  mkdir $TMP_FOLDER/hyperledger/deliverer/peer1/msp/admincerts
  cp $TMP_FOLDER/hyperledger/deliverer/admin/msp/signcerts/cert.pem $TMP_FOLDER/hyperledger/deliverer/peer1/msp/admincerts/deliverer-admin-cert.pem
}

enroll-retailer-peers() {
  # Enroll peer 1

  sep
  command "Retailer Peer1"
  sep

  command "Enroll Peer1 at Retailer-CA"

  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/retailer/peer1
  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/ca/retailer-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp

  # We need to copy the certificate of Retailer-CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/ca
  cp $TMP_FOLDER/hyperledger/retailer/ca/crypto/ca-cert.pem $FABRIC_CA_CLIENT_HOME/$FABRIC_CA_CLIENT_TLS_CERTFILES

  ./$CA_CLIENT enroll $DEBUG -u https://peer1-retailer:peer1PW@$CA_RETAILER_HOST

  small_sep

  command "Enroll Peer1 at TLS-CA"

  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/tls-ca/tls-ca-cert.pem

  # We need to copy the certificate of the TLS CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/tls-ca
  cp $TMP_FOLDER/hyperledger/tls-ca/admin/tls-ca-cert.pem $FABRIC_CA_CLIENT_HOME/assets/tls-ca/tls-ca-cert.pem

  export FABRIC_CA_CLIENT_MSPDIR=tls-msp
  ./$CA_CLIENT enroll $DEBUG -u https://peer1-retailer:peer1PW@$CA_TLS_HOST --enrollment.profile tls --csr.hosts peer1-retailer

  mv $TMP_FOLDER/hyperledger/retailer/peer1/tls-msp/keystore/*_sk $TMP_FOLDER/hyperledger/retailer/peer1/tls-msp/keystore/key.pem

  # Enroll Retailer admin

  sep
  command "Retailer Admin"
  sep

  command "Enroll retailer admin identity"

  # Note that we assume that peer 1 holds the admin identity
  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/retailer/admin
  export FABRIC_CA_CLIENT_TLS_CERTFILES=../../retailer/peer1/assets/ca/retailer-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp
  ./$CA_CLIENT enroll $DEBUG -u https://admin-retailer:retailerAdminPW@$CA_RETAILER_HOST

  small_sep

  command "Distribute admin certificate across peers"

  mkdir $TMP_FOLDER/hyperledger/retailer/peer1/msp/admincerts
  cp $TMP_FOLDER/hyperledger/retailer/admin/msp/signcerts/cert.pem $TMP_FOLDER/hyperledger/retailer/peer1/msp/admincerts/retailer-admin-cert.pem
}

start-regulatory-department-peer1() {
  sep
  command "Starting RegulatoryDepartment Peer1"
  sep

  kubectl create -f "$K8S/regulatory-department-peer1/regulatory-department-peer1.yaml" -n supply-chain-network
  kubectl create -f "$K8S/regulatory-department-peer1/regulatory-department-peer1-service.yaml" -n supply-chain-network
}

start-producer-peer1() {
  sep
  command "Starting Producer Peer1"
  sep

  kubectl create -f "$K8S/producer-peer1/producer-peer1.yaml" -n supply-chain-network
  kubectl create -f "$K8S/producer-peer1/producer-peer1-service.yaml" -n supply-chain-network
}

start-manufacturer-peer1() {
  sep
  command "Starting Manufacturer Peer1"
  sep

  kubectl create -f "$K8S/manufacturer-peer1/manufacturer-peer1.yaml" -n supply-chain-network
  kubectl create -f "$K8S/manufacturer-peer1/manufacturer-peer1-service.yaml" -n supply-chain-network
}

start-deliverer-peer1() {
  sep
  command "Starting Deliverer Peer1"
  sep

  kubectl create -f "$K8S/deliverer-peer1/deliverer-peer1.yaml" -n supply-chain-network
  kubectl create -f "$K8S/deliverer-peer1/deliverer-peer1-service.yaml" -n supply-chain-network
}

start-retailer-peer1() {
  sep
  command "Starting Retailer Peer1"
  sep

  kubectl create -f "$K8S/retailer-peer1/retailer-peer1.yaml" -n supply-chain-network
  kubectl create -f "$K8S/retailer-peer1/retailer-peer1-service.yaml" -n supply-chain-network
}

setup-orderer() {
  # Enroll orderer

  sep
  command "Orderer"
  sep

  command "Enroll Orderer at OrdererOrg enrollment ca"

  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/orderer-org/orderer
  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/ca/orderer-org-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp

  # We need to copy the certificate of OrdererOrg-CA into our tmp directory
  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/ca
  cp $TMP_FOLDER/hyperledger/orderer-org/ca/crypto/ca-cert.pem $FABRIC_CA_CLIENT_HOME/$FABRIC_CA_CLIENT_TLS_CERTFILES

  ./$CA_CLIENT enroll $DEBUG -u https://orderer:ordererpw@$CA_ORDERER_HOST

  small_sep

  command "Enroll Orderer at TLS Ca"

  export FABRIC_CA_CLIENT_MSPDIR=tls-msp
  export FABRIC_CA_CLIENT_TLS_CERTFILES=assets/tls-ca/tls-ca-cert.pem

  mkdir -p $FABRIC_CA_CLIENT_HOME/assets/tls-ca
  cp $TMP_FOLDER/hyperledger/tls-ca/admin/tls-ca-cert.pem $FABRIC_CA_CLIENT_HOME/assets/tls-ca/tls-ca-cert.pem

  ./$CA_CLIENT enroll $DEBUG -u https://orderer:ordererPW@$CA_TLS_HOST --enrollment.profile tls --csr.hosts orderer

  mv $TMP_FOLDER/hyperledger/orderer-org/orderer/tls-msp/keystore/*_sk $TMP_FOLDER/hyperledger/orderer-org/orderer/tls-msp/keystore/key.pem

  small_sep

  command "Enroll OrdererOrg's Admin"

  export FABRIC_CA_CLIENT_HOME=$TMP_FOLDER/hyperledger/orderer-org/admin
  export FABRIC_CA_CLIENT_TLS_CERTFILES=../orderer/assets/ca/orderer-org-ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp
  ./$CA_CLIENT enroll $DEBUG -u https://admin-orderer-org:orderer-orgadminpw@$CA_ORDERER_HOST

  mkdir -p $TMP_FOLDER/hyperledger/orderer-org/orderer/msp/admincerts
  cp $TMP_FOLDER/hyperledger/orderer-org/admin/msp/signcerts/cert.pem $TMP_FOLDER/hyperledger/orderer-org/orderer/msp/admincerts/orderer-admin-cert.pem

  setup-orderer-msp

  sep "Generate genesis block"
  ./configtxgen -profile OrgsOrdererGenesis -outputBlock $TMP_FOLDER/hyperledger/orderer-org/orderer/genesis.block -channelID syschannel
  ./configtxgen -profile OrgsChannel -outputCreateChannelTx $TMP_FOLDER/hyperledger/orderer-org/orderer/channel.tx -channelID mychannel

  sep
  command "Starting Orderer"
  sep

  kubectl create -f "$K8S/orderer/orderer.yaml" -n supply-chain-network
  kubectl create -f "$K8S/orderer/orderer-service.yaml" -n supply-chain-network
}

setup-orderer-msp() {
  #Create shared directory directory
  mkdir -p $TMP_FOLDER/hyperledger/shared

  # Create MSP directory for orderer-org
  export MSP_DIR=$TMP_FOLDER/hyperledger/orderer-org/msp
  mkdir -p $MSP_DIR
  mkdir -p $MSP_DIR/admincerts
  mkdir -p $MSP_DIR/cacerts
  mkdir -p $MSP_DIR/tlscacerts
  mkdir -p $MSP_DIR/users
  cp $TMP_FOLDER/hyperledger/orderer-org/admin/msp/signcerts/cert.pem $MSP_DIR/admincerts/admin-orderer-org-cert.pem
  cp $TMP_FOLDER/hyperledger/orderer-org/ca/crypto/ca-cert.pem $MSP_DIR/cacerts/orderer-org-ca-cert.pem
  cp $TMP_FOLDER/ca-cert.pem $MSP_DIR/tlscacerts/tls-ca-cert.pem

  mkdir -p $TMP_FOLDER/hyperledger/shared/orderer-org
  cp -R $MSP_DIR $TMP_FOLDER/hyperledger/shared/orderer-org

  # Create MSP directory for regulatory-department
  export MSP_DIR=$TMP_FOLDER/hyperledger/regulatory-department/msp
  mkdir -p $MSP_DIR
  mkdir -p $MSP_DIR/admincerts
  mkdir -p $MSP_DIR/cacerts
  mkdir -p $MSP_DIR/tlscacerts
  mkdir -p $MSP_DIR/users
  cp $TMP_FOLDER/hyperledger/regulatory-department/admin/msp/signcerts/cert.pem $MSP_DIR/admincerts/admin-regulatory-department-cert.pem
  cp $TMP_FOLDER/hyperledger/regulatory-department/ca/crypto/ca-cert.pem $MSP_DIR/cacerts/regulatory-department-ca-cert.pem
  cp $TMP_FOLDER/ca-cert.pem $MSP_DIR/tlscacerts/tls-ca-cert.pem

  mkdir -p $TMP_FOLDER/hyperledger/shared/regulatory-department
  cp -R $MSP_DIR $TMP_FOLDER/hyperledger/shared/regulatory-department

  # Create MSP directory for producer
  export MSP_DIR=$TMP_FOLDER/hyperledger/producer/msp
  mkdir -p $MSP_DIR
  mkdir -p $MSP_DIR/admincerts
  mkdir -p $MSP_DIR/cacerts
  mkdir -p $MSP_DIR/tlscacerts
  mkdir -p $MSP_DIR/users
  cp $TMP_FOLDER/hyperledger/producer/admin/msp/signcerts/cert.pem $MSP_DIR/admincerts/admin-producer-cert.pem
  cp $TMP_FOLDER/hyperledger/producer/ca/crypto/ca-cert.pem $MSP_DIR/cacerts/producer-ca-cert.pem
  cp $TMP_FOLDER/ca-cert.pem $MSP_DIR/tlscacerts/tls-ca-cert.pem

  mkdir -p $TMP_FOLDER/hyperledger/shared/producer
  cp -R $MSP_DIR $TMP_FOLDER/hyperledger/shared/producer

  # Create MSP directory for manufacturer
  export MSP_DIR=$TMP_FOLDER/hyperledger/manufacturer/msp
  mkdir -p $MSP_DIR
  mkdir -p $MSP_DIR/admincerts
  mkdir -p $MSP_DIR/cacerts
  mkdir -p $MSP_DIR/tlscacerts
  mkdir -p $MSP_DIR/users
  cp $TMP_FOLDER/hyperledger/manufacturer/admin/msp/signcerts/cert.pem $MSP_DIR/admincerts/admin-manufacturer-cert.pem
  cp $TMP_FOLDER/hyperledger/manufacturer/ca/crypto/ca-cert.pem $MSP_DIR/cacerts/manufacturer-ca-cert.pem
  cp $TMP_FOLDER/ca-cert.pem $MSP_DIR/tlscacerts/tls-ca-cert.pem

  mkdir -p $TMP_FOLDER/hyperledger/shared/manufacturer
  cp -R $MSP_DIR $TMP_FOLDER/hyperledger/shared/manufacturer

  # Create MSP directory for deliverer
  export MSP_DIR=$TMP_FOLDER/hyperledger/deliverer/msp
  mkdir -p $MSP_DIR
  mkdir -p $MSP_DIR/admincerts
  mkdir -p $MSP_DIR/cacerts
  mkdir -p $MSP_DIR/tlscacerts
  mkdir -p $MSP_DIR/users
  cp $TMP_FOLDER/hyperledger/deliverer/admin/msp/signcerts/cert.pem $MSP_DIR/admincerts/admin-deliverer-cert.pem
  cp $TMP_FOLDER/hyperledger/deliverer/ca/crypto/ca-cert.pem $MSP_DIR/cacerts/deliverer-ca-cert.pem
  cp $TMP_FOLDER/ca-cert.pem $MSP_DIR/tlscacerts/tls-ca-cert.pem

  mkdir -p $TMP_FOLDER/hyperledger/shared/deliverer
  cp -R $MSP_DIR $TMP_FOLDER/hyperledger/shared/deliverer

  # Create MSP directory for retailer
  export MSP_DIR=$TMP_FOLDER/hyperledger/retailer/msp
  mkdir -p $MSP_DIR
  mkdir -p $MSP_DIR/admincerts
  mkdir -p $MSP_DIR/cacerts
  mkdir -p $MSP_DIR/tlscacerts
  mkdir -p $MSP_DIR/users
  cp $TMP_FOLDER/hyperledger/retailer/admin/msp/signcerts/cert.pem $MSP_DIR/admincerts/admin-retailer-cert.pem
  cp $TMP_FOLDER/hyperledger/retailer/ca/crypto/ca-cert.pem $MSP_DIR/cacerts/retailer-ca-cert.pem
  cp $TMP_FOLDER/ca-cert.pem $MSP_DIR/tlscacerts/tls-ca-cert.pem

  mkdir -p $TMP_FOLDER/hyperledger/shared/retailer
  cp -R $MSP_DIR $TMP_FOLDER/hyperledger/shared/retailer
}

start-couchdbs() {
  sep
  command "Starting RegulatoryDepartment CouchDB"
  sep

  kubectl create -f $K8S/couchdb0/couchdb0.yaml -n supply-chain-network
  kubectl create -f $K8S/couchdb0/couchdb0-service.yaml -n supply-chain-network

  sep
  command "Starting Producer CouchDB"
  sep

  kubectl create -f $K8S/couchdb1/couchdb1.yaml -n supply-chain-network
  kubectl create -f $K8S/couchdb1/couchdb1-service.yaml -n supply-chain-network

  sep
  command "Starting Manufacturer CouchDB"
  sep

  kubectl create -f $K8S/couchdb2/couchdb2.yaml -n supply-chain-network
  kubectl create -f $K8S/couchdb2/couchdb2-service.yaml -n supply-chain-network

  sep
  command "Starting Deliverer CouchDB"
  sep

  kubectl create -f $K8S/couchdb3/couchdb3.yaml -n supply-chain-network
  kubectl create -f $K8S/couchdb3/couchdb3-service.yaml -n supply-chain-network

  sep
  command "Starting Retailer CouchDB"
  sep

  kubectl create -f $K8S/couchdb4/couchdb4.yaml -n supply-chain-network
  kubectl create -f $K8S/couchdb4/couchdb4-service.yaml -n supply-chain-network

  kubectl wait --for=condition=ready pod -l app=couchdb0 --timeout=120s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=couchdb1 --timeout=120s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=couchdb2 --timeout=120s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=couchdb3 --timeout=120s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=couchdb4 --timeout=120s -n supply-chain-network
}

start-clis() {
  
  mkdir -p $TMP_FOLDER/hyperledger/app/regulatory-department-cli
  cp -a app/. $TMP_FOLDER/hyperledger/app/regulatory-department-cli

  mkdir -p $TMP_FOLDER/hyperledger/app/producer-cli
  cp -a app/. $TMP_FOLDER/hyperledger/app/producer-cli

  mkdir -p $TMP_FOLDER/hyperledger/app/manufacturer-cli
  cp -a app/. $TMP_FOLDER/hyperledger/app/manufacturer-cli

  mkdir -p $TMP_FOLDER/hyperledger/app/deliverer-cli
  cp -a app/. $TMP_FOLDER/hyperledger/app/deliverer-cli

  mkdir -p $TMP_FOLDER/hyperledger/app/retailer-cli
  cp -a app/. $TMP_FOLDER/hyperledger/app/retailer-cli

  sep
  command "Building cli image"
  sep

  eval $(minikube docker-env)
  docker build -t cli ./dockerfiles/cli

  sep
  command "Starting RegulatoryDepartment CLI"
  sep

  kubectl create configmap regulatory-department-cli-db-env-file --from-env-file=$K8S/regulatory-department-cli/regulatory-department-cli-db-env-file.properties -n supply-chain-network --save-config
  kubectl get configmap regulatory-department-cli-db-env-file -o yaml > $K8S/regulatory-department-cli/regulatory-department-cli-db-configmap.yml -n supply-chain-network
  kubectl create secret generic regulatory-department-cli-db-secret-file --from-env-file=$K8S/regulatory-department-cli/regulatory-department-cli-db-secret-file.properties --save-config -n supply-chain-network
  kubectl get secret regulatory-department-cli-db-secret-file -o yaml > $K8S/regulatory-department-cli/regulatory-department-cli-db-secret-file.yml -n supply-chain-network

  kubectl apply -f "$K8S/regulatory-department-cli/regulatory-department-cli-db-configmap.yml" -n supply-chain-network
  kubectl apply -f "$K8S/regulatory-department-cli/regulatory-department-cli-db-secret-file.yml" -n supply-chain-network
  kubectl apply -f "$K8S/regulatory-department-cli/regulatory-department-cli-db.yaml" -n supply-chain-network
  
  # Provide admincerts to admin msp
  d=$TMP_FOLDER/hyperledger/regulatory-department/admin/msp/admincerts/
  mkdir -p "$d" && cp $TMP_FOLDER/hyperledger/regulatory-department/msp/admincerts/admin-regulatory-department-cert.pem "$d"

  # Copy channel.tx from orderer to peer1 to create the initial channel
  cp $TMP_FOLDER/hyperledger/orderer-org/orderer/channel.tx $TMP_FOLDER/hyperledger/regulatory-department/peer1/assets/

  sep
  command "Starting Producer CLI"
  sep

  kubectl create configmap producer-cli-db-env-file --from-env-file=$K8S/producer-cli/producer-cli-db-env-file.properties --save-config -n supply-chain-network
  kubectl get configmap producer-cli-db-env-file -o yaml > $K8S/producer-cli/producer-cli-db-configmap.yml -n supply-chain-network
  kubectl create secret generic producer-cli-db-secret-file --from-env-file=$K8S/producer-cli/producer-cli-db-secret-file.properties --save-config -n supply-chain-network
  kubectl get secret producer-cli-db-secret-file -o yaml > $K8S/producer-cli/producer-cli-db-secret-file.yml -n supply-chain-network

  kubectl apply -f "$K8S/producer-cli/producer-cli-db-configmap.yml" -n supply-chain-network
  kubectl apply -f "$K8S/producer-cli/producer-cli-db-secret-file.yml" -n supply-chain-network
  kubectl apply -f "$K8S/producer-cli/producer-cli-db.yaml" -n supply-chain-network
  
  # Provide admincerts to admin msp
  d=$TMP_FOLDER/hyperledger/producer/admin/msp/admincerts/
  mkdir -p "$d" && cp $TMP_FOLDER/hyperledger/producer/msp/admincerts/admin-producer-cert.pem "$d"

  sep
  command "Starting Manufacturer CLI"
  sep

  kubectl create configmap manufacturer-cli-db-env-file --from-env-file=$K8S/manufacturer-cli/manufacturer-cli-db-env-file.properties --save-config -n supply-chain-network
  kubectl get configmap manufacturer-cli-db-env-file -o yaml > $K8S/manufacturer-cli/manufacturer-cli-db-configmap.yml -n supply-chain-network
  kubectl create secret generic manufacturer-cli-db-secret-file --from-env-file=$K8S/manufacturer-cli/manufacturer-cli-db-secret-file.properties --save-config -n supply-chain-network
  kubectl get secret manufacturer-cli-db-secret-file -o yaml > $K8S/manufacturer-cli/manufacturer-cli-db-secret-file.yml -n supply-chain-network

  kubectl apply -f "$K8S/manufacturer-cli/manufacturer-cli-db-configmap.yml" -n supply-chain-network
  kubectl apply -f "$K8S/manufacturer-cli/manufacturer-cli-db-secret-file.yml" -n supply-chain-network
  kubectl apply -f "$K8S/manufacturer-cli/manufacturer-cli-db.yaml" -n supply-chain-network
  
  # Provide admincerts to admin msp
  d=$TMP_FOLDER/hyperledger/manufacturer/admin/msp/admincerts/
  mkdir -p "$d" && cp $TMP_FOLDER/hyperledger/manufacturer/msp/admincerts/admin-manufacturer-cert.pem "$d"

  sep
  command "Starting Deliverer CLI"
  sep

  kubectl create configmap deliverer-cli-db-env-file --from-env-file=$K8S/deliverer-cli/deliverer-cli-db-env-file.properties --save-config -n supply-chain-network
  kubectl get configmap deliverer-cli-db-env-file -o yaml > $K8S/deliverer-cli/deliverer-cli-db-configmap.yml -n supply-chain-network
  kubectl create secret generic deliverer-cli-db-secret-file --from-env-file=$K8S/deliverer-cli/deliverer-cli-db-secret-file.properties --save-config -n supply-chain-network
  kubectl get secret deliverer-cli-db-secret-file -o yaml > $K8S/deliverer-cli/deliverer-cli-db-secret-file.yml -n supply-chain-network

  kubectl apply -f "$K8S/deliverer-cli/deliverer-cli-db-configmap.yml" -n supply-chain-network
  kubectl apply -f "$K8S/deliverer-cli/deliverer-cli-db-secret-file.yml" -n supply-chain-network
  kubectl apply -f "$K8S/deliverer-cli/deliverer-cli-db.yaml" -n supply-chain-network
  
  # Provide admincerts to admin msp
  d=$TMP_FOLDER/hyperledger/deliverer/admin/msp/admincerts/
  mkdir -p "$d" && cp $TMP_FOLDER/hyperledger/deliverer/msp/admincerts/admin-deliverer-cert.pem "$d"

  sep
  command "Starting Retailer CLI"
  sep

  kubectl create configmap retailer-cli-db-env-file --from-env-file=$K8S/retailer-cli/retailer-cli-db-env-file.properties --save-config -n supply-chain-network
  kubectl get configmap retailer-cli-db-env-file -o yaml > $K8S/retailer-cli/retailer-cli-db-configmap.yml -n supply-chain-network
  kubectl create secret generic retailer-cli-db-secret-file --from-env-file=$K8S/retailer-cli/retailer-cli-db-secret-file.properties --save-config -n supply-chain-network
  kubectl get secret retailer-cli-db-secret-file -o yaml > $K8S/retailer-cli/retailer-cli-db-secret-file.yml -n supply-chain-network

  kubectl apply -f "$K8S/retailer-cli/retailer-cli-db-configmap.yml" -n supply-chain-network
  kubectl apply -f "$K8S/retailer-cli/retailer-cli-db-secret-file.yml" -n supply-chain-network
  kubectl apply -f "$K8S/retailer-cli/retailer-cli-db.yaml" -n supply-chain-network
  
  # Provide admincerts to admin msp
  d=$TMP_FOLDER/hyperledger/retailer/admin/msp/admincerts/
  mkdir -p "$d" && cp $TMP_FOLDER/hyperledger/retailer/msp/admincerts/admin-retailer-cert.pem "$d"

  kubectl wait --for=condition=ready pod -l app=cli-regulatory-department-db --timeout=240s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=cli-producer-db --timeout=240s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=cli-manufacturer-db --timeout=240s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=cli-deliverer-db --timeout=240s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=cli-retailer-db --timeout=240s -n supply-chain-network
  
  sleep 20

  kubectl apply -f "$K8S/regulatory-department-cli/regulatory-department-cli.yaml" -n supply-chain-network
  kubectl apply -f "$K8S/producer-cli/producer-cli.yaml" -n supply-chain-network
  kubectl apply -f "$K8S/manufacturer-cli/manufacturer-cli.yaml" -n supply-chain-network
  kubectl apply -f "$K8S/deliverer-cli/deliverer-cli.yaml" -n supply-chain-network
  kubectl apply -f "$K8S/retailer-cli/retailer-cli.yaml" -n supply-chain-network

  kubectl wait --for=condition=ready pod -l app=cli-regulatory-department --timeout=240s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=cli-producer --timeout=240s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=cli-manufacturer --timeout=240s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=cli-deliverer --timeout=240s -n supply-chain-network
  kubectl wait --for=condition=ready pod -l app=cli-retailer --timeout=240s -n supply-chain-network
  

}

setup-dind() {
  sep
  command "Starting Docker in Docker in Kubernetes"
  sep

  mkdir -p $TMP_FOLDER/hyperledger/dind

  kubectl create -f "$K8S/dind/dind.yaml" -n supply-chain-network
  kubectl create -f "$K8S/dind/dind-service.yaml" -n supply-chain-network
}

create-channel() {
  sep
  command "Creating channel using CLI_REGULATORY_DEPARTMENT on RegulatoryDepartment Peer1"
  sep

  mkdir -p $TMP_FOLDER/hyperledger/scripts

  cp -a scripts/. $TMP_FOLDER/hyperledger/scripts

  CLI_REGULATORY_DEPARTMENT=$(get_pods "cli-regulatory-department")

  # Use CLI shell to create channel
  #source ./settings.sh
  #envsubst <scripts/createChannel.sh>$TMP_FOLDER/.createChannel.sh

  kubectl exec -n supply-chain-network $CLI_REGULATORY_DEPARTMENT -- /bin/bash -c "/tmp/hyperledger/scripts/createChannel.sh regulatory-department"
  #rm $TMP_FOLDER/.createChannel.sh

  # Copy mychannel.block from peer1-regulatory-department to peer1-producer
  cp $TMP_FOLDER/hyperledger/regulatory-department/peer1/assets/mychannel.block $TMP_FOLDER/hyperledger/producer/peer1/assets/mychannel.block

  # Copy mychannel.block from peer1-regulatory-department to peer1-manufacturer
  cp $TMP_FOLDER/hyperledger/regulatory-department/peer1/assets/mychannel.block $TMP_FOLDER/hyperledger/manufacturer/peer1/assets/mychannel.block

  # Copy mychannel.block from peer1-regulatory-department to peer1-deliverer
  cp $TMP_FOLDER/hyperledger/regulatory-department/peer1/assets/mychannel.block $TMP_FOLDER/hyperledger/deliverer/peer1/assets/mychannel.block

  # Copy mychannel.block from peer1-regulatory-department to peer1-retailer
  cp $TMP_FOLDER/hyperledger/regulatory-department/peer1/assets/mychannel.block $TMP_FOLDER/hyperledger/retailer/peer1/assets/mychannel.block

  sep
  command "Joining channel using CLI_REGULATORY_DEPARTMENT on RegulatoryDepartment Peer1"
  sep

  sleep 3

  kubectl exec -n supply-chain-network $CLI_REGULATORY_DEPARTMENT -- /bin/bash -c "/tmp/hyperledger/scripts/joinChannel.sh regulatory-department"

  sep
  command "Joining channel using CLI_PRODUCER on Producer Peer1"
  sep

  CLI_PRODUCER=$(get_pods "cli-producer")

  kubectl exec -n supply-chain-network $CLI_PRODUCER -- /bin/bash -c "/tmp/hyperledger/scripts/joinChannel.sh producer"

  sep
  command "Joining channel using CLI_MANUFACTURER on Manufacturer Peer1"
  sep

  CLI_MANUFACTURER=$(get_pods "cli-manufacturer")

  kubectl exec -n supply-chain-network $CLI_MANUFACTURER -- /bin/bash -c "/tmp/hyperledger/scripts/joinChannel.sh manufacturer"

  sep
  command "Joining channel using CLI_DELIVERER on Deliverer Peer1"
  sep

  CLI_DELIVERER=$(get_pods "cli-deliverer")

  kubectl exec -n supply-chain-network $CLI_DELIVERER -- /bin/bash -c "/tmp/hyperledger/scripts/joinChannel.sh deliverer"

  sep
  command "Joining channel using CLI_RETAILER on Retailer Peer1"
  sep

  CLI_RETAILER=$(get_pods "cli-retailer")

  kubectl exec -n supply-chain-network $CLI_RETAILER -- /bin/bash -c "/tmp/hyperledger/scripts/joinChannel.sh retailer"

  sep
  command "Adding anchor peer using CLI_REGULATORY_DEPARTMENT on RegulatoryDepartment Peer1"
  sep

  kubectl exec -n supply-chain-network $CLI_REGULATORY_DEPARTMENT -- /bin/bash -c "/tmp/hyperledger/scripts/addAnchorPeer.sh regulatory-department"

  sep
  command "Adding anchor peer using CLI_PRODUCER on Producer Peer1"
  sep

  kubectl exec -n supply-chain-network $CLI_PRODUCER -- /bin/bash -c "/tmp/hyperledger/scripts/addAnchorPeer.sh producer"

  sep
  command "Adding anchor peer using CLI_MANUFACTURER on Manufacturer Peer1"
  sep

  kubectl exec -n supply-chain-network $CLI_MANUFACTURER -- /bin/bash -c "/tmp/hyperledger/scripts/addAnchorPeer.sh manufacturer"

  sep
  command "Adding anchor peer using CLI_DELIVERER on Deliverer Peer1"
  sep

  kubectl exec -n supply-chain-network $CLI_DELIVERER -- /bin/bash -c "/tmp/hyperledger/scripts/addAnchorPeer.sh deliverer"

  sep
  command "Adding anchor peer using CLI_RETAILER on Retailer Peer1"
  sep

  kubectl exec -n supply-chain-network $CLI_RETAILER -- /bin/bash -c "/tmp/hyperledger/scripts/addAnchorPeer.sh retailer"
}

start-ingress() {
  kubectl create -f "$K8S/ingress/ingress.yaml" -n supply-chain-network
}


# Debug commands using -d flag
export DEBUG=""
if [[ $1 == "-d" ]]; then
  command "Debug mode activated"
  export DEBUG="-d"
fi

# Set environment variables
source ./env.sh

# Start minikube
if minikube status | grep -q 'host: Stopped'; then
  command "Starting Network"
  minikube start
fi

# Use configuration file to generate kubernetes setup from the template
./applyConfig.sh

mkdir -p $TMP_FOLDER/hyperledger

# Mount tmp folder
small_sep
command "Mounting tmp folder to minikube"
minikube mount $TMP_FOLDER/hyperledger:/hyperledger &
sleep 3

small_sep
kubectl create -f $K8S/namespace.yaml

setup-tls-ca
setup-orderer-org-ca
setup-regulatory-department-ca
setup-producer-ca
setup-manufacturer-ca
setup-deliverer-ca
setup-retailer-ca

enroll-regulatory-department-peers
enroll-producer-peers
enroll-manufacturer-peers
enroll-deliverer-peers
enroll-retailer-peers

start-couchdbs

start-regulatory-department-peer1
start-producer-peer1
start-manufacturer-peer1
start-deliverer-peer1
start-retailer-peer1

setup-orderer
setup-dind
start-clis

sleep 5

create-channel

start-ingress

sep

echo -e "Done. Execute \e[2mminikube dashboard\e[22m to open the dashboard or run \e[2m./deleteNetwork.sh\e[22m to shutdown and delete the network."

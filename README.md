# Blockchain traceability system for agri-food supply chain

This is an example of a blockchain traceability system for agri-food supply chain implemented with Hyperledger Fabric platform. System components are deployed inside a Kubernetes cluster. Assuming you are using minikube do the following steps to deploy blockchain system, deploy chaincode and start client application.

- Create cluster

If you do not have started yet a Kubernetes cluster run the following command:

```
minikube start --cpus=4 --memory 6120
```

- Start network

To start the network of the system run the following script:

```
./startNetwork.sh
```

- Install chaincode

To install the chaincode inside peers of each organization run the following script:

```
./installChaincode.sh
```

- Approve and commit chaincode definition

To approve and commit the chaincode definition for each organization run the following script:

```
./approveAndCommitChaincode.sh
```

- Interact with the system

Execute the following command to add hostnames inside the hosts file:

```
echo "$(minikube ip) \
supply-chain-network.local \
regulatory-department.local \
producer.local \
manufacturer.local \
deliverer.local \
retailer.local" \
| sudo tee -a /etc/hosts
```
Use the url (organization_name).local:80 to connect to the corresponding organization frontend application

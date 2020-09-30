# Blockchain traceability system for agri-food supply chain

This is an example of a blockchain traceability system for agri-food supply chain implemented with Hyperledger Fabric platform. System components are deployed inside a Kubernetes cluster. Do the following steps to deploy blockchain system, deploy chaincode and start client application.

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

- Expose cluster 

To expose cluster outside the minikube virtual machine run the following scripts:

```
	./exposeCluster.sh
```

- Interact with the system

Below there are domain name and port for web servers of each organization:

```
    regulatory-department.local:51926
    producer.local:51926
    manufacturer.local:51926
    deliverer.local:51926
    retailer.local:51926
```

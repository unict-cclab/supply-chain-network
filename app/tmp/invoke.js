'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-profile.yaml');
        const ccp = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));


        // Create a new file system based wallet for managing identities.
        const walletPath = path.resolve(__dirname, 'identity/user/user-regulatory-department/wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('user-regulatory-department');
        if (!identity) {
            console.log('An identity for the user "user-regulatory-department" does not exist in the wallet');
            console.log('Run the enrollUser.js application before retrying');
            return;
        }
        
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();

        //console.dir(ccp,{depth:null});
        
        await gateway.connect(ccp, { wallet, identity: 'user-regulatory-department', discovery: { enabled: true, asLocalhost: false }, clientTlsIdentity: 'user-regulatory-department'});
        // Get the network (channel) our contract is deployed to.
        
        const network = await gateway.getNetwork('mychannel');
        
        // Get the contract from the network.
        const contract = network.getContract('supplyChain');

        let result = '';

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        
        //result = await contract.submitTransaction('init');
        const args = ['addRoleSet','ProducerMSP',JSON.stringify(['producer'])];
        result = await contract.submitTransaction(...args);
        /*
        result = await contract.submitTransaction('addRoleSet','ManufacturerMSP',JSON.stringify(['manufacturer']));
        result = await contract.submitTransaction('addRoleSet','DelivererMSP',JSON.stringify(['deliverer']));
        result = await contract.submitTransaction('addRoleSet','RetailerMSP',JSON.stringify(['retailer']));
        result = await contract.submitTransaction('addProductType','orange', 'primary',JSON.stringify([]));
        result = await contract.submitTransaction('addProductType','sugar', 'primary',JSON.stringify([]));
        result = await contract.submitTransaction('addProductType','orange-juice', 'derived',JSON.stringify(['orange','sugar']));
        result = await contract.submitTransaction('unblockProductType','orange');
        result = await contract.submitTransaction('unblockProductType','sugar');
        result = await contract.submitTransaction('unblockProductType','orange-juice');
        result = await contract.submitTransaction('addRule','orange','isDefined(params.temp) && params.temp > 20 && params.temp < 30');
        */
        //result = await contract.submitTransaction('enableRule','orange:805a5bd94004de33a07f716c68cda9151a363cbc734505c0a821783c07dec2e8');
        /*
        result = await contract.submitTransaction('acceptProductRegistration','orangeZ');
        result = await contract.submitTransaction('acceptProductRegistration','sugarZ');
        */           
        //result = await contract.submitTransaction('acceptProductRegistration','orange-juiceZ');
           
        //result = await contract.submitTransaction('blockProduct','orange-juiceZ');
        //result = await contract.submitTransaction('unblockProduct','orange-juiceZ');
        //result = await contract.submitTransaction('blockBatch','orangeZ:57e426b5aa9fc7dc96cb9ad440639873df31e99711ac6bd1eac68982fb8eccf7');
        //result = await contract.submitTransaction('unblockBatch','orange-juiceZ:067a07c704b92fe4a0a66bfe1b5c7a5dc912d3032a888d72309b651b45fd5727');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        //console.dir(error);
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
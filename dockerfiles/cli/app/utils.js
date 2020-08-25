'use strict';

const crypto = require('crypto');
const FabricCAServices = require('fabric-ca-client');
const { Gateway, Wallets, DefaultEventHandlerStrategies } = require('fabric-network');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const User = require('./models/user');

function addUserToDb(username, password, role) {

  const user = new User();
  user.username = username;
  user.password = new Buffer(
      crypto.createHash('sha256').update(password, 'utf8').digest()
    ).toString('base64');
  user.role = role; 
  user.save(function(err){
    if(err) {
      if (err.code === 11000)
        console.log('This username is already taken');
    }
    else
      console.log('User succesfully added to DB');
  });

};

async function enrollUser(username, password) {
  
  // load the network configuration
  const ccpPath = path.resolve(__dirname, 'connection-profile.yaml');
  const ccp = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));

  // Create a new CA client for interacting with the CA.
  const caInfo = ccp.certificateAuthorities[process.env.ORG_CA_HOST];
  const caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path);
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

  // Create a new file system based wallet for managing identities.
  const walletPath = path.resolve(__dirname, 'identity/user/' + username + '/wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  
  // Check to see if we've already enrolled the user.
  const userExists = await wallet.get(username);
  if (userExists)
    throw new Error('An identity for the client user ' + username + ' already exists in the wallet');
  
    // Enroll the admin user, and import the new identity into the wallet.
  const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: password });
  const x509Identity = {
      credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
      },
      mspId: process.env.ORG_MSP_ID,
      type: 'X.509',
  };
  await wallet.put(username, x509Identity);

}

async function registerAndEnrollUser(username) {
  
  // load the network configuration
  const ccpPath = path.resolve(__dirname, 'connection-profile.yaml');
  const ccp = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));

  // Create a new CA client for interacting with the CA.
  const caInfo = ccp.certificateAuthorities[process.env.ORG_CA_HOST];
  const caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path);
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

  // Create a new file system based wallet for managing admin identity.
  const userWalletPath = path.resolve(__dirname, 'identity/user/' + username + '/wallet');
  const userWallet = await Wallets.newFileSystemWallet(userWalletPath);

  // Check to see if we've already enrolled the user.
  const userIdentity = await userWallet.get(username);
  if (userIdentity)
    throw new Error('An identity for the client user ' + username + ' already exists in the wallet');
    
  // Create a new file system based wallet for managing admin identity.
  const rcaAdminWalletPath = path.resolve(__dirname, 'identity/user/'+ process.env.RCA_ADMIN_USERNAME +'/wallet');
  const rcaAdminWallet = await Wallets.newFileSystemWallet(rcaAdminWalletPath);

  // Check to see if we've already enrolled the admin user.
  const rcaAdminIdentity = await rcaAdminWallet.get(process.env.RCA_ADMIN_USERNAME);
  if (!rcaAdminIdentity)
    throw new Error('An identity for the admin user ' + process.env.RCA_ADMIN_USERNAME + ' does not exist in the wallet');

  // build a user object for authenticating with the CA
  const provider = rcaAdminWallet.getProviderRegistry().getProvider(rcaAdminIdentity.type);
  const rcaAdminUser = await provider.getUserContext(rcaAdminIdentity, process.env.RCA_ADMIN_USERNAME);

  // Register the user, enroll the user, and import the new identity into the wallet.
  const secret = await ca.register({
      enrollmentID: username,
      role: 'user'
  }, rcaAdminUser);
  const enrollment = await ca.enroll({
      enrollmentID: username,
      enrollmentSecret: secret
  });
  const x509Identity = {
      credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
      },
      mspId: process.env.ORG_MSP_ID,
      type: 'X.509',
  };
  await userWallet.put(username, x509Identity);

}

async function submitTransaction(username, args) {

  // load the network configuration
  const ccpPath = path.resolve(__dirname, 'connection-profile.yaml');
  const ccp = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));

  // Create a new file system based wallet for managing identities.
  const walletPath = path.resolve(__dirname, 'identity/user/' + username + '/wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  
  // Check to see if we've already enrolled the user.
  const identity = await wallet.get(username);
  if (!identity)
    throw new Error('An identity for the user ' + username + ' does not exist in the wallet');
  
  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  
  await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: false }, clientTlsIdentity: username, eventHandlerOptions: {
    strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
  }});
  // Get the network (channel) our contract is deployed to.
  
  const network = await gateway.getNetwork('mychannel');
  
  // Get the contract from the network.
  const contract = network.getContract('supplyChain');
  
  const result = await contract.submitTransaction(...args);
  
  // Disconnect from the gateway.
  await gateway.disconnect();

  return result.toString();
}

async function evaluateTransaction(username, args) {

  // load the network configuration
  const ccpPath = path.resolve(__dirname, 'connection-profile.yaml');
  const ccp = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));

  // Create a new file system based wallet for managing identities.
  const walletPath = path.resolve(__dirname, 'identity/user/' + username + '/wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  
  // Check to see if we've already enrolled the user.
  const identity = await wallet.get(username);
  if (!identity)
    throw new Error('An identity for the user ' + username + ' does not exist in the wallet');
  
  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  
  await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: false }, clientTlsIdentity: username});
  // Get the network (channel) our contract is deployed to.
  
  const network = await gateway.getNetwork('mychannel');
  
  // Get the contract from the network.
  const contract = network.getContract('supplyChain');
  
  const result = await contract.evaluateTransaction(...args);
  
  // Disconnect from the gateway.
  await gateway.disconnect();

  return result.toString();
}

module.exports.addUserToDb = addUserToDb;
module.exports.enrollUser = enrollUser;
module.exports.registerAndEnrollUser = registerAndEnrollUser;
module.exports.submitTransaction = submitTransaction;
module.exports.evaluateTransaction = evaluateTransaction;

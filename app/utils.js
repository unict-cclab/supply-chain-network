'use strict';

const crypto = require('crypto');
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const User = require('./models/user');

function addAdminUserToDb(username, password) {

  const adminUser = new User();
  adminUser.username = username;
  adminUser.password = new Buffer(
      crypto.createHash('sha256').update(password, 'utf8').digest()
    ).toString('base64');
  adminUser.type = "admin"; 
  adminUser.save(function(err){
    if(err)
      if (err.code === 11000)
        console.log('This username is already taken');
  });

};

async function enrollAdminUser(username, password) {

  try {
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
    if (userExists) {
        console.log('An identity for the client user ' + username + ' already exists in the wallet');
        return;
    }

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
    console.log('Successfully enrolled client user '+ username +' and imported it into the wallet');

  } catch (error) {
    console.error(`Failed to enroll client user ${username}: ${error}`);
  }

}

async function registerAndEnrollUser(username, password) {

  try {
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
    if (userIdentity) {
        console.log('An identity for the client user ' + username + ' already exists in the wallet');
        return;
    }

    // Create a new file system based wallet for managing admin identity.
    const adminWalletPath = path.resolve(__dirname, 'identity/user/'+ process.env.ADMIN_USERNAME +'/wallet');
    const adminWallet = await Wallets.newFileSystemWallet(adminWalletPath);

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await adminWallet.get(process.env.ADMIN_USERNAME);
    if (!adminIdentity) {
        console.log('An identity for the admin user ' + process.env.ADMIN_USERNAME + ' does not exist in the wallet');
        return;
    }

    // build a user object for authenticating with the CA
    const provider = adminWallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, process.env.ADMIN_USERNAME);

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({
        enrollmentID: username,
        role: 'user'
    }, adminUser);
    const enrollment = await ca.enroll({
        enrollmentID: username,
        enrollmentSecret: password
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
    console.log('Successfully registered and enrolled user ' + username + 'and imported it into the wallet');

} catch (error) {
    console.error(`Failed to register user ${username}: ${error}`);
}

}

module.exports.addAdminUserToDb = addAdminUserToDb;
module.exports.enrollAdminUser = enrollAdminUser;
module.exports.registerAndEnrollUser = registerAndEnrollUser;
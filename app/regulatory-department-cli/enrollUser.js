
'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-profile.yaml');
        const ccp = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['rca-regulatory-department'];
        const caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path);
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.resolve(__dirname, 'identity/user/user-regulatory-department/wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        // Check to see if we've already enrolled the admin user.
        const userExists = await wallet.get('user-regulatory-department');
        if (userExists) {
            console.log('An identity for the client user "user-regulatory-department" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'user-regulatory-department', enrollmentSecret: 'regulatory-departmentUserPW' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'RegulatoryDepartmentMSP',
            type: 'X.509',
        };
        await wallet.put('user-regulatory-department', x509Identity);
        console.log('Successfully enrolled client user "user-regulatory-department" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll client user "user-regulatory-department": ${error}`);
        process.exit(1);
    }
}

main();
const express = require('express');
const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const app = express();
const execPromise = util.promisify(exec);

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Base path for Hyperledger Fabric network
const fabricBasePath = path.resolve(__dirname, '../test-network');

// POST endpoint to run commands
app.post('/run-command', async (req, res) => {
  const { commandType, assetDetails } = req.body;
  let command;

  // Build command based on the command type
  switch (commandType.toLowerCase()) {
    case 'create':
      command = `peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls --cafile ${fabricBasePath}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem \
        --channelID mychannel --name basic \
        --peerAddresses localhost:7051 --tlsRootCertFiles ${fabricBasePath}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem \
        --peerAddresses localhost:9051 --tlsRootCertFiles ${fabricBasePath}/organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem \
        -c '{"function":"CreateAsset","Args":["${assetDetails.id}","${assetDetails.owner}","${assetDetails.description}","${assetDetails.value}"]}'`;
      break;

    case 'query':
      command = `peer chaincode query --channelID mychannel --name basic \
        --tls --cafile ${fabricBasePath}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem \
        --peerAddresses localhost:7051 --tlsRootCertFiles ${fabricBasePath}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem \
        -c '{"function":"QueryAsset","Args":["${assetDetails.id}"]}'`;
      break;

    case 'update':
      command = `peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls --cafile ${fabricBasePath}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem \
        --channelID mychannel --name basic \
        --peerAddresses localhost:7051 --tlsRootCertFiles ${fabricBasePath}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem \
        --peerAddresses localhost:9051 --tlsRootCertFiles ${fabricBasePath}/organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem \
        -c '{"function":"UpdateAsset","Args":["${assetDetails.id}","${assetDetails.description}","${assetDetails.value}"]}'`;
      break;

    case 'transfer':
      command = `peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls --cafile ${fabricBasePath}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem \
        --channelID mychannel --name basic \
        --peerAddresses localhost:7051 --tlsRootCertFiles ${fabricBasePath}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem \
        --peerAddresses localhost:9051 --tlsRootCertFiles ${fabricBasePath}/organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem \
        -c '{"function":"TransferAsset","Args":["${assetDetails.id}","${assetDetails.newOwner}"]}'`;
      break;

    default:
      return res.status(400).send('Invalid command type');
  }

  // Execute the command
  try {
    console.log(`Executing command: ${command}`);  // Log the command
    const { stdout, stderr } = await execPromise(command);
    res.json({ output: stdout, error: stderr });
  } catch (error) {
    console.error(`Error executing command: ${error.message}`); // Log any error
    res.status(500).send(`Error executing command: ${error.message}`);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

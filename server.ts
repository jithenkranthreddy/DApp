// server.ts
import express, { Request, Response } from 'express';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
const { ethers } = require('ethers');
const cors = require('cors');




const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const PORT = 3001;

const infuraProjectId = '8cc09cc95f6941d8a63fcfe4ef9a2018';
const infuraNetwork = 'sepolia';
// const contractAddress = '0x07eedafc7727176873c353d6c2dddd6d895bd97e';
const contractAddress = '0xa4d0faa45b1ee3159f07e9fe515f6a89a0dd0805';
const contractAbi: AbiItem[] = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "adminAddress",
				"type": "address"
			}
		],
		"name": "demoteAdmin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "adminAddress",
				"type": "address"
			}
		],
		"name": "promoteAdmin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_email",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_profilePicture",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "_encryptedData",
				"type": "bytes32"
			}
		],
		"name": "registerUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_email",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_profilePicture",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "_encryptedData",
				"type": "bytes32"
			}
		],
		"name": "updateUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "email",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "profilePicture",
				"type": "string"
			}
		],
		"name": "UserRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "email",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "profilePicture",
				"type": "string"
			}
		],
		"name": "UserUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			}
		],
		"name": "getUser",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "email",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "profilePicture",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const web3 = new Web3(new Web3.providers.HttpProvider(`https://${infuraNetwork}.infura.io/v3/${infuraProjectId}`));
const contract = new web3.eth.Contract(contractAbi, contractAddress);
const privateKey = '4ec9c2c9b769ec3b6d955b460257a82aee558a3c7d82dbef12160f99d98d1935';

async function sendTransaction(userAddress: string, method: string, params: any[]): Promise<any> {
  const data = contract.methods[method](...params).encodeABI();
  const nonce = await web3.eth.getTransactionCount(userAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 3000000; // Adjust gas limit as needed
  const tx = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(gasLimit),
      to: contractAddress,
      data: data,
  };
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction || '');
  console.log(txReceipt.transactionHash)
  return txReceipt.transactionHash;
}
function bytesToString(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex'); // Convert to hexadecimal string
}





export async function getUser(userAddress: string): Promise<{ name: string; email: string; profilePicture: string } | null> {
  try {
    const result: [string, string, string, string, number] = await contract.methods.getUser(userAddress).call();
    if (result[3] !== '0') { // Check if encryptedData is not empty
      return { name: result[0], email: result[1], profilePicture: result[2] };
    } else {
      return null; // Return null if user not found or encryptedData is empty
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null; // Return null if there's an error
  }
}


export async function promoteAdmin(adminAddress: string, senderAddress: string): Promise<void> {
  await contract.methods.promoteAdmin(adminAddress).send({ from: senderAddress });
}

export async function demoteAdmin(adminAddress: string, senderAddress: string): Promise<void> {
  await contract.methods.demoteAdmin(adminAddress).send({ from: senderAddress });
}



// Example function to interact with blockchain
app.get('/api/getBalance/:address', async (req: Request, res: Response) => {
  const { address } = req.params;
  const balance = await web3.eth.getBalance(address);
  res.json({ balance: web3.utils.fromWei(balance, 'ether') });
});


app.post('/register', async (req: Request, res: Response) => {
  const { userAddress, name, email, profilePicture, encryptedData } = req.body.data;
  try {
    // await registerUser(userAddress, name, email, profilePicture, encryptedData);
    const txHash = await sendTransaction(userAddress, 'registerUser', [name, email, profilePicture, encryptedData]);
    res.status(200).json({ message: 'User registered successfully', tx: txHash });
  } catch (error) {
    const errorMessage = (error as Error).message || 'An error occurred';
    res.status(500).json({ error: errorMessage });  }
});

// Endpoint to update user details
app.put('/update', async (req: Request, res: Response) => {
  const { userAddress, name, email, profilePicture, encryptedData } = req.body.data;
  try {
    const txHash = await sendTransaction(userAddress, 'updateUser', [name, email, profilePicture, encryptedData]);
    // await updateUser(userAddress, name, email, profilePicture, encryptedData);
    res.status(200).json({ message: 'User details updated successfully', tx: txHash });
  } catch (error) {
    const errorMessage = (error as Error).message || 'An error occurred';
    res.status(500).json({ error: errorMessage });  }
});

// Endpoint to get user details
app.get('/user/:address', async (req: Request, res: Response) => {
  const userAddress = req.params.address;
  try {
    const userDetails = await getUser(userAddress);
    res.status(200).json(userDetails);
  } catch (error) {
    const errorMessage = (error as Error).message || 'An error occurred';
    res.status(500).json({ error: errorMessage });  }
});

// Endpoint to promote an admin
app.post('/admin/promote', async (req: Request, res: Response) => {
  const { adminAddress, senderAddress } = req.body;
  try {
    await promoteAdmin(adminAddress, senderAddress);
    res.status(200).json({ message: 'Admin promoted successfully' });
  } catch (error) {
    const errorMessage = (error as Error).message || 'An error occurred';
    res.status(500).json({ error: errorMessage });  }
});

// Endpoint to demote an admin
app.post('/admin/demote', async (req: Request, res: Response) => {
  const { adminAddress, senderAddress } = req.body;
  try {
    await demoteAdmin(adminAddress, senderAddress);
    res.status(200).json({ message: 'Admin demoted successfully' });
  } catch (error) {
    const errorMessage = (error as Error).message || 'An error occurred';
    res.status(500).json({ error: errorMessage });  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
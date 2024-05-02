"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoteAdmin = exports.promoteAdmin = exports.getUser = void 0;
// server.ts
const express_1 = __importDefault(require("express"));
const web3_1 = __importDefault(require("web3"));
const { ethers } = require('ethers');
const cors = require('cors');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cors());
const PORT = 3001;
const infuraProjectId = '8cc09cc95f6941d8a63fcfe4ef9a2018';
const infuraNetwork = 'sepolia';
// const contractAddress = '0x07eedafc7727176873c353d6c2dddd6d895bd97e';
const contractAddress = '0xa4d0faa45b1ee3159f07e9fe515f6a89a0dd0805';
const contractAbi = [
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
];
const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(`https://${infuraNetwork}.infura.io/v3/${infuraProjectId}`));
const contract = new web3.eth.Contract(contractAbi, contractAddress);
const privateKey = '4ec9c2c9b769ec3b6d955b460257a82aee558a3c7d82dbef12160f99d98d1935';
function sendTransaction(userAddress, method, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = contract.methods[method](...params).encodeABI();
        const nonce = yield web3.eth.getTransactionCount(userAddress);
        const gasPrice = yield web3.eth.getGasPrice();
        const gasLimit = 3000000; // Adjust gas limit as needed
        const tx = {
            nonce: web3.utils.toHex(nonce),
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            to: contractAddress,
            data: data,
        };
        const signedTx = yield web3.eth.accounts.signTransaction(tx, privateKey);
        const txReceipt = yield web3.eth.sendSignedTransaction(signedTx.rawTransaction || '');
        console.log(txReceipt.transactionHash);
        return txReceipt.transactionHash;
    });
}
function bytesToString(bytes) {
    return Buffer.from(bytes).toString('hex'); // Convert to hexadecimal string
}
function getUser(userAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield contract.methods.getUser(userAddress).call();
            if (result[3] !== '0') { // Check if encryptedData is not empty
                return { name: result[0], email: result[1], profilePicture: result[2] };
            }
            else {
                return null; // Return null if user not found or encryptedData is empty
            }
        }
        catch (error) {
            console.error('Error fetching user:', error);
            return null; // Return null if there's an error
        }
    });
}
exports.getUser = getUser;
function promoteAdmin(adminAddress, senderAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        yield contract.methods.promoteAdmin(adminAddress).send({ from: senderAddress });
    });
}
exports.promoteAdmin = promoteAdmin;
function demoteAdmin(adminAddress, senderAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        yield contract.methods.demoteAdmin(adminAddress).send({ from: senderAddress });
    });
}
exports.demoteAdmin = demoteAdmin;
// Example function to interact with blockchain
app.get('/api/getBalance/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address } = req.params;
    const balance = yield web3.eth.getBalance(address);
    res.json({ balance: web3.utils.fromWei(balance, 'ether') });
}));
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userAddress, name, email, profilePicture, encryptedData } = req.body;
    try {
        // await registerUser(userAddress, name, email, profilePicture, encryptedData);
        const txHash = yield sendTransaction(userAddress, 'registerUser', [name, email, profilePicture, encryptedData]);
        res.status(200).json({ message: 'User registered successfully', tx: txHash });
    }
    catch (error) {
        const errorMessage = error.message || 'An error occurred';
        res.status(500).json({ error: errorMessage });
    }
}));
// Endpoint to update user details
app.put('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userAddress, name, email, profilePicture, encryptedData } = req.body.data;
    console.log(req.body.data);
    try {
        const txHash = yield sendTransaction(userAddress, 'updateUser', [name, email, profilePicture, encryptedData]);
        // await updateUser(userAddress, name, email, profilePicture, encryptedData);
        res.status(200).json({ message: 'User details updated successfully', tx: txHash });
    }
    catch (error) {
        const errorMessage = error.message || 'An error occurred';
        res.status(500).json({ error: errorMessage });
    }
}));
// Endpoint to get user details
app.get('/user/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userAddress = req.params.address;
    try {
        const userDetails = yield getUser(userAddress);
        res.status(200).json(userDetails);
    }
    catch (error) {
        const errorMessage = error.message || 'An error occurred';
        res.status(500).json({ error: errorMessage });
    }
}));
// Endpoint to promote an admin
app.post('/admin/promote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { adminAddress, senderAddress } = req.body;
    try {
        yield promoteAdmin(adminAddress, senderAddress);
        res.status(200).json({ message: 'Admin promoted successfully' });
    }
    catch (error) {
        const errorMessage = error.message || 'An error occurred';
        res.status(500).json({ error: errorMessage });
    }
}));
// Endpoint to demote an admin
app.post('/admin/demote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { adminAddress, senderAddress } = req.body;
    try {
        yield demoteAdmin(adminAddress, senderAddress);
        res.status(200).json({ message: 'Admin demoted successfully' });
    }
    catch (error) {
        const errorMessage = error.message || 'An error occurred';
        res.status(500).json({ error: errorMessage });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

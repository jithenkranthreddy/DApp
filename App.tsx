import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';
import { ethers } from "ethers";
import User from './User/User'
import FormComponent from './Form/Form';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState([]);
  const [edituser, setEdituser] = useState();

  const connectToMetaMask= async()=>{
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
      } catch (error) {
        setError('User denied account access');
      }
    } else {
      setError('No Ethereum provider detected');
    }
  }
  
  const fetchAccounts = async () => {
    if (web3) {
      try {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/user/${accounts[0]}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const responseData = await response.json();
      setUser(responseData);
    } catch (error) {
      setError('Failed to fetch data');
    }
  };

  useEffect(()=>{
    fetchAccounts();
  },[web3])

  useEffect(()=>{
    if(accounts.length > 0){
      fetchData();
    }
  },[accounts])

const handleEdit=(data: any)=>{
  setEdituser(data);
}

const handleAfterSubmit=()=>{
  fetchData();
}

  return (
    <div className="App">
      <header className="">
      {accounts.length > 0 ? (
        <>
          <p>Connected Account: {accounts[0]}</p>
            <User data={[user]} handleEdit={handleEdit}/>
            <FormComponent address={accounts[0]} user={edituser} handleAfterSubmit={handleAfterSubmit}/>
            </>
          
        ) : (
          <div>
            <p>Click the button below to connect your MetaMask wallet:</p>
            <button onClick={connectToMetaMask}>Connect to MetaMask</button>
          </div>
        )}
        {error && <p>Error: {error}</p>}      </header>
    </div>
  );
}

export default App;

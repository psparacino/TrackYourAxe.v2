// src/context/state.js
import { createContext, useContext } from 'react';

// import useContractObjectRepo from '../hooks/useContractRepo';

import { useState, useEffect } from "react";
import { ethers } from 'ethers';


//context

import { useUserContext } from "../context/UserContext";

//abis

import Mothership from '../../artifacts/contracts/Mothership.sol/Mothership.json';
import InstrumentDeedToken from '../../artifacts/contracts/InstrumentDeedToken.sol/InstrumentDeedToken.json';

//addresses

import deployedTokenAddress from '../deployedContractAddresses/instrumenttokenaddress.json';
import deployedMothershipAddress from '../deployedContractAddresses/mothershipaddress.json';

const ContractContext= createContext();

export function ContractContextProvider({ children }) {

//   const { MothershipContract, TokenContract } = useContractObjectRepo()

const { provider, modalProvider, signer } = useUserContext();
// console.log(signer, "top signer check")
 
const [MothershipContract, setMothershipContract] = useState('');
const [TokenContract, setTokenContract] = useState('');



//need to adjust this hook for non-Ethereum
    useEffect(async()=> {


        contractObjects();
  
        async function contractObjects() {

            
            if (signer) {

            //MothershipContract
            const MothershipContractAddress = deployedMothershipAddress.address;
            const MothershipContractObject = new ethers.Contract(MothershipContractAddress, Mothership.abi, signer);
            setMothershipContract(MothershipContractObject);

            //TokenContract (need to put this in here Mothership and Provenance)
            const TokenContractAddress = deployedTokenAddress.address;
            const TokenContractObject = new ethers.Contract(TokenContractAddress, InstrumentDeedToken.abi, signer);
            setTokenContract(TokenContractObject);
        }

        }

    },[signer]) 

  const state = { MothershipContract, TokenContract };


  return (
    <ContractContext.Provider value={state}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContractContext() {
  return useContext(ContractContext);
}
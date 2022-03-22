import { useState, useEffect } from "react";

import { ethers } from 'ethers';

//import { injectedProvider } from '../components/wallet/connectors.js';
//import { useWeb3React } from "@web3-react/core"

//context

import { useUserContext } from "../context/UserContext";

//abis

import Mothership from '../../artifacts/contracts/Mothership.sol/Mothership.json';
import InstrumentDeedToken from '../../artifacts/contracts/InstrumentDeedToken.sol/InstrumentDeedToken.json';

//addresses

import deployedTokenAddress from '../deployedContractAddresses/instrumenttokenaddress.json';
import deployedMothershipAddress from '../deployedContractAddresses/mothershipaddress.json';






const useContractObjectRepo = () => {
    
    
    const [MothershipContract, setMothershipContract] = useState('');
    const [TokenContract, setTokenContract] = useState('');

    const { provider, signer } = useUserContext();

    //need to adjust this hook for non-Ethereum
    useEffect(async()=> {
          if (window.ethereum) {
            contractObjects();
          } else {
            alert("please install Metamask")
          }
          async function contractObjects() {

            //const provider = new ethers.providers.Web3Provider(window.ethereum);
            //const signer = provider.getSigner(0);
            const contextSigner = await signer;
            
            if (signer) {
            //MothershipContract
            const MothershipContractAddress = deployedMothershipAddress.address;
            const MothershipContractObject = new ethers.Contract(MothershipContractAddress, Mothership.abi, contextSigner);
            setMothershipContract(MothershipContractObject);

            //TokenContract (need to put this in here Mothership and Provenance)
            const TokenContractAddress = deployedTokenAddress.address;
            const TokenContractObject = new ethers.Contract(TokenContractAddress, InstrumentDeedToken.abi, contextSigner);
            setTokenContract(TokenContractObject);
          }

        }

    },[signer]) 

    return { MothershipContract, TokenContract};
}

export default useContractObjectRepo;

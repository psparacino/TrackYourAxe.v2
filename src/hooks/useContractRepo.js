import { useState, useEffect } from "react";

import { ethers } from 'ethers';

//import { injectedProvider } from '../components/wallet/connectors.js';
//import { useWeb3React } from "@web3-react/core"

//abis

import Mothership from '../../artifacts/contracts/Mothership.sol/Mothership.json';
import InstrumentDeedToken from '../../artifacts/contracts/InstrumentDeedToken.sol/InstrumentDeedToken.json';

//addresses

import deployedTokenAddress from '../deployedContractAddresses/instrumenttokenaddress.json';
import deployedMothershipAddress from '../deployedContractAddresses/mothershipaddress.json';






const useContractObjectRepo = () => {
    
    
    const [MothershipContract, setMothershipContract] = useState('');
    const [TokenContract, setTokenContract] = useState('');

    //need to adjust this hook for non-Ethereum
    useEffect(()=> {
          if (window.ethereum) {
            contractObjects();
          } else {
            alert("please install Metamask")
          }
          async function contractObjects() {

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(0);
            
            //MothershipContract
            const MothershipContractAddress = deployedMothershipAddress.address;
            console.log(MothershipContractAddress, "address")
            const MothershipContractObject = await new ethers.Contract(MothershipContractAddress, Mothership.abi, signer);
            setMothershipContract(MothershipContractObject);

            //TokenContract (need to put this in here Mothership and Provenance)
            const TokenContractAddress = deployedTokenAddress.address;
            const TokenContractObject = await new ethers.Contract(TokenContractAddress, InstrumentDeedToken.abi, signer);
            setTokenContract(TokenContractObject);

        }

    },[]) 
    return { MothershipContract, TokenContract };
}

export default useContractObjectRepo;

// src/context/state.js
import { createContext, useContext, useState, useEffect } from 'react';

//ethers
import { ethers } from 'ethers';

//abi
import Provenance from '../../artifacts/contracts/Provenance.sol/Provenance.json';

//context imports
import { useUserContext } from './UserContext.js';
import { useContractContext} from './ContractContext.js'


const TransferContext= createContext();

export function TransferContextProvider({ children }) {
    const { MothershipContract } = useContractContext();
    const { mainAccount, provider, signer } = useUserContext();
    const [ pendingTransferContracts, setPendingTransferContracts ] = useState();

    //load all pending transfers
    useEffect(async() => {
      if (MothershipContract) {
        populateTransfers()
        .then(result => console.log(result, "transfer populate result"))
        .catch(error => console.log(error, 'populate error'));
      }
      async function populateTransfers() {
        let transferArray = [];
        let transferItems;
        
          if (mainAccount) {
          transferItems = await MothershipContract.getPendingTransfersOfBuyer(mainAccount);
          

          for (let address of transferItems) {
              const ProvenanceTransferContract = new ethers.Contract(address, Provenance.abi, signer);
              const ProvenanceTransferProps = await ProvenanceTransferContract.instrument()
              const index = ProvenanceTransferContract.ownerCount();
              const ProvenanceOwnerInfo = await ProvenanceTransferContract.ownerProvenance(index);

              transferArray.push({'ProvenanceContract': ProvenanceTransferContract, 'ProvenanceProps': ProvenanceTransferProps, 'ProvenanceOwnerInfo': ProvenanceOwnerInfo})
            }
          }
          setPendingTransferContracts(transferArray); 
          // setTransferInitiated(false)        
      }   
        
    },[MothershipContract, mainAccount])

    


  

  const state = { 
      pendingTransferContracts,
      setPendingTransferContracts
    };

  return (
    <TransferContext.Provider value={state}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransferContext() {
  return useContext(TransferContext);
}

/*

    useEffect(async() => {
      if (MothershipContract) {
        populateTransfers()
        .then(result => console.log(result, "transfer populate result"))
        .catch(error => console.log(error, 'populate error'));
      }
      async function populateTransfers() {
        let transferArray = [];
        

          const transferItems = await MothershipContract.getPendingTransfersOfBuyer(mainAccount);
          
          // console.log(transferItems)
          for (let address of transferItems) {
              console.log(address, "Address")
              const ProvenanceTransferContract = new ethers.Contract(address, Provenance.abi, signer);
              const ProvenanceTransferProps = await ProvenanceTransferContract.instrument()
              const index = ProvenanceTransferContract.ownerCount();
              const ProvenanceOwnerInfo = await ProvenanceTransferContract.ownerProvenance(index);

              transferArray.push({'ProvenanceContract': ProvenanceTransferContract, 'ProvenanceProps': ProvenanceTransferProps, 'ProvenanceOwnerInfo': ProvenanceOwnerInfo})
            }
          setPendingTransferContracts(transferArray);          
      }   
        
    },[MothershipContract, mainAccount])*/
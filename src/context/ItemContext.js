// src/context/state.js
import { createContext, useContext, useState, useEffect } from 'react';

//ethers
import { ethers } from 'ethers';

//abi
import Provenance from '../../artifacts/contracts/Provenance.sol/Provenance.json';

//context imports
import { useUserContext } from './UserContext.js';
import { useContractContext} from './ContractContext.js'


const ItemContext= createContext();

export function ItemContextProvider({ children }) {

  const { mainAccount, signer } = useUserContext();  
  const { MothershipContract, TokenContract } = useContractContext();


  const [newProvenanceAddress, setNewProvenanceAddress] = useState('');
  const [tokens, setTokens] = useState([]);
  const [items, setItems] = useState([]);
  //const [tokens, setTokens] = useState([]);
  const [provenanceObjects, setProvenanceObjects] = useState([]);

//load user tokens
  useEffect(() => {  
    getTokens()
    .then(tokenIDs => {
      let tokenArray = [];
      if (tokenIDs) {
      for (let i = 0; i < tokenIDs.length; i++) {
        const tokenIndex = tokenIDs[i].toNumber();
        tokenArray.push(tokenIndex)
      }}
      setTokens(tokenArray)
    })

    async function getTokens() {  

        if (TokenContract && mainAccount) { 
            let tokenIDs = await TokenContract.tokensOfOwner(mainAccount);
        //tokenArray.push(tokenIDs)
        return tokenIDs
        }
        
    };

  }, [mainAccount, TokenContract])
   
  
    //load addresses of user items
    useEffect(() => {
  
      (async function getItems() {
        if (MothershipContract) {
        let contractItems = await MothershipContract.getOwnersInstruments();
        setItems(contractItems);
          }
        })();
  
  
  
    },[MothershipContract])
  
    //Loads all users provenance objects
  
    useEffect(() => {
  
      if (items || newProvenanceAddress) {
        populateProvenances()
        .then((result) => console.log(result, 'populate result'))
        .catch(error => console.log(error, 'populate error'));
      }
      async function populateProvenances() {
        let provenanceArray = [];
        
            for (let address of items) {
                //TokenContract (need to put this in here Mothership and Provenance)
                
                //const ProvenanceAddress = address;
                const ProvenanceContract = new ethers.Contract(address, Provenance.abi, signer);
                const ProvenanceProps = await ProvenanceContract.instrument()
                const index = ProvenanceContract.ownerCount();
                const ProvenanceOwnerInfo = await ProvenanceContract.ownerProvenance(index);

                provenanceArray.push({'ProvenanceContract': ProvenanceContract, 'ProvenanceProps': ProvenanceProps, 'ProvenanceOwnerInfo': ProvenanceOwnerInfo})
              }
         setProvenanceObjects(provenanceArray);          
      }   
        
    },[items, newProvenanceAddress])

    


  

  const state = { 
      items, 
      setItems, 
      tokens, 
      setTokens, 
      provenanceObjects, 
      setProvenanceObjects, 
      newProvenanceAddress, 
      setNewProvenanceAddress 
    };

  return (
    <ItemContext.Provider value={state}>
      {children}
    </ItemContext.Provider>
  );
}

export function useItemContext() {
  return useContext(ItemContext);
}
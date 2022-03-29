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
  // use hooks to handle these

  const { mainAccount, signer } = useUserContext();  
  const { MothershipContract, TokenContract } = useContractContext();

  // 

  const [ itemAdded, setItemAdded ] = useState(false);
  const [ newProvenanceAddress, setNewProvenanceAddress] = useState('');
  const [ tokens, setTokens ] = useState([]);
  const [ items, setItems ] = useState([]);
  const [ provenanceObjects, setProvenanceObjects] = useState([]);

  const ipfsGetterRootURL = "https://gateway.pinata.cloud/ipfs/";


//load user tokens. need the for loop to convert to #.
  useEffect(() => { 
    if (mainAccount) { 
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
  }

    async function getTokens() {  

        if (TokenContract && mainAccount) { 
            let tokenIDs = await TokenContract.tokensOfOwner(mainAccount);
        //tokenArray.push(tokenIDs)
        return tokenIDs
        }
        
    };

  }, [mainAccount, TokenContract])
   
  
    //load addresses of user provenances
    useEffect(() => {
      

      if (mainAccount && MothershipContract) {
        // console.log(mainAccount, "mainAccount in getItems UseEffect")
        getItems();
      }
      
  
      async function getItems() {
        if (MothershipContract) {
        let contractItems = await MothershipContract.getOwnersInstruments();
        setItems(contractItems);
          }
        };
  
    },[mainAccount, MothershipContract])
  
    //Loads all users provenance contract instances
    
    useEffect(() => {
      if (items || newProvenanceAddress || itemAdded || mainAccount) {
        // console.log(mainAccount, "mainAccount in items UE")
        populateProvenances()
        /*
        .then(setItemAdded(false))
        */
        .catch(error => console.log(error, 'populate error'));
      }
      async function populateProvenances() {
        let provenanceArray = [];
        
            for (let address of items) {
                const ProvenanceContract = new ethers.Contract(address, Provenance.abi, signer);

                const ProvenanceDetails = await ProvenanceContract.instrument()
                const itemPhotos = await ProvenanceContract.getItemPics();
                const ProvenanceProps = {...ProvenanceDetails, itemPhotos}


                // console.log(ProvenanceProps, "props in context")
                
                const index = ProvenanceContract.ownerCount();
                const ProvenanceOwnerInfo = await ProvenanceContract.ownerProvenance(index);
                
                provenanceArray.push({'ProvenanceContract': ProvenanceContract, 'ProvenanceProps': ProvenanceProps, 'ProvenanceOwnerInfo': ProvenanceOwnerInfo})
              }
         setProvenanceObjects(provenanceArray);          
      }   
        
    },[items, newProvenanceAddress, itemAdded, mainAccount])

    


  

  const state = { 
      items, 
      setItems, 
      itemAdded,
      setItemAdded,
      tokens, 
      setTokens, 
      provenanceObjects, 
      setProvenanceObjects, 
      newProvenanceAddress, 
      setNewProvenanceAddress,
      ipfsGetterRootURL
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
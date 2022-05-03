// src/context/state.js
import { createContext, useContext, useState, useEffect } from 'react';

//ethers
import { ethers } from 'ethers';

import bs58 from 'bs58';

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
     
                const index = ProvenanceContract.ownerCount();
                const ProvenanceOwnerInfo = await ProvenanceContract.ownerProvenance(index);

                const ProvenancePendingOwner = await ProvenanceContract.pendingOwner();

                const ProvenanceCurrentOffer = await ProvenanceContract.currentOffer();

                
                provenanceArray.push({
                  'ProvenanceContract': ProvenanceContract, 
                  'ProvenanceProps': ProvenanceProps, 
                  'ProvenanceOwnerInfo': ProvenanceOwnerInfo, 
                  'ProvenancePendingOwner' : ProvenancePendingOwner,
                  'ProvenanceCurrentOffer': ProvenanceCurrentOffer})
              }
         setProvenanceObjects(provenanceArray);          
      }   
        
    },[items, newProvenanceAddress, itemAdded, mainAccount])

    const stringToBytes32 = (string) => ethers.utils.formatBytes32String(string);

    const bytes32ToString = (bytes) => ethers.utils.parseBytes32String(bytes);

//     /**
//  * @typedef {Object} Multihash
//  * @property {string} digest The digest output of hash function in hex with prepended '0x'
//  * @property {number} hashFunction The hash function code for the function used
//  * @property {number} size The length of digest
//  */

// /**
//  * Partition multihash string into object representing multihash
//  *
//  * @param {string} multihash A base58 encoded multihash string
//  * @returns {Multihash}
//  */
// function getBytes32FromMultihash(multihash) {
//   const decoded = bs58.decode(multihash);

//   return {
//     digest: `0x${decoded.slice(2).toString('hex')}`,
//     hashFunction: decoded[0],
//     size: decoded[1],
//   };
// }

// /**
//  * Encode a multihash structure into base58 encoded multihash string
//  *
//  * @param {Multihash} multihash
//  * @returns {(string|null)} base58 encoded multihash string
//  */
// function getMultihashFromBytes32(multihash) {
//   const { digest, hashFunction, size } = multihash;
//   if (size === 0) return null;

//   // cut off leading "0x"
//   const hashBytes = Buffer.from(digest.slice(2), 'hex');

//   // prepend hashFunction and digest size
//   const multihashBytes = new (hashBytes.constructor)(2 + hashBytes.length);
//   multihashBytes[0] = hashFunction;
//   multihashBytes[1] = size;
//   multihashBytes.set(hashBytes, 2);

//   return bs58.encode(multihashBytes);
// }

// /**
//  * Parse Solidity response in array to a Multihash object
//  *
//  * @param {array} response Response array from Solidity
//  * @returns {Multihash} multihash object
//  */

// function parseContractResponse(response) {
//   const [digest, hashFunction, size] = response;
//   return {
//     digest,
//     hashFunction: hashFunction.toNumber(),
//     size: size.toNumber(),
//   };
// }

// /**
//  * Parse Solidity response in array to a base58 encoded multihash string
//  *
//  * @param {array} response Response array from Solidity
//  * @returns {string} base58 encoded multihash string
//  */
// function getMultihashFromContractResponse(response) {
//   return getMultihashFromBytes32(parseContractResponse(response));
// }


  

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
      ipfsGetterRootURL,
      stringToBytes32,
      bytes32ToString
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
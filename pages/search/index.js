import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { useContractContext } from '../../src/context/ContractContext.js';
import { useUserContext } from '../../src/context/UserContext.js';

import Provenance from '../../artifacts/contracts/Provenance.sol/Provenance.json';

import ItemTable from '../../src/components/ItemTable/ItemTable.js';

import { Button, Spinner } from 'react-bootstrap';

function Search() {

    const { MothershipContract, TokenContract } = useContractContext();
    const { provider, signer } = useUserContext();

    const [allProvenanceObjects, setAllProvenanceObjects] = useState();
    const [loading, setLoading] = useState(false);

    // TEMP FOR TESTING FILTERS

    const type = [0, 1, 3]
    const brand = ["Jupiter", "Yamaha", "JL Woodwinds", "Yanigisawa", "Antigua Winds", "Pearl", "Selmer", "Buffet"]
    const model = ["Mark VI", "SBA", "R13", "Bronze Series", "Cigar Cutter", "Balanced Action", "King 20", "Silver Fox"]
    const images = ["QmNvzkSMNCF9bRry5CHiTCnz7s8Fc6ooNVQyuFc4EPDaQV", "QmPYABsoen4yRJWp4ta7yrhxgsqNEQLK15c68BL6BQrQAW", "QmQ4wfPDcxJeLcypv6JQt6757Nmzi95k5wZbjjFYzjsUW2", "QmdBEnkC1qXc1pZsGkRTPkwhqohGyiTd7tZKvD1v8VQ65Y" ]

    function serial() {
        return Math.floor(Math.random() * 1000)
    }
    function tokenID() {
        return Math.floor(Math.random() * 100)
    }
    function random_element(items)
        {  return items[Math.floor(Math.random()*items.length)];
       }
    function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }
    const batchMintTokens = () => {
        TokenContract.batchMint(100, random_element(images))
    }
    const create10Provenances = () => {

            let type1 = random_element(type);
            let serial1 = serial();
            let brand1 = random_element(brand)
            let model1 = random_element(model);
            let year1 = (randomDate(new Date(1897, 0, 1), new Date())).getFullYear();
            let tokenID1 = tokenID();
            let date1 = (randomDate(new Date(1897, 0, 1), new Date()));
            let vImages1 = random_element(images)

            MothershipContract.createBatchProvenances(
                type1, 
                serial1, 
                brand1, 
                model1, 
                year1, 
                tokenID1, 
                date1,
                vImages1, 
                images)
                .then(async(result) => {
                  provider.waitForTransaction(result.hash)
                  .then(mined => {
                      if (mined) {        
                        MothershipContract.once("ProvenanceCreated", (type, newAddress) => {
                          
                          console.log(`CreateBatchProvenances(11) a success!`)
                          
                      })}
                  })
                  
                })
        
        }

    // END TEMP 

    useEffect(() => {
        if (MothershipContract) {
          // console.log(mainAccount, "mainAccount in items UE")
          loadAllProvenances()
          /*
          .then(setItemAdded(false))
          */
          .catch(error => console.log(error, 'populate loadAll error'));
        }
        async function loadAllProvenances() {
          setLoading(true)
          let allProvenanceArray = [];
          let addresses = await MothershipContract.getAllProvenances();
          
              for (let address of addresses) {
                  const ProvenanceContract = new ethers.Contract(address, Provenance.abi, signer);
  
                  const ProvenanceDetails = await ProvenanceContract.instrument()
                  const itemPhotos = await ProvenanceContract.getItemPics();
                  const ProvenanceProps = {...ProvenanceDetails, itemPhotos}
       
                  const index = ProvenanceContract.ownerCount();
                  const ProvenanceOwnerInfo = await ProvenanceContract.ownerProvenance(index);
  
                  const ProvenancePendingOwner = await ProvenanceContract.pendingOwner();
                  
                  allProvenanceArray.push({'ProvenanceContract': ProvenanceContract, 'ProvenanceProps': ProvenanceProps, 'ProvenanceOwnerInfo': ProvenanceOwnerInfo, 'ProvenancePendingOwner' : ProvenancePendingOwner})
                }
           setAllProvenanceObjects(allProvenanceArray);   
           setLoading(false)        
        }
          
          
      },[MothershipContract])
  

    const getAll = async() => {
            const result = await MothershipContract.getAllProvenances();
            console.log(result, "getAll result")
        }



return (
    <>
    <div>
        {loading ?
            <>
                <h1>Contracts Loading...</h1>
                <Spinner />
            </>
            :
            <h1>Search Provenances</h1>     
        }
    </div>
    <div>
        {loading ?
            <>
                <Spinner />
            </>
            :
            <ItemTable provenanceObjects={allProvenanceObjects} search={true} />    
        }
    </div>
    <div style={{textAlign: 'center'}}>
        <Button variant="secondary" onClick={batchMintTokens}> Mint 100 Tokens </Button>
        <Button variant="warning" onClick={create10Provenances}> Generate 10 practice provenances </Button>
        <Button onClick={getAll}>GetAll Provenances</Button>
    </div>
    
    
    

    </>

)
    
 
  }

  
  export default Search;
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { useContractContext } from '../../src/context/ContractContext.js';
import { useUserContext } from '../../src/context/UserContext.js';

import Provenance from '../../artifacts/contracts/Provenance.sol/Provenance.json';

import PublicItemTable from '../../src/components/PublicItemTable/PublicItemTable.js';

import { Button, Container } from 'react-bootstrap';

import { BeatLoader } from 'react-spinners';

const initialValues = {
    brand: "",
    date: "",
    instrumentDeedToken: '',
    model: "",
    ownerAddress: "",
    ownerCount: '',
    serial: "",
    typeOfProvenance: '',
    year: ''
  };

function PublicProvenanceSearchTable() {

    const { MothershipContract, TokenContract } = useContractContext();
    const { provider, signer } = useUserContext();

    const [allProvenanceObjects, setAllProvenanceObjects] = useState();
    const [loading, setLoading] = useState(false);

    const [searchInput, setSearchInput] = useState([]);
    const [values, setValues] = useState(initialValues);
    const [filteredResults, setFilteredResults] = useState();
    // ************************
    // TEMP FOR TESTING FILTERS
    // ***********************

    const type = [0, 1, 2]
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
                serial1.toString(), 
                brand1, 
                model1, 
                year1, 
                tokenID1, 
                date1.toString(),
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

    // *********
    // END TEMP
    // *********

    useEffect(() => {
        if (MothershipContract) {

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
                  const ProvenanceCurrentOffer = await ProvenanceContract.currentOffer();
                  
                  allProvenanceArray.push({
                    'ProvenanceContract': ProvenanceContract, 
                    'ProvenanceProps': ProvenanceProps, 
                    'ProvenanceOwnerInfo': ProvenanceOwnerInfo, 
                    'ProvenancePendingOwner' : ProvenancePendingOwner,
                    'ProvenanceCurrentOffer': ProvenanceCurrentOffer})
                
                }
           setAllProvenanceObjects(allProvenanceArray);   
           setLoading(false)        
        }
          
          
      },[MothershipContract])

      useEffect(async() => {
        if (values){
        searchItems(values)}
      }, [values]);
  

    const getAll = async() => {
            const result = await MothershipContract.getAllProvenances();
        }


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setValues({
        ...values,
        [name]: value,
        });
        // searchItems(values);
    };


    const searchItems = () => {         
            
            if (values !== initialValues) {
                const filteredData = allProvenanceObjects.filter((item) => {

                    const itemProps = item.ProvenanceProps;
                    const itemOwnerInfo = item.ProvenanceOwnerInfo;
                    const combinedObj = {
                        ...itemProps,
                    ...itemOwnerInfo
                    }
               
                    for (const [key, value] of Object.entries(values)) {   
                        // console.log(value, "value inside")
                        // console.log(Object.values((combinedObj[key]).toString()), "check")
                        if ((value !== ('' || 0)) && !(Object.values((combinedObj[key]).toString()).join('').toLowerCase().includes((value.toString()).toLowerCase()))) {
                            console.log(Object.values(combinedObj[key]).join('').toLowerCase(), "key, value") 
                            return false;                             
                        }
                    }
                    return true;
                                                 
                })
            
                

                console.log(filteredData, "filteredData")
                setFilteredResults(filteredData)
            }else {
                setFilteredResults(allProvenanceObjects)
            }}
    
    const clearSearchForm = () => {
        setValues(initialValues)
        setFilteredResults(allProvenanceObjects)
    }


return (
    <>
    <div>
        {loading ?
            <>
                <h1>Contracts Loading...</h1>
            </>
            :
            <h1>Search Provenances</h1>     
        }
    </div>
    {/* <div style={{textAlign: 'center'}}> */}
    <div style={{textAlign: 'center'}}>
    <Button onClick={clearSearchForm}>Clear Search Form</Button>
    <Button onClick={()=> {console.log(values)}}>Values</Button>

    </div>

    <Container style={{textAlign: 'center'}}>
        <h4>Brand</h4>
            <input icon='search'
                value={values.brand}
                name='brand'
                style={{width: '80%'}}
                placeholder='Search By Brand'
                onChange={handleInputChange}
            />
        <h4>Model</h4>
            <input icon='search'
                value={values.model}
                name='model'
                style={{width: '80%'}}
                placeholder='Search...'
                onChange={handleInputChange}
            />
         <h4>Year</h4>
            <input icon='search'
                value={values.year}
                name='year'
                style={{width: '80%'}}
                placeholder='Search...'
                onChange={handleInputChange}
            />
        <h4>Token</h4>
            <input icon='search'
                value={values.instrumentDeedToken}
                name='instrumentDeedToken'
                style={{width: '80%'}}
                placeholder='Search...'
                onChange={handleInputChange}
            />
        <h4>Serial</h4>
            <input icon='search'
                value={values.serial}
                name='serial'
                style={{width: '80%'}}
                placeholder='Search...'
                onChange={handleInputChange}
            />
        <h4>Owner Address</h4>
            <input icon='search'
                value={values.ownerAddress}
                name='ownerAddress'
                style={{width: '80%'}}
                placeholder='Search...'
                onChange={handleInputChange}
            />

        <h4>Type of Provenance</h4>
            <input icon='search'
                value={values.typeOfProvenance}
                name='typeOfProvenance'
                style={{width: '80%'}}
                placeholder='Search...'
                onChange={handleInputChange}
            />
    </Container>


    <hr />
    <div>
        {loading ?
            <div style={{textAlign: 'center'}} >
                <BeatLoader  />
            </div>
            :
            <div style={{textAlign: 'center'}}>
                <p>Green Bordered Provenances Owned By You</p>
                <p>Red Bordered Provenances Are Incoming Provenances You Need To Accept</p>
                <p>Purple Bordered Provenances have open offers</p>
                <PublicItemTable provenanceObjects={values !== initialValues ? filteredResults : allProvenanceObjects} />   
            </div>
 
        }
    </div>
    <div style={{textAlign: 'center'}}>
        <Button variant="secondary" onClick={batchMintTokens}> Mint 100 Tokens </Button>
        <Button variant="warning" onClick={create10Provenances}> Generate 10 practice provenances </Button>
        <Button onClick={getAll}>Get All Provenances</Button>
    </div>
    
    
    e

    </>

)
    
 
  }

  
  export default PublicProvenanceSearchTable;




//   if (!(isEmptyObject(values))) {
//     const filteredData = allProvenanceObjects.filter((item) => {
//         const itemProps = item.ProvenanceProps;
//         const itemOwnerInfo = item.ProvenanceOwnerInfo;
//         const combinedObj = {
//             ...itemProps,
//            ...itemOwnerInfo
//         }
//         const valuesKeys = Object.keys(values);
//         const combinedObjKeys = Object.keys(combinedObj);
//         for (const [key, value] of Object.entries(values)) {
            
//             console.log(key, value)
//             return Object.values(combinedObj).join('').toLowerCase().includes(value.toLowerCase());
            
            
//             // console.log(Object.entries(values), "object entires")
//             // console.log(combinedObj, "combinedObj")
//             // return Object.values(combinedObj).join('').toLowerCase().includes(value.toLowerCase());
//           }
//         })
    
//     // const filteredData = allProvenanceObjects.filter(function(item) {
//     //     for (const [key, value] of Object.entries(values)) {
//     //         console.log(key, "key")
//     //       if (item[key] === undefined || item[key] != filter[key])
//     //         return false;
//     //     }
//     //     return true;
//     //   });
    

//     console.log(filteredData, "filteredData")
//     setFilteredResults(filteredData)
// }
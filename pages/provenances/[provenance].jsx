import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

//next imports
import Link from 'next/link'
import { useRouter } from 'next/router';

//react-bootstrap imports
import { Container, Carousel, Table, Row, Col, Card, Image, Button, ListGroup, ListGroupItem} from 'react-bootstrap';

// context imports
import { useItemContext } from '../../src/context/ItemContext';
import { useContractContext } from '../../src/context/ContractContext';
import { useUserContext } from '../../src/context/UserContext';

//abi
import Provenance from '../../artifacts/contracts/Provenance.sol/Provenance.json';

//lib
import { getProvenanceAddresses } from '../../lib/getPathsAndProps';


// styles
import styles from './ProvenanceHub.module.css'

//image imports
import greencheckmark from '../../public/images/green_checkmark.png';
import waitingkitten from '../../public/images/waitingkitten.jpeg';


const ProvenanceProfile = (props) => {

  const { provenanceObjects, ipfsGetterRootURL } = useItemContext();
  const { TokenContract, MothershipContract } = useContractContext();
  const { mainAccount, provider } = useUserContext();
  const router = useRouter();

  const { provenance } = router.query;


  const [ loaded , setLoaded ] = useState(false);

  const [ provenanceContract, setProvenanceContract ] = useState();
  const [ provenanceProps, setProvenanceProps ] = useState();
  const [ provenanceOwnerInfo, setProvenanceOwnerInfo ] = useState();

  const [buyerAccount, setBuyerAccount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
 
  //load all info 
  useEffect(async() => {
    if (provenanceObjects && provenance) {
    loadProvenance()
  }
    // would be faster search with an object not a for loop. not sure how that would work with the map though.
    async function loadProvenance() { 
      for (let contract of provenanceObjects) {
        if (contract.ProvenanceContract.address == provenance) {
          const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo } = contract;

          setProvenanceContract(ProvenanceContract);
          setProvenanceProps(ProvenanceProps);
          setProvenanceOwnerInfo(ProvenanceOwnerInfo);
          setLoaded(true)
        }
      }
    }
  },[provenanceObjects, provenance])



  useEffect(async() => {
   
  },[])
  


  function ReleaseProvenance() {

    const [pendingTransfer, setPendingTransfer] = useState(false)

    const [pendingTransferAddress, setPendingTransferAddress] = useState();

      useEffect(async() => {
       const pendingOwner = await provenanceContract.pendingOwner();

       console.log(pendingOwner, "pendingOwner address")

       if (pendingOwner != ethers.constants.AddressZero) {
         setPendingTransfer(true)
         setPendingTransferAddress(pendingOwner)
       }
      
      },[])

      

      async function release() {
      setErrorMessage('')
      if (ethers.utils.isAddress(buyerAccount)) {

        await TokenContract.approve(provenanceContract.address, provenanceProps.instrumentDeedToken.toString())
        .then(async(result) => {
          provider.waitForTransaction(result.hash)
          .then(async(mined) => {
              if (mined) {
                await provenanceContract.setPendingOwner(buyerAccount)
                .then(async(result) => {
                  provider.waitForTransaction(result.hash)
                  .then(async(mined) => {
                    if (mined) {
                      //  need to fix this from react router
                      setErrorMessage(`this provenance has been approved to ${buyerAccount} and is waiting to be claimed`)
                    }
                  })})
                .catch((error)=> {
                  console.log(error)       
                })
              } else {
                setErrorMessage('Please enter a valid Ethereum address')
              }
              })}
          )
      }
    }

      return (          
        <div>
        {pendingTransfer ? 
          <div>
              <h4>This provenance has been released and is awaiting claim & verification by {pendingTransferAddress}</h4>
           </div> 
          :
          <div>
            <h3>Sell To Address: {buyerAccount}</h3>
            <h6>0xa0Ee7A142d267C1f36714E4a8F75612F20a79720</h6>
            0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
            <input 
                name="userAddress" 
                type="text" 
                placeholder='enter address to transfer to here'
                onChange={(e) => setBuyerAccount(e.target.value)} 
                value={buyerAccount || ''}
                style={{width: '65%', height: '40px', fontSize: '20px', marginTop: '30px', textAlign: 'center'}} />

            <div>
              <button onClick={release}>Transfer This Token and Provenance</button>  
            </div>    

            <div>
              <Link href={`/${mainAccount}`}>Back To Main</Link> 
            </div>
          </div>

        }
        </div>
   
     
      )
    }

    
    if (loaded) {

    const{ serial, brand, instrumentDeedToken, model, year, typeOfProvenance } = provenanceProps;   
  


    return (
      <Container>
    
        <div className={styles.container}>            
          <h2>{brand} {model}: {serial}</h2>
          <p></p>
          <h3>Verification Photo Image</h3>
          <img src={ipfsGetterRootURL + provenanceOwnerInfo.verificationPhotoHash} style={{width: '50%'}} />
          <h2 style={{paddingTop: '30px'}}>Provenance Information</h2>         
          <Table  bordered>
            <tbody>
              <tr>
                <td className='bold' style={{width :'50%'}}>Provenance Contract Address</td>
                <td>{provenanceContract.address}</td>
              </tr>
              <tr>
                <td>Token ID attached to this Provenance:</td>
                <td>{provenanceProps.instrumentDeedToken.toString()}</td>
              </tr>
              <tr>
                <td>Type of Provenance</td>
                <td>{provenanceProps.typeOfProvenance.toString()}</td>
              </tr>
              <tr>
                <td>Provenance Owner Address</td>
                <td>{provenanceOwnerInfo.ownerAddress}</td>
              </tr>
              <tr>
                <td>Owner Name (optional)</td>
                <td>{provenanceOwnerInfo.name}</td>
              </tr>
              <tr>
                <td>Item Model</td>
                <td>{provenanceProps.model}</td>
              </tr>
              <tr>
                <td>Year Manufactured</td>
                <td>{provenanceProps.year}</td>
              </tr>
              <tr>
                <td>Serial Number</td>
                <td>{provenanceProps.serial}</td>
              </tr>


              </tbody>
            </Table>
          <Carousel />
          <ReleaseProvenance />

          {errorMessage ?
          <p>{errorMessage}</p> : null}

       
          
          
        </div>
        </Container>
        
    )
  
    } else {
      return(
        <p>you do not have any current provenances.</p>
      )
    }
    
}


export default ProvenanceProfile;



/*

these will only with an API endpoint calling a smart contract. nothing user based.

export async function getStaticPaths() {

  const paths = getProvenanceAddresses();
  console.log(paths, "paths")
  return {
    paths,
    fallback: false // false or 'blocking'
  };
}


async function getStaticProps(context) {

  console.log(context, "context")

  const results = await fetch('http://dummy.restapiexample.com/api/v1/employees').then(r => r.json())
  return {
    props: { results }, // will be passed to the page component as props
  }
}


export async function getStaticProps() {
    return {
        props: {
            lists: [
                {dirId: '1', name: 'Directory 1'},
                {dirId: '2', name: 'Directory 2'},
                {dirId: '3', name: 'Directory 3'},
                {dirId: '4', name: 'Directory 4'}
            ],
        }
    }
}
*/



/* original sale function
 function ReleaseProvenance() {

      async function sell() {
      setErrorMessage('')
      if (ethers.utils.isAddress(buyerAccount)) {

        await TokenContract.approve(provenanceAddress, instrumentDeedToken.toString())
        .then(async(result) => {
          provider.waitForTransaction(result.hash)
          .then(async(mined) => {
              if (mined) {
                await provenanceContract.sale(buyerAccount, waitingkitten, verificationPhotoHash)
                .then(async(result) => {
                  provider.waitForTransaction(result.hash)
                  .then(async(mined) => {
                    if (mined) {
                      //  need to fix this from react router
                      router.push(`/${mainAccount}`)
                    }
                  })})
                .catch((error)=> {
                  console.log(error)       
                })
              } else {
                setErrorMessage('Please enter a valid Ethereum address')
              }
              })}
          )
      }
    }

      return (          
        <div>
          <h3>sell To Address: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720</h3>
          <input 
              name="userAddress" 
              type="text" 
              placeholder='enter address to transfer to here'
              onChange={(e) => setBuyerAccount(e.target.value)} 
              value={buyerAccount || ''}
              style={{width: '65%', height: '40px', fontSize: '20px', marginTop: '30px', textAlign: 'center'}} />

          <div>
            <button onClick={sell}>Transfer This Token and Provenance</button>  
          </div>    

          <div>
            <Link href={`/${mainAccount}`}>Back To Main</Link> 
          </div>
        </div>
   
     
      )
    }
    */
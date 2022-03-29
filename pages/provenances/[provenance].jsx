import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

//next imports
import Link from 'next/link'
import { useRouter } from 'next/router';

//react-bootstrap imports
import { Container, Carousel, Table, Row, Col, Card, Image, Button, ListGroup, ListGroupItem, InputGroup, Form, FormControl} from 'react-bootstrap';

// context imports
import { useItemContext } from '../../src/context/ItemContext';
import { useContractContext } from '../../src/context/ContractContext';
import { useUserContext } from '../../src/context/UserContext';

// styles
import styles from './ProvenanceHub.module.css'

//image imports
import greencheckmark from '../../public/images/green_checkmark.png';
import waitingkitten from '../../public/images/waitingkitten.jpeg';


const ProvenanceProfile = () => {

  const { provenanceObjects, ipfsGetterRootURL } = useItemContext();
  const { TokenContract, MothershipContract } = useContractContext();
  const { mainAccount, provider } = useUserContext();
  const router = useRouter();

  const { provenance } = router.query;


  const [ loaded , setLoaded ] = useState(false);

  const [ provenanceContract, setProvenanceContract ] = useState();
  const [ provenanceProps, setProvenanceProps ] = useState();
  const [ provenanceOwnerInfo, setProvenanceOwnerInfo ] = useState();

  
  const [ successMessage, setSuccessMessage ] = useState('');

 
  //load all info 
  useEffect(async() => {
    if (provenanceObjects && provenance) {
    loadProvenance()
  }
    // would be faster search with an object not a for loop. not sure how that would work with the map though.
    async function loadProvenance() { 
      for (let contract of provenanceObjects) {
        console.log(contract)
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






  const ProvenanceHistory = () => { 

    const [ provenanceHistoryArray, setProvenanceHistoryArray ] = useState([]);

    useEffect(async() => {
      
      if (MothershipContract) {
      loadProvenanceHistory()
      }
      async function loadProvenanceHistory() { 
          const history = await provenanceContract.getOwnershipHistory();
          const historyShift = [...history];
          historyShift.shift();
          setProvenanceHistoryArray(historyShift);
          
        }
    },[MothershipContract])


    if (loaded){
      return (  
          <div>
          <hr />
          <h1>Provenance Ownership History</h1>
          {provenanceHistoryArray.map((provenanceOwnerInfo, index)=> {
            const { ownerAddress, date, verificationPhotoHash, ownerCount  } = provenanceOwnerInfo;
  
            return (

              <Container key={ownerAddress}>
                <Card>
                  
                  <Card.Header>Owner {ownerCount}</Card.Header>
                    <Card.Body>
                      <div className={styles.cardContainer}>
                        <div className={styles.cardPhotoContainer}>
                          <Image src={ipfsGetterRootURL+verificationPhotoHash} className={styles.cardPhoto} alt={'verification photo'} />
                        </div>
                        <div className={styles.cardInfoContainer}>
                          <Card.Title>Owner Address</Card.Title>             
                          <Card.Text style={{color: 'black'}}>
                            {ownerAddress}
                          </Card.Text>
                          <Card.Title>Date Acquired</Card.Title>
                          <Card.Text style={{color: 'black'}}>
                            {date}
                          </Card.Text>

                          <Card.Title>Notes</Card.Title>
                          <Card.Text style={{color: 'black'}}>
                            Additional data can maybe stored off-chain?
                          </Card.Text>
                        </div>
                        
                        
                      </div>         

                    </Card.Body>
                  </Card>    
                </Container>
              )
            })
          }              
        </div>
        
       )} else {
        return (
          <p>nothing to show here</p>
        )}
}
  


  const ReleaseProvenance = () => {

    const [ pendingTransfer, setPendingTransfer ] = useState(false)

    const [ pendingTransferAddress, setPendingTransferAddress ] = useState();

    const [ buyerAccount, setBuyerAccount ] = useState();

    const [ addressErrorMessage, setAddressErrorMessage ] = useState('')

    

    useEffect(async() => {

       const pendingOwner = await provenanceContract.pendingOwner();

       if (pendingOwner != ethers.constants.AddressZero) {
         setPendingTransfer(true)
         setPendingTransferAddress(pendingOwner)
       }
      
      },[])

    const handleChange = event => {
      console.log(event.target.value, "value")
      setBuyerAccount(event.target.value);
    }

      

      async function release() {
      setSuccessMessage('')
      setAddressErrorMessage('')
      if (ethers.utils.isAddress(buyerAccount) && buyerAccount != mainAccount) {

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
                      setSuccessMessage('Transaction Success')
                      }}
                    )})
                .catch((error)=> {
                  console.log(error)       
                  })
                 }
              })
            }
          )
      }  else {
        setAddressErrorMessage('You are either attempting to transfer to your own Ethereum address or an invalid address. Please check and re-enter.')
      }
    }

      return (          
        <div>
        {pendingTransfer ? 

          <div className={styles.containerBorder}>
            <h4>This provenance has been released and is awaiting claim & verification by: <p>{pendingTransferAddress}</p></h4>
          </div> 
          :
          <div>
            <h2>Transfer this Provenance</h2>
            {ethers.utils.isAddress(buyerAccount) ? <h3>You are transferring this provenance to this address: {buyerAccount}</h3> : null}
            
            <h6>0xa0Ee7A142d267C1f36714E4a8F75612F20a79720</h6>
            <h6>0x14dC79964da2C08b23698B3D3cc7Ca32193d9955</h6>
            {addressErrorMessage ?
            <p>{addressErrorMessage}</p> : null}
            
            <input 
                name="userAddress" 
                type="text" 
                placeholder='enter address to transfer to here'
                onChange={handleChange}
                value={buyerAccount || ''}
                style={{width: '65%', height: '40px', fontSize: '20px', marginTop: '30px', textAlign: 'center'}} />


            <div className='mt-2'>
              <Button onClick={release}>Transfer This Token and Provenance</Button>  
            </div>    

          </div>

        }
        </div>  
      )
    }

    if (loaded) {

    const { serial, brand, instrumentDeedToken, model, year, typeOfProvenance } = provenanceProps; 
    


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
            {/*itemPhotoArray.length > 0 ?      
              <Carousel>
                {itemPhotoArray.map((photo, index)=> {
                  return (       
                      <Carousel.Item key={index}>
                        <img 
                          key={photo} 
                          src={photo} 
                          alt="item photos not yet loaded"
                          className={styles.itemPhotoCarousel} />  
                      </Carousel.Item>
                      )
                })} 
              </Carousel>
              
          :
            <div>
              <h2>Item Photos Loading</h2>
              <Spinner animation="border" className='mx-auto' />
            </div>
            */
          }

          <ProvenanceHistory />
          <hr />

          <ReleaseProvenance />

          {successMessage ?
          <p>{successMessage}</p> : null}

       
          
          
        </div>
        </Container>
        
    )
  
    } else {
      return(
        <h1 style={{paddingTop: '20vh'}}>You do not own this Provenance.</h1>
      )
    }
    
}


export default ProvenanceProfile;


import { useEffect, useState } from 'react';
import { ethers, Signer } from 'ethers';

//next imports
import Link from 'next/link'
import { useRouter } from 'next/router';

import Provenance from '../../../artifacts/contracts/Provenance.sol/Provenance.json'

//react-bootstrap imports
import { Container, Carousel, Table, Row, Col, Card, Image, Button, ListGroup, ListGroupItem, InputGroup, Form, FormControl} from 'react-bootstrap';

// context imports
import { useItemContext } from '../../../src/context/ItemContext';
import { useContractContext } from '../../../src/context/ContractContext';
import { useUserContext } from '../../../src/context/UserContext';
import { useTransferContext } from '../../../src/context/TransferContext';

// styles
import styles from '../Search.module.css'



const NonUserProvenance = () => {

  const { ipfsGetterRootURL } = useItemContext();
  const { TokenContract, MothershipContract } = useContractContext();
  const { mainAccount, provider, signer } = useUserContext();
  const { setOutgoingContract } = useTransferContext();
  const router = useRouter();

  const { nonUserProvenance } = router.query;



  const [ loaded , setLoaded ] = useState(false);

  const [ provenanceContract, setProvenanceContract ] = useState();
  const [ provenanceProps, setProvenanceProps ] = useState();
  const [ provenanceOwnerInfo, setProvenanceOwnerInfo ] = useState();
  const [pendingOwner, setPendingOwner] = useState();


 
  //load all info 
  useEffect(async() => {
    if (nonUserProvenance && signer) {
    loadSingleProvenance()
    .catch(error => console.log(error, 'populate error'));
  }
    // would be faster search with an object not a for loop. not sure how that would work with the map though.

    async function loadSingleProvenance() { 

      
        const SingleContract = new ethers.Contract(nonUserProvenance, Provenance.abi, signer);


        const ProvenanceDetails = await SingleContract.instrument()
        const itemPhotos = await SingleContract.getItemPics();
        const ProvenanceProps = {...ProvenanceDetails, itemPhotos}

        const index = SingleContract.ownerCount();
        const ProvenanceOwnerInfo = await SingleContract.ownerProvenance(index);
        console.log(await SingleContract.getOwnershipHistory())
        


        setProvenanceContract(SingleContract);
        setProvenanceProps(ProvenanceProps);
        setProvenanceOwnerInfo(ProvenanceOwnerInfo);
        setLoaded(true)
    
    }
  },[nonUserProvenance, signer])


  const ItemPhotoCarousel = () => {
    const itemPhotoArray = provenanceProps.itemPhotos;

    return (
      <div className="previewPhoto"> 
        <hr />
        <h2>Item Photos</h2>
        {itemPhotoArray.length > 0 ?      
            <Carousel variant="dark">
              {itemPhotoArray.map((photo, index)=> {
                return (       
                    <Carousel.Item key={index}>
                      <img 
                        key={photo} 
                        src={ipfsGetterRootURL + photo} 
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
        }
        
        </div>
    )
  }



  const ProvenanceHistory = () => { 

    const [provenanceHistoryArray, setProvenanceHistoryArray] = useState([]);

    useEffect(async() => {
      
      if (MothershipContract && loaded) {
        loadProvenanceHistory()
      }
      async function loadProvenanceHistory() { 
          const history = await provenanceContract.getOwnershipHistory();
          const historyShift = [...history];
          historyShift.shift();
          // The line below is throwing an error due to state update, memory leak. make a note to fix.
          setProvenanceHistoryArray(historyShift);
          
        }
    },[MothershipContract, loaded])


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
                          {console.log(verificationPhotoHash)}
                          <Image src={ipfsGetterRootURL+verificationPhotoHash} className={styles.cardPhoto} alt={'verification photo'} />
                        </div>
                        <div className={styles.cardInfoContainer}>
                          <Card.Title>Owner Address</Card.Title>             
                          <Card.Text style={{color: 'black'}}>
                            {ownerAddress}
                          </Card.Text>
                          <Card.Title>Date Acquired</Card.Title>
                          <Card.Text style={{color: 'black'}}>+
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

  const MakeOfferOnProvenance = () => {
    const [newOfferAmount, setNewOfferAmount] = useState();
    const [currentOfferBuyer, setCurrentOfferBuyer] = useState();
    const [currentOfferAmount, setCurrentOfferAmount] = useState(0)

    

    useEffect(async() => {
      const result = await provenanceContract.currentOffer();
      const buyer = result.buyer;
      const offer = result.offer;
      
      if (buyer !== ethers.constants.AddressZero) setCurrentOfferBuyer(buyer);
      if (offer !== 0.0)setCurrentOfferAmount(ethers.utils.formatEther(offer));
      

    },[provenanceContract])

    const handleChange = event => {
      console.log(event.target.value, "value")
      setNewOfferAmount(event.target.value);
    }

    

    async function approveToken() {
      await TokenContract.approve(provenanceContract.address, provenanceProps.instrumentDeedToken.toString()).
      then(result => console.log(result))
      .catch(error => console.log(error.data.message, "offer error"));
    }

    async function offer() {
      await provenanceContract.makeOffer({value: ethers.utils.parseEther(newOfferAmount)}).
      then(result => console.log(result))
      .catch(error => console.log(error.data.message, "offer error"));
    }

    async function cancel() {
      await provenanceContract.cancelOffer().
      then(result => console.log(result))
      .catch(error => console.log(error.data.message, "offer error"));
    }

    async function accept() {
      await provenanceContract.acceptOffer().
      then(result => console.log(result))
      .catch(error => console.log(error.data.message, "offer error"));
    }


    return(
      <div>
        {provenanceOwnerInfo.ownerAddress === mainAccount ?
          <h1>Offers For This Provenance</h1>
          :
          <h1>Make Offer For this Provenance</h1>
        }

        {currentOfferBuyer ?
          <div>
            <h4>Current Offer By: {currentOfferBuyer}</h4>
            <br/>
            <h4>Amount: {ethers.constants.EtherSymbol}{currentOfferAmount}</h4>
          </div>
          : 
          <div>
            <p>No Current Offers on This Provenance</p>
          </div>}

          <p>eventually this transfer flow should pop up in a modal</p>

          {(provenanceOwnerInfo.ownerAddress === mainAccount) && (currentOfferAmount !== (0 && undefined)) ?
          <div>
            <Button variant="primary" onClick={approveToken}>Approve Token Transfer</Button>
            <Button variant="primary" onClick={accept}>Accept Offer</Button>
            <Button variant="danger" onClick={cancel}>Cancel Offer</Button>
            <p>this ***cannot*** be undone</p>
          </div>
          : 
          <div>
            <input 
            name="userAddress" 
            type="text" 
            placeholder='make offer in eth'
            onChange={handleChange}
            value={newOfferAmount || ''}
            style={{width: '65%', height: '40px', marginBottom: '20px', fontSize: '20px', textAlign: 'center'}} />
            <div>
              <Button style={{fontSize: '40px'}} onClick={offer}>Make Offer</Button>
            </div>
          </div>}

        {provenanceOwnerInfo.ownerAddress === mainAccount ?
          null
          : 
null
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
                <td>Provenance Owner Address</td>
                <td>{provenanceOwnerInfo.ownerAddress}</td>
              </tr>
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

            <ItemPhotoCarousel />
            <ProvenanceHistory />
            <hr />
            <MakeOfferOnProvenance />

        </div>
        </Container>
        
    )
  
    } else {
      return(
        <>
          <h1 style={{paddingTop: '20vh'}}>You do not own this Provenance.</h1>
        </>

      )
    }
    
}


export default NonUserProvenance;


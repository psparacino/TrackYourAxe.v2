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
import { useTransferContext } from '../../src/context/TransferContext';

//abi
import Provenance from '../../artifacts/contracts/Provenance.sol/Provenance.json';

// styles
import styles from './transfers.module.css'


const IncomingTransfers = () => {

  const { ipfsGetterRootURL } = useItemContext();
  const { MothershipContract } = useContractContext();
  const { mainAccount, provider, signer } = useUserContext();
  const { pendingTransferContracts, setPendingTransferContracts } = useTransferContext();
  const router = useRouter();


  const [ loaded , setLoaded ] = useState(false);

  const [buyerAccount, setBuyerAccount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  const TransferTable = () => {
    

    
    if (pendingTransferContracts){
      return (
        <>
          <h4 style={{textAlign: 'center'}}>this page is for incoming transfers only. Transferring provenances is only allowed from the individual item pages.  Visit your <Link href="/provenances">items</Link> page to transfer provenances or <Link href="/guides/tutorial">here</Link> to learn how.</h4>
          <nav>
          {pendingTransferContracts.map((array, index) => {
          
          const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo } = array;
          const provenanceAddress = ProvenanceContract.address;
          const{ serial, brand, instrumentDeedToken, model, year, typeOfProvenance } = ProvenanceProps;   
          const { ownerAddress, name, verificationPhotoHash} = ProvenanceOwnerInfo;


           
         
            return (

              <div className={styles.container} key={provenanceAddress}>
                <Container>
                  <Link href={`/incoming-transfers/${provenanceAddress}`}>
                  
                    <a>    
                        <Card key={provenanceAddress + 'card'} className="mx-auto mt-5 pt-2" style={{width: '75%'}}>
                          <h2 style={{color: 'red'}}>PENDING TRANSFER</h2>
                          <p>click to begin claim</p>
                          <h4>{brand} {model}</h4>
                            <Card.Body>
                              <Row>
                                <Col>
                                  <img key={provenanceAddress+ verificationPhotoHash} src={ipfsGetterRootURL + verificationPhotoHash}  style={{objectFit: 'contain', width: '100%'}}  />
                                </Col>

                                <Col>
                                  <Table key={provenanceAddress+Math.random()} className="w-50 mb-5 mx-auto rounded border-3 border-dark" responsive striped bordered>
                                    
                                    <tbody> 
                                      <tr key={provenanceAddress+provenanceAddress}>
                                        <td>Provenance Address: {provenanceAddress}</td>
                                      </tr>
                                      <tr key={provenanceAddress+brand}>
                                        <td>Brand: {brand}</td>
                                      </tr>
                                      <tr key={provenanceAddress+model}>
                                        <td>Model: {model}</td>
                                      </tr>
                                      <tr key={provenanceAddress+instrumentDeedToken.toString()+ Math.random()}>
                                        <td>Token ID: {instrumentDeedToken.toString()}</td>
                                      </tr>
                                      <tr key={provenanceAddress+typeOfProvenance+ Math.random()}>
                                        <td>Type of Item: {typeOfProvenance.toString()}</td>
                                      </tr>
                                      <tr key={provenanceAddress+year}>
                                        <td>Year: {year}</td>
                                      </tr>
                            
                                    </tbody>
                                  </Table>
                                </Col>

                              </Row>
                            </Card.Body>
                        </Card>
                      </a>
                    </Link>
                </Container>                 
              </div>
              )
            })
          }
                
          </nav>
        </>
       )} else {
         return (
           null
         )
       }
}


  return (
    <>
    {pendingTransferContracts && pendingTransferContracts.length > 0 ?
    <TransferTable />
      :
    <div className={styles.container}>
      <h1 style={{paddingTop: '20%'}}>You have no pending Provenance transfers.</h1>
    </div>
    }
    </>

      
  )
 
    
}


export default IncomingTransfers;




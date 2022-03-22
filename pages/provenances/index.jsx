import { useEffect, useState } from 'react';

//ethers import
import { ethers } from 'ethers';

//nav imports
import RegisterItem from '../register-item/index.js'
import OwnedItem from '../owned-item/OwnedItem';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';


//context imports
import { useContractContext } from '../../src/context/ContractContext';
import { useItemContext } from '../../src/context/ItemContext';
import { useUserContext } from '../../src/context/UserContext';

//style imports
import styles from './ProvenanceHub.module.css';
import { Container, Table, Row, Col, Card, } from 'react-bootstrap';



const ProvenanceMain = () => {


  const { mainAccount, signer } = useUserContext()

  const { MothershipContract, TokenContract } = useContractContext();

  const {tokens, setTokens, items, setItems, itemAdded, provenanceObjects, ipfsGetterRootURL, setProvenanceObjects} = useItemContext();

  const router = useRouter();


  // to rebuild page and add new item. can probably be optimized.
  useEffect(() => {
    if (itemAdded){
      router.reload();
    }
    
  },[itemAdded])


  const ItemTable = () => {

    
    if (provenanceObjects){
      return (
        <>
          <nav>
          {provenanceObjects.map((array, index) => {
          
          const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo } = array;
          const provenanceAddress = ProvenanceContract.address;
          const{ serial, brand, instrumentDeedToken, model, year, typeOfProvenance } = ProvenanceProps;   
          const { ownerAddress, name, verificationPhotoHash} = ProvenanceOwnerInfo;



         
            return (

              <div className={styles.container}>
                <Container>
                  <Link href={`/provenances/${provenanceAddress}`}>
                  
                    <a>  
                        {console.log(`/provenances/${provenanceAddress}`, "tracking url")}     
                        <Card key={provenanceAddress + 'card'} className="mx-auto mt-5 pt-2" style={{width: '75%'}}>
                          <h2>{brand} {model}</h2>
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
          <p>nothing to show here</p>
        )}
}

   

    return(
        <div className={styles.container}>
        
          <h3>Registered Provenances for <br/> {mainAccount}</h3>
          {/*
          <button onClick={async ()=> {console.log(await MothershipContract.getOwnersInstruments())}}>Get Instruments via Contract</button>
          <button onClick={()=> {console.log((provenanceObjects))}}>Provenance Objects</button>
          <button onClick={async ()=> {console.log(items)}}>Get Items in State</button>
          */}
          {/*<TokensOwned />*/}
          

 
          <ItemTable />

          <nav>
                <Link href="/register-item">RegisterItem</Link>
                <div></div>
                
                <div></div>
                <Link href='/'>Home</Link>
          </nav>     
        </div>
    )
}


export default ProvenanceMain;




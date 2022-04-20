import { useEffect, useState } from 'react';

//ethers import
import { ethers } from 'ethers';


import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';


//context imports
import { useItemContext } from '../../../src/context/ItemContext';
import { useUserContext } from '../../../src/context/UserContext';

//style imports
import styles from './ItemTable.module.css';
import { Container, Table, Row, Col, Card, Spinner } from 'react-bootstrap';


const ItemTable = ({ provenanceObjects, search }) => {


  const { mainAccount, signer } = useUserContext()


  const {ipfsGetterRootURL} = useItemContext();


  const ProvenanceTable = () => {
    
    if (provenanceObjects && provenanceObjects.length > 0){
      return (
        <>
          
          {provenanceObjects.map((array, index) => {
          
          const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo, ProvenancePendingOwner } = array;
          const provenanceAddress = ProvenanceContract.address;
          const{ serial, brand, instrumentDeedToken, model, year, typeOfProvenance } = ProvenanceProps;   
          const { ownerAddress, name, verificationPhotoHash, date} = ProvenanceOwnerInfo;
          
          const pendingBool = ProvenancePendingOwner === ethers.constants.AddressZero;

         
            return (
              
              <div key={provenanceAddress}>
                <Container>
                  <Link href={pendingBool ? `search/${provenanceAddress}` : "/provenances" }>
                
                      <Card 
                        key={provenanceAddress + 'card'} 
                        className={pendingBool ? styles.ownedContainer : styles.pendingContainer}>
                        
                        <h2 className={pendingBool ? styles.linkPlacebo : null }>{brand} {model}</h2>

                        {pendingBool ? null : <p style={{color: 'red'}}>This provenance has been released and is awaiting claim by buyer {ProvenancePendingOwner}</p> }
                        
                          <Card.Body>
                            <Row>
                              <Col>
                                <img key={provenanceAddress+ verificationPhotoHash} src={ipfsGetterRootURL + verificationPhotoHash}  style={{objectFit: 'contain', width: '100%'}}  />
                              </Col>

                              <Col>
                                <Table key={provenanceAddress+Math.random()} className="w-50 mb-5 mx-auto rounded border-3 border-dark" responsive striped bordered>
                                  
                                  <tbody> 
                                    {search ?
                                        <tr key={ownerAddress+ownerAddress}>
                                        <td>Owner Address: {ownerAddress}</td>
                                        </tr>
                                        : null
                                    }
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
                 
                  </Link>
                </Container>                 
              </div>
              )
            })
          }
             
  
          
        </>
       )} else {
        return (
          <>
            <h1 style={{paddingTop: '20vh'}}>You have no registered Provenances.</h1>
          </>


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
          <ProvenanceTable />

    
        </div>
    )
}


export default ItemTable;




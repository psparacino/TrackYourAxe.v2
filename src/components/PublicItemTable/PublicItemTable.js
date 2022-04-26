import { useEffect, useState } from 'react';

//ethers import
import { ethers } from 'ethers';


import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';


//context imports
import { useItemContext } from '../../context/ItemContext';
import { useUserContext } from '../../context/UserContext';

//style imports
import styles from './ItemTable.module.css';
import { Container, Table, Row, Col, Card, Spinner } from 'react-bootstrap';
import { formatEther, hexlify } from 'ethers/lib/utils';


const PublicItemTable = ({ provenanceObjects }) => {


  const { mainAccount, signer } = useUserContext()


  const {ipfsGetterRootURL} = useItemContext();

  const router = useRouter();

  const ProvenanceTable = () => {
    
    if (provenanceObjects && provenanceObjects.length > 0){
      return (
        <Container>
          <Row xs={1} md={1}>
          
          {provenanceObjects.map((array, index) => {
          
          const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo, ProvenancePendingOwner, ProvenanceCurrentOffer } = array;
          const provenanceAddress = ProvenanceContract.address;
          const{ serial, brand, instrumentDeedToken, model, year, typeOfProvenance } = ProvenanceProps;   
          const { ownerAddress, name, verificationPhotoHash, date} = ProvenanceOwnerInfo;
          const { buyer, offer } = ProvenanceCurrentOffer;
          const currentOffer = ethers.utils.formatEther(offer.toString());
          

          


          const pendingBool = !(ProvenancePendingOwner === ethers.constants.AddressZero);

          const ownerBool = (ownerAddress === mainAccount);


         
            return (
            
        
              <div key={provenanceAddress}>
                {/* <Container> */}
                <Col>
                  {/* not a complete fix, need to deactivate transfer functions on direct provenance url as well, not just deactivate link   */}
                  <Link href={ownerBool ? 
                                pendingBool ? `${router.pathname}` : `provenances/${provenanceAddress}`
                                  : `search/${provenanceAddress}` }>

                      <Card 
                        key={provenanceAddress + 'card'} 
                        id={ownerBool ?  
                              pendingBool ? styles.pendingBorder : styles.ownedBorder : null}
                        className={pendingBool ? styles.pendingContainer : styles.ownedContainer}>
                        <h2 className={ownerBool ? (pendingBool ? styles.linkPlacebo : null ) : console.log("nope")}>{brand} {model}</h2>
                        {(pendingBool && ownerBool) ? <p style={{color: 'red'}}>This provenance has been released and is awaiting claim by buyer {ProvenancePendingOwner}</p> : null }
                        
                          <Card.Body>
                            <Row>
                              <Col>
                                <img key={provenanceAddress+ verificationPhotoHash} src={ipfsGetterRootURL + verificationPhotoHash}  style={{objectFit: 'contain', width: '100%'}}  />
                              </Col>

                              <Col>
                                <Table key={provenanceAddress+Math.random()} className="w-50 mb-5 mx-auto rounded border-3 border-dark" responsive striped bordered>
                                  
                                  <tbody> 
                                    {ownerBool ?
                                        null
                                        :
                                        <tr key={ownerAddress+ownerAddress}>
                                          <td>Owner Address: {ownerAddress}</td>
                                        </tr>
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
                  </Col>
                {/* </Container>                  */}
              </div>
              )
            })
          }
             
  
          </Row>
        </Container>
       )} else {
        return (
          <div>
            {(mainAccount) ?
              <>
                <h1 style={{paddingTop: '20vh'}}>No Provenances Returned.</h1>
              </>
              :
              <>
                <h1 style={{paddingTop: '20vh'}}>You have no registered Provenances.</h1>
              </>
            }
          </div>


        )}
}

   

    return(
        <div className={styles.container}>
          {(mainAccount) ?
            null
          : <h3>Registered Provenances for <br/> {mainAccount}</h3>
          }     
          {/*<TokensOwned />*/}
          <ProvenanceTable />

    
        </div>
    )
}


export default PublicItemTable;




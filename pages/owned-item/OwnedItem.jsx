import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

//next imports
import Link from 'next/link'
import { useRouter } from 'next/router';

//react-bootstrap imports
import { Container, Carousel, Table, Row, Col, Card, Image, Button, ListGroup, ListGroupItem} from 'react-bootstrap';

//abi
import Provenance from '../../artifacts/contracts/Provenance.sol/Provenance.json';

//import './pagesStyling/OwnedItem.css'

//image imports
import greencheckmark from '../../public/images/green_checkmark.png';
import waitingkitten from '../../public/images/waitingkitten.jpeg';


const OwnedItem = ({mainAccount, TokenContract, provider, signer}) => {
  const [buyerAccount, setBuyerAccount] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const [contract, setContract] = useState();

  let router = useRouter();

  //VERY TEMPORARY SOLUTION!!!@! NEEDS TO LIFTED/FIXED AFTER SWITCH TO NEXT
  useEffect(async()=> {
    if (provenanceAddress){
    const ProvenanceObject = new ethers.Contract(provenanceAddress, Provenance.abi, signer);
    setContract(ProvenanceObject)};
    
},[]) 

  const location = useLocation();
  //console.log(location.state, "full props")
  const ProvProps = location.state.ProvenanceFullProps;

    const { 
      ownerAddress, 
      provenanceAddress, 
      brand, 
      serial, 
      instrumentDeedToken, 
      model, 
      name, 
      typeOfProvenance, 
      verificationPhotoHash, 
      year, 
      ipfsGetterRootURL
    } = ProvProps;


    async function sellProvenance() {
      setErrorMessage('')
      if (ethers.utils.isAddress(buyerAccount)) {

        await TokenContract.approve(provenanceAddress, instrumentDeedToken)
        .then(async(result) => {
          provider.waitForTransaction(result.hash)
          .then(async(mined) => {
              if (mined) {
                await contract.sale(buyerAccount, waitingkitten, verificationPhotoHash)
                .then(async(result) => {
                  provider.waitForTransaction(result.hash)
                  .then(async(mined) => {
                    if (mined) {
                      navigate(`/${mainAccount}`)
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
    

    return( 
      
      <Container>
      {console.log(contract, "contract")}
        <div>              
          <h2>{brand} {model}: {serial}</h2>
          <p></p>
          <h3>Verification Photo Image</h3>
          <img src={ipfsGetterRootURL + verificationPhotoHash} style={{width: '50%'}} />
          <h2 style={{paddingTop: '30px'}}>Provenance Information</h2>         
          <Table  bordered>
            <tbody>
              <tr>
                <td className='bold' style={{width :'50%'}}>Provenance Contract Address</td>
                <td>{provenanceAddress}</td>
              </tr>
              <tr>
                <td>Token ID attached to this Provenance:</td>
                <td>{instrumentDeedToken}</td>
              </tr>
              <tr>
                <td>Type of Provenance</td>
                <td>{typeOfProvenance}</td>
              </tr>
              <tr>
                <td>Provenance Owner Address</td>
                <td>{ownerAddress}</td>
              </tr>
              <tr>
                <td>Owner Name (optional)</td>
                <td>{name}</td>
              </tr>
              <tr>
                <td>Item Model</td>
                <td>{model}</td>
              </tr>
              <tr>
                <td>Year Manufactured</td>
                <td>{year}</td>
              </tr>
              <tr>
                <td>Serial Number</td>
                <td>{serial}</td>
              </tr>


              </tbody>
            </Table>
          <Carousel />

          {errorMessage ?
          <p>{errorMessage}</p> : null}
          <p>sellTo Address: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720</p>
          <input 
              name="userAddress" 
              type="text" 
              placeholder='enter address to transfer to here'
              onChange={(e) => setBuyerAccount(e.target.value)} 
              value={buyerAccount || ''}
              style={{width: '65%', height: '40px', fontSize: '20px', marginTop: '30px', textAlign: 'center'}} />

          <div>
            <button onClick={sellProvenance}>Transfer This Token and Provenance</button>  
          </div>    

          <div>
            <Link to={`/${mainAccount}`}>Back To Main</Link> 
          </div>
          
          
        </div>
        </Container>
        
    )
    
}

export default OwnedItem;

export async function getStaticPaths() {
  // Return a list of possible value for id
}

export async function getStaticProps({ params }) {
  // Fetch necessary data for the blog post using params.id
}
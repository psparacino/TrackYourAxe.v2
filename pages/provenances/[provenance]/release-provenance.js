import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

//next imports
import Link from 'next/link'
import { useRouter } from 'next/router';

//react-bootstrap imports
import { Container, Carousel, Table, Row, Col, Card, Image, Button, ListGroup, ListGroupItem, InputGroup, Form, FormControl} from 'react-bootstrap';

// context imports
import { useItemContext } from '../../../src/context/ItemContext';
import { useContractContext } from '../../../src/context/ContractContext';
import { useUserContext } from '../../../src/context/UserContext';

import { useTransferContext } from '../../../src/context/TransferContext';

// styles
import styles from './release-provenance.module.css'
import { use } from 'chai';

// images

import greenCheckMark from '../../../public/images/green_checkmark.png'



const ReleaseProvenance = () => {


    const { provenanceObjects, ipfsGetterRootURL } = useItemContext();
    const { TokenContract, MothershipContract } = useContractContext();
    const { mainAccount, provider } = useUserContext();

    const [ pendingTransfer, setPendingTransfer ] = useState(false);
    const [ transferInitiated, setTransferInitiated ] = useState(false)
    const [ loaded, setLoaded] = useState(false)
    const [ pendingTransferAddress, setPendingTransferAddress ] = useState();
    const [ buyerAccount, setBuyerAccount ] = useState();
    const [ addressErrorMessage, setAddressErrorMessage ] = useState('')

    const [ successMessage, setSuccessMessage ] = useState('');

    const [ tokenApproved, setTokenApproved ] = useState(false);
    const [ approvedBuyerAccount, setApprovedBuyerAccount ] = useState()

    const [ outgoingContract, setOutgoingContract ] = useState()
    const [ outgoingProvenanceProps, setOutgoingProvenanceProps ] = useState()
    const [ outgoingProvenanceOwnerInfo, setOutgoingProvenanceOwnerInfo ] = useState()


    const router = useRouter();
    const { provenance } = router.query;


    useEffect(async() => {
        if (provenanceObjects && provenance) {
        loadProvenance()
      }
        async function loadProvenance() { 
          for (let contract of provenanceObjects) {
            if (contract.ProvenanceContract.address == provenance) {
              const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo } = contract;
    
              setOutgoingContract(ProvenanceContract);
              setOutgoingProvenanceProps(ProvenanceProps);
              setOutgoingProvenanceOwnerInfo(ProvenanceOwnerInfo);
              setLoaded(true)
            }
          }
        }
      },[provenanceObjects, provenance])

    useEffect(async() => {
        if (TokenContract && outgoingProvenanceProps) {
        checkApproved();
        }
        async function checkApproved() {
            const result = await TokenContract.getApproved(outgoingProvenanceProps.instrumentDeedToken.toString());
            if (result === outgoingContract.address) {
                setTokenApproved(true)
            }
        }   

      },[TokenContract, outgoingProvenanceProps])



     useEffect(async() => {

        if (outgoingContract || transferInitiated) {
          const pendingOwner = await outgoingContract.pendingOwner()

          if (pendingOwner != ethers.constants.AddressZero) {
            setPendingTransfer(true)
            setPendingTransferAddress(pendingOwner)
          }} else {
              console.log("No Pending Owner")
          }
      
         },[outgoingContract, transferInitiated])
    

    const handleChange = event => {
      console.log(event.target.value, "value")
      setBuyerAccount(event.target.value);
    }


    async function approveTransfer() {
    setSuccessMessage('')
    setAddressErrorMessage('')
    await TokenContract.approve(outgoingContract.address, outgoingProvenanceProps.instrumentDeedToken.toString())
    .then(async(result) => {
        provider.waitForTransaction(result.hash)
        .then(async(mined) => {
        if (mined) {
            setSuccessMessage('Transaction Success')
            setTokenApproved(true)
            }})
        .catch((error)=> {
                console.log(error)       
                })               
            })        
          }

    async function revokeTransferApproval() {
      await TokenContract.approve(ethers.constants.AddressZero, outgoingProvenanceProps.instrumentDeedToken.toString())
      .then(async(result) => {
          provider.waitForTransaction(result.hash)
          .then(async(mined) => {
          if (mined) {
              setSuccessMessage('Transaction Success')
              setTokenApproved(false)
              }})
          .catch((error)=> {
                  console.log(error)       
                  })               
              })   

    }

    // approve zero address for revoke approval for transfer
    //   break this into--> approve and then set pending owner

    async function release() {
      setSuccessMessage('')
      setAddressErrorMessage('')
      setTransferInitiated(false)
      if (ethers.utils.isAddress(buyerAccount) && buyerAccount != mainAccount) {
        await outgoingContract.setPendingOwner(buyerAccount)
        .then(async(result) => {
          provider.waitForTransaction(result.hash)
          .then(async(mined) => {
            if (mined) {
              setSuccessMessage('Transaction Success')
              setTransferInitiated(true)
              }}
            )})
        .catch((error)=> {
          console.log(error)       
          })
      }  else {
        setAddressErrorMessage('You are either attempting to transfer to your own Ethereum address or an invalid address. Please check and re-enter.')
      }
    }
    
    if (loaded){
      return (          
        <Container className={styles.transferContainer}>
            <h1>Transfer Provenance {outgoingContract.address}</h1>
            
            {pendingTransfer ? 

                <div className={styles.containerBorder}>
                    {successMessage ?
                    <p>{successMessage}</p> : null}
                    <h4>This provenance has been released and is awaiting claim & verification by: <p>{pendingTransferAddress}</p></h4>
                </div> 
                
            :
                
                <div>
                <h2>Step 1: Approve This Token For Transfer {tokenApproved ? <Image src={greenCheckMark.src} height="20px"/> : null}</h2>
                {tokenApproved ? <Button variant="danger" onClick={revokeTransferApproval}>Made a mistake?  Revoke Token Approval</Button> : <Button onClick={approveTransfer}>Approve Token Transfer</Button>}
                <h2>Step 2: Release this Provenance for Claim</h2>
                <h4>This step ***cannot*** be undone. Please be sure and double-check everything.</h4>
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
                    style={{width: '65%', height: '40px', fontSize: '20px', textAlign: 'center'}} />
                              {successMessage ?
                    <p>{successMessage}</p> : null}


                <div className='mt-2'>
                    <Button style={{fontSize: '40px', borderRadius: '20px'}} onClick={release}>Release this Provenance</Button>  
                </div>    

                </div>

        }
        </Container>  
      )} else {
          return (
              <h1>Loading Provenance Information...</h1>
          )
      }
    }

    export default ReleaseProvenance;
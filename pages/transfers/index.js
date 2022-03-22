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



// styles
import styles from './transfers.module.css'


const Transfers = () => {

  const { provenanceObjects, ipfsGetterRootURL } = useItemContext();
  const { MothershipContract } = useContractContext();
  const { mainAccount, provider, signer } = useUserContext();
  const router = useRouter();


  const [ loaded , setLoaded ] = useState(false);

  const [ pendingTransferContracts, setPendingTransferContracts ] = useState();

  const [buyerAccount, setBuyerAccount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
 
  //load all pending transfers
  useEffect(async() => {
    if (MothershipContract) {
      populateTransfers()
      .then(result => console.log(result, "transfer populate result"))
      .catch(error => console.log(error, 'populate error'));
    }
    async function populateTransfers() {
      let transferArray = [];
        const transferItems = await MothershipContract.getPendingTransfersOfBuyer(mainAccount)
        console.log(transferItems)
      
          for (let address of transferItems) {
              const ProvenanceTransferContract = new ethers.Contract(address, Provenance.abi, signer);
              const ProvenanceTransferProps = await ProvenanceTransferContract.instrument()
              const index = ProvenanceTransferContract.ownerCount();
              const ProvenanceOwnerInfo = await ProvenanceTransferContract.ownerProvenance(index);

              transferArray.push({'ProvenanceContract': ProvenanceTransferContract, 'ProvenanceProps': ProvenanceTransferProps, 'ProvenanceOwnerInfo': ProvenanceOwnerInfo})
            }
        setPendingTransferContracts(transferArray);          
    }   
      
  },[MothershipContract, mainAccount])


  return (
      <p>There's something here</p>
  )

  
    
}


export default Transfers;




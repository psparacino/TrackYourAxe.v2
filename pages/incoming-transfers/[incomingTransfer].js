import { useEffect, useState, useReducer } from "react";
import { ethers } from "ethers";

//next imports
import Link from "next/link";
import { useRouter } from "next/router";

//react-bootstrap imports
import {
  Container,
  Carousel,
  Table,
  Row,
  Col,
  Card,
  Image,
  Button,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";

// context imports
import { useItemContext } from "../../src/context/ItemContext";
import { useContractContext } from "../../src/context/ContractContext";
import { useUserContext } from "../../src/context/UserContext";
import { useTransferContext } from "../../src/context/TransferContext";

// component imports
import DragAndDrop from "../../src/components/DragAndDrop.js";
import PhotoPreviews from "../../src/components/PhotoPreviews.js";

// styles
import styles from "./transfers.module.css";

const formReducer = (state, event) => {
  if (event.reset) {
    return {
      verificationphotohash: [],
      instrumentphotohashes: [],
    };
  }

  return {
    ...state,
    [event.name]: event.value,
  };
};

const TransferProfile = () => {
  // contexts
  const { ipfsGetterRootURL, setItemAdded } = useItemContext();
  const { TokenContract, MothershipContract } = useContractContext();
  const { pendingTransferContracts, setPendingTransferContracts } =
    useTransferContext();
  const { mainAccount, provider, dateString } = useUserContext();

  const router = useRouter();
  const { incomingTransfer } = router.query;
  console.log(router.query);

  const [loaded, setLoaded] = useState(false);

  // contract info
  const [provenanceContract, setProvenanceContract] = useState();
  const [provenanceProps, setProvenanceProps] = useState();
  const [provenanceOwnerInfo, setProvenanceOwnerInfo] = useState();

  const [formData, setFormData] = useReducer(formReducer, {
    instrumentphotohashes: [],
    verificationphotohash: [],
  });

  const [buyerAccount, setBuyerAccount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  //load all info

  useEffect(async () => {
    if (pendingTransferContracts && incomingTransfer) {
      loadProvenance();
    }

    async function loadProvenance() {
      for (let contract of pendingTransferContracts) {
        if (contract.ProvenanceContract.address === incomingTransfer) {
          console.log("hitting");

          const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo } =
            contract;

          setProvenanceContract(ProvenanceContract);
          setProvenanceProps(ProvenanceProps);
          setProvenanceOwnerInfo(ProvenanceOwnerInfo);
          setLoaded(true);
        }
      }
    }
  }, [pendingTransferContracts, incomingTransfer]);

  function ClaimProvenance() {
    console.log(formData.verificationphotohash.length > 1);

    async function claim() {
      await provenanceContract
        .claimOwnership(
          provenanceOwnerInfo.ownerAddress,
          formData.verificationphotohash,
          dateString
        )
        .then(async (result) => {
          provider.waitForTransaction(result.hash).then(async (mined) => {
            if (mined) {
              //need to autopush on transaction mine, and make sure new data is pulled to delete pending and add to provObjects
              setItemAdded(true);
              router.push(`/provenances`);
            }
          });
        });
    }
    return (
      <div style={{ paddingTop: "10px" }}>
        <Button
          onClick={claim}
          disabled={formData.verificationphotohash.length === 0}
        >
          CLAIM THIS PROVENANCE
        </Button>
      </div>
    );
  }
  console.log(loaded, "loaded check");

  if (loaded) {
    const {
      serial,
      brand,
      instrumentDeedToken,
      model,
      year,
      typeOfProvenance,
    } = provenanceProps;

    return (
      <Container>
        <div className={styles.container}>
          <h1>Claim Provenance</h1>
          <DragAndDrop
            photoLimit={1}
            formDataImport={formData}
            setFormData={setFormData}
            claimPhoto={true}
          />
          {formData.verificationphotohash ? (
            <PhotoPreviews
              photoLimit={1}
              formData={formData}
              claimPhoto={true}
            />
          ) : null}

          <ClaimProvenance />
          <hr />
          <h1 style={{ paddingTop: "30px" }}>Provenance Information</h1>
          <h2>
            {brand} {model}: {serial}
          </h2>
          <p></p>
          <img
            src={ipfsGetterRootURL + provenanceOwnerInfo.verificationPhotoHash}
            style={{ width: "50%" }}
          />
          <hr />
          <Table bordered>
            <tbody>
              <tr>
                <td className="bold" style={{ width: "50%" }}>
                  Provenance Contract Address
                </td>
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

          {errorMessage ? <p>{errorMessage}</p> : null}
        </div>
      </Container>
    );
  } else {
    return <p>No pending transfer for this provenance.</p>;
  }
};

export default TransferProfile;

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
 function ClaimProvenance() {

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

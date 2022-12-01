import { useEffect, useState } from "react";
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
  InputGroup,
  Form,
  FormControl,
  Spinner,
} from "react-bootstrap";

// context imports
import { useItemContext } from "../../../src/context/ItemContext";
import { useContractContext } from "../../../src/context/ContractContext";
import { useUserContext } from "../../../src/context/UserContext";
import { useTransferContext } from "../../../src/context/TransferContext";

// components imports

import ProvenanceHistory from "../../../src/components/ProvenanceHistory/ProvenanceHistory.js";

// styles
import styles from "../ProvenanceHub.module.css";

const ProvenanceProfile = () => {
  const { provenanceObjects, ipfsGetterRootURL, bytes32ToString } =
    useItemContext();
  const { TokenContract, MothershipContract } = useContractContext();
  const { mainAccount, provider } = useUserContext();
  const { setOutgoingContract } = useTransferContext();
  const router = useRouter();

  const { provenance } = router.query;

  const [loaded, setLoaded] = useState(false);

  const [provenanceContract, setProvenanceContract] = useState();
  const [provenanceProps, setProvenanceProps] = useState();
  const [provenanceOwnerInfo, setProvenanceOwnerInfo] = useState();

  //load all info
  useEffect(() => {
    if (provenanceObjects && provenance) {
      loadProvenance();
    }
    // would be faster search with an object not a for loop. not sure how that would work with the map though.
    async function loadProvenance() {
      for (let contract of provenanceObjects) {
        if (contract.ProvenanceContract.address == provenance) {
          const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo } =
            contract;

          setProvenanceContract(ProvenanceContract);
          setProvenanceProps(ProvenanceProps);
          setProvenanceOwnerInfo(ProvenanceOwnerInfo);
          setLoaded(true);
        }
      }
    }
  }, [provenanceObjects, provenance]);

  function loadAndPush() {
    const address = provenanceContract.address;
    router.push(`/provenances/${address}/release-provenance`);
  }

  const ItemPhotoCarousel = () => {
    const itemPhotoArray = provenanceProps.itemPhotos;

    return (
      <div className="previewPhoto">
        <hr />
        <h2>Item Photos</h2>
        {itemPhotoArray.length > 0 ? (
          <Carousel variant="dark">
            {itemPhotoArray.map((photo, index) => {
              return (
                <Carousel.Item key={index}>
                  <img
                    key={photo}
                    src={ipfsGetterRootURL + photo}
                    alt="item photos not yet loaded"
                    className={styles.itemPhotoCarousel}
                  />
                </Carousel.Item>
              );
            })}
          </Carousel>
        ) : (
          <div>
            <h2>Item Photos Loading</h2>
            <Spinner animation="border" className="mx-auto" />
          </div>
        )}
      </div>
    );
  };

  //   const ProvenanceHistory = () => {

  //     const [ provenanceHistoryArray, setProvenanceHistoryArray ] = useState([]);

  //     useEffect(async() => {

  //       if (MothershipContract) {
  //       loadProvenanceHistory()
  //       }
  //       async function loadProvenanceHistory() {
  //           const history = await provenanceContract.getOwnershipHistory();
  //           const historyShift = [...history];
  //           historyShift.shift();
  //           setProvenanceHistoryArray(historyShift);

  //         }
  //     },[MothershipContract])

  //     if (loaded){
  //       return (
  //           <div>
  //           <hr />
  //           <h1>Provenance Ownership History</h1>
  //           {provenanceHistoryArray.map((provenanceOwnerInfo, index)=> {
  //             const { ownerAddress, date, verificationPhotoHash, ownerCount  } = provenanceOwnerInfo;

  //             const dateFormatted = bytes32ToString(date)

  //             return (

  //               <Container key={ownerAddress}>
  //                 <Card>

  //                   <Card.Header>Owner {ownerCount}</Card.Header>
  //                     <Card.Body>
  //                       <div className={styles.cardContainer}>
  //                         <div className={styles.cardPhotoContainer}>
  //                           <Image src={ipfsGetterRootURL+verificationPhotoHash} className={styles.cardPhoto} alt={'verification photo'} />
  //                         </div>
  //                         <div className={styles.cardInfoContainer}>
  //                           <Card.Title>Owner Address</Card.Title>
  //                           <Card.Text style={{color: 'black'}}>
  //                             {ownerAddress}
  //                           </Card.Text>
  //                           <Card.Title>Date Acquired</Card.Title>
  //                           <Card.Text style={{color: 'black'}}>
  //                             {dateFormatted}
  //                           </Card.Text>

  //                           <Card.Title>Notes</Card.Title>
  //                           <Card.Text style={{color: 'black'}}>
  //                             Additional data can maybe stored off-chain?
  //                           </Card.Text>
  //                         </div>

  //                       </div>

  //                     </Card.Body>
  //                   </Card>
  //                 </Container>
  //               )
  //             })
  //           }
  //         </div>

  //        )} else {
  //         return (
  //           <p>nothing to show here</p>
  //         )}
  // }

  if (loaded) {
    const {
      serial,
      brand,
      instrumentDeedToken,
      model,
      year,
      typeOfProvenance,
    } = provenanceProps;

    const brandFormatted = bytes32ToString(brand);

    const modelFormatted = bytes32ToString(model);

    const serialFormatted = bytes32ToString(serial);

    return (
      <Container>
        <div className={styles.container}>
          <h2>
            {brandFormatted} {modelFormatted}: {year}
          </h2>
          <p></p>
          <h3>Verification Photo Image</h3>
          <img
            src={ipfsGetterRootURL + provenanceOwnerInfo.verificationPhotoHash}
            style={{ width: "50%" }}
            alt="getter url"
          />
          <h2 style={{ paddingTop: "30px" }}>Provenance Information</h2>
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
                <td>{modelFormatted}</td>
              </tr>
              <tr>
                <td>Year Manufactured</td>
                <td>{provenanceProps.year}</td>
              </tr>
              <tr>
                <td>Serial Number</td>
                <td>{serialFormatted}</td>
              </tr>
            </tbody>
          </Table>

          <ItemPhotoCarousel />
          <ProvenanceHistory
            provenanceContract={provenanceContract}
            loaded={loaded}
          />
          <hr />

          <Button onClick={loadAndPush}>
            Begin Transfer for this Provenance
          </Button>
        </div>
      </Container>
    );
  } else {
    return (
      <h1 style={{ paddingTop: "20vh" }}>You do not own this Provenance.</h1>
    );
  }
};

export default ProvenanceProfile;

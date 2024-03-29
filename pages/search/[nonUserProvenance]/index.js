import { useEffect, useState } from "react";
import { ethers, Signer } from "ethers";

//next imports
import Link from "next/link";
import { useRouter } from "next/router";

import Provenance from "../../../artifacts/contracts/Provenance.sol/Provenance.json";

//react-bootstrap imports
import {
  Container,
  Carousel,
  Table,
  Card,
  Image,
  Button,
  Spinner,
} from "react-bootstrap";

// context imports
import { useItemContext } from "../../../src/context/ItemContext";
import { useContractContext } from "../../../src/context/ContractContext";
import { useUserContext } from "../../../src/context/UserContext";
import { useTransferContext } from "../../../src/context/TransferContext";

// styles
import styles from "../Search.module.css";

//  components Imports

import { OfferModal } from "../../../src/components/OfferModal/OfferModal";

import ProvenanceHistory from "../../../src/components/ProvenanceHistory/ProvenanceHistory";

const NonUserProvenance = () => {
  const { ipfsGetterRootURL, bytes32ToString } = useItemContext();
  const { TokenContract, MothershipContract } = useContractContext();
  const { mainAccount, provider, signer } = useUserContext();

  const router = useRouter();

  const { nonUserProvenance } = router.query;

  const [loaded, setLoaded] = useState(false);
  const [provenanceContract, setProvenanceContract] = useState();
  const [provenanceProps, setProvenanceProps] = useState();
  const [provenanceOwnerInfo, setProvenanceOwnerInfo] = useState();

  //load all info
  useEffect(() => {
    if (nonUserProvenance && signer) {
      loadSingleProvenance().catch((error) =>
        console.log(error, "populate error")
      );
    }
    // would be faster search with an object not a for loop. not sure how that would work with the map though.

    async function loadSingleProvenance() {
      const SingleContract = new ethers.Contract(
        nonUserProvenance,
        Provenance.abi,
        signer
      );

      const ProvenanceDetails = await SingleContract.instrument();
      const itemPhotos = await SingleContract.getItemPics();
      const ProvenanceProps = { ...ProvenanceDetails, itemPhotos };

      const index = SingleContract.ownerCount();
      const ProvenanceOwnerInfo = await SingleContract.ownerProvenance(index);
      console.log(await SingleContract.getOwnershipHistory());

      setProvenanceContract(SingleContract);
      setProvenanceProps(ProvenanceProps);
      setProvenanceOwnerInfo(ProvenanceOwnerInfo);
      setLoaded(true);
    }
  }, [nonUserProvenance, signer]);

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

  const MakeOfferOnProvenance = () => {
    const [newOfferAmount, setNewOfferAmount] = useState();
    const [currentOfferBuyer, setCurrentOfferBuyer] = useState();
    const [currentOfferAmount, setCurrentOfferAmount] = useState(0);
    const [show, setShow] = useState(false);
    const [offerMade, setOfferMade] = useState(false);

    useEffect(() => {
      loadDetails();

      async function loadDetails() {
        const result = await provenanceContract.currentOffer();
        const buyer = result.buyer;
        const offer = result.offer;

        if (buyer !== ethers.constants.AddressZero) setCurrentOfferBuyer(buyer);
        if (offer !== 0.0)
          setCurrentOfferAmount(ethers.utils.formatEther(offer));

        if (offerMade) {
          setOfferMade(false);
        }
      }
    }, [provenanceContract, offerMade]);

    const handleChange = (event) => {
      // console.log(event.target.value, "value")
      setNewOfferAmount(event.target.value);
    };

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    async function approveToken() {
      await TokenContract.approve(
        provenanceContract.address,
        provenanceProps.instrumentDeedToken.toString()
      )
        .then((result) => console.log(result))
        .catch((error) => console.log(error.data.message, "offer error"));
    }

    async function cancel() {
      await provenanceContract
        .cancelOffer()
        .then((result) => console.log(result))
        .catch((error) => console.log(error.data.message, "offer error"));
    }

    async function accept() {
      await provenanceContract
        .acceptOffer()
        .then((result) => console.log(result))
        .catch((error) => console.log(error.data.message, "offer error"));
    }

    return (
      <div>
        {provenanceOwnerInfo.ownerAddress === mainAccount ? (
          <h1>Offers For This Provenance</h1>
        ) : (
          <h1>Make Offer For this Provenance</h1>
        )}

        {currentOfferBuyer ? (
          <div>
            <h4 style={{ paddingBottom: "40px" }}>
              Current Offer By: {currentOfferBuyer} for{" "}
              {ethers.constants.EtherSymbol}
              {currentOfferAmount}{" "}
            </h4>
          </div>
        ) : (
          <div>
            <p>No Current Offers on This Provenance</p>
          </div>
        )}

        {provenanceOwnerInfo.ownerAddress === mainAccount &&
        currentOfferAmount !== (0 || undefined) ? (
          <div>
            <Button variant="primary" onClick={approveToken}>
              Approve Token Transfer
            </Button>
            <Button variant="primary" onClick={accept}>
              Accept Offer
            </Button>
            <Button variant="danger" onClick={cancel}>
              Cancel Offer
            </Button>
            <p>this ***cannot*** be undone</p>
          </div>
        ) : (
          <div>
            <div>
              <Button style={{ fontSize: "40px" }} onClick={handleShow}>
                Make Offer
              </Button>
            </div>

            <OfferModal
              style={{ zindex: "1" }}
              show={show}
              handleClose={handleClose}
              handleChange={handleChange}
              newOfferAmount={newOfferAmount}
              provenanceContract={provenanceContract}
              setOfferMade={setOfferMade}
            />
          </div>
        )}
      </div>
    );
  };

  // need logic here for loading and/or ownership of Contract

  if (loaded && provenanceContract !== undefined) {
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
                <td>Provenance Owner Address</td>
                <td>{provenanceOwnerInfo.ownerAddress}</td>
              </tr>
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
                <td>Owner Name (optional)</td>
                <td>{provenanceOwnerInfo.name}</td>
              </tr>
              <tr>
                <td>Item Model</td>
                <td>{modelFormatted}</td>
              </tr>
              <tr>
                <td>Year Manufactured</td>
                <td>{year}</td>
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
          <p>Address 2: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</p>
          <MakeOfferOnProvenance />
        </div>
      </Container>
    );
  } else {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 style={{ paddingTop: "20vh" }}>
          No Public Provenance at this Address
        </h1>
        <p>if you think you own this item please check in your items</p>
      </div>
    );
  }
};

export default NonUserProvenance;

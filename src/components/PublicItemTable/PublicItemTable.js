import { useEffect, useState } from "react";

//ethers import
import { ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";

// Next Imports
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

//context imports
import { useItemContext } from "../../context/ItemContext";
import { useUserContext } from "../../context/UserContext";

// components Imports

// import Pagination from '../Pagination/Pagination';

//style imports
import styles from "./PublicItemTable.module.css";
import {
  Container,
  Table,
  Row,
  Col,
  Card,
  Spinner,
  NavbarBrand,
} from "react-bootstrap";

const PublicItemTable = ({ provenanceObjects }) => {
  const { mainAccount, signer } = useUserContext();
  const { ipfsGetterRootURL, bytes32ToString } = useItemContext();
  // const [currentPage, setCurrentPage] = useState(1);
  // const [currentProvenances, setCurrentProvenances] = useState();
  // const [postsPerPage] = useState(10);

  // useEffect(()=> {

  //   if (provenanceObjects){
  //   const indexOfLastPost = currentPage * postsPerPage;
  //   const indexOfFirstPost = indexOfLastPost - postsPerPage;
  //   const currentPage = provenanceObjects.slice(indexOfFirstPost, indexOfLastPost);
  //   setCurrentProvenances(currentPage)}

  // },[provenanceObjects])

  // const paginate = pageNum => setCurrentPage(pageNum);

  const router = useRouter();

  const ProvenanceTable = () => {
    if (provenanceObjects && provenanceObjects.length > 0) {
      return (
        <Container>
          <Row xs={1} md={1}>
            {provenanceObjects.map((array, index) => {
              const {
                ProvenanceContract,
                ProvenanceProps,
                ProvenanceOwnerInfo,
                ProvenancePendingOwner,
                ProvenanceCurrentOffer,
              } = array;
              const provenanceAddress = ProvenanceContract.address;

              const {
                serial,
                brand,
                instrumentDeedToken,
                model,
                year,
                typeOfProvenance,
              } = ProvenanceProps;

              const { ownerAddress, name, verificationPhotoHash, date } =
                ProvenanceOwnerInfo;
              const { buyer, offer } = ProvenanceCurrentOffer;

              const currentOffer = formatEther(offer.toString());

              const pendingBool = !(
                ProvenancePendingOwner === ethers.constants.AddressZero
              );

              const ownerBool = ownerAddress === mainAccount;

              return (
                <div key={provenanceAddress}>
                  {/* <Container> */}
                  <Col>
                    {/* not a complete fix, need to deactivate transfer functions on direct provenance url as well, not just deactivate link   */}
                    <Link
                      href={
                        ownerBool
                          ? pendingBool
                            ? `${router.pathname}`
                            : `provenances/${provenanceAddress}`
                          : `search/${provenanceAddress}`
                      }
                      passHref
                    >
                      <Card
                        key={provenanceAddress + "card"}
                        id={
                          currentOffer > 0 && !ownerBool
                            ? styles.offerBorder
                            : null
                        }
                        className={
                          ownerBool
                            ? styles.ownedContainer
                            : pendingBool
                            ? styles.pendingContainer
                            : styles.publicContainer
                        }
                      >
                        {/* fix below h2 */}
                        <h2
                          className={
                            ownerBool
                              ? pendingBool
                                ? styles.linkPlacebo
                                : null
                              : console.log("nope")
                          }
                        >
                          {brand} {model}
                        </h2>
                        {pendingBool && ownerBool ? (
                          <p style={{ color: "red" }}>
                            This provenance has been released and is awaiting
                            claim by buyer {ProvenancePendingOwner}
                          </p>
                        ) : null}
                        {pendingBool && !ownerBool ? (
                          <Link
                            href={`incoming-transfers/${provenanceAddress}`}
                            style={{ color: "red" }}
                          >
                            Claim This Provenance
                          </Link>
                        ) : null}
                        {currentOffer > 0 ? (
                          <h5 style={{ color: "orange" }}>
                            CURRENT OFFER ON THIS PROVENANCE:{" "}
                            {ethers.constants.EtherSymbol}
                            {currentOffer}
                          </h5>
                        ) : null}

                        <Card.Body>
                          <Row style={{ display: "flex" }}>
                            <Col className={styles.imageContainer}>
                              <Card.Img
                                key={provenanceAddress + verificationPhotoHash}
                                src={ipfsGetterRootURL + verificationPhotoHash}
                                layout="fill"
                                objectfit="contain"
                                className={styles.image}
                              />
                            </Col>

                            <Col>
                              <Table
                                key={provenanceAddress + Math.random()}
                                className="w-50 mb-5 mx-auto rounded border-3 border-dark"
                                responsive
                                striped
                                bordered
                              >
                                <tbody>
                                  {ownerBool ? null : (
                                    <tr key={ownerAddress + ownerAddress}>
                                      <td>Owner Address: {ownerAddress}</td>
                                    </tr>
                                  )}
                                  <tr
                                    key={provenanceAddress + provenanceAddress}
                                  >
                                    <td>
                                      Provenance Address: {provenanceAddress}
                                    </td>
                                  </tr>
                                  <tr key={provenanceAddress + brand}>
                                    <td>Brand: {brand}</td>
                                  </tr>
                                  <tr key={provenanceAddress + model}>
                                    <td>Model: {model}</td>
                                  </tr>
                                  <tr
                                    key={
                                      provenanceAddress +
                                      instrumentDeedToken.toString() +
                                      Math.random()
                                    }
                                  >
                                    <td>
                                      Token ID: {instrumentDeedToken.toString()}
                                    </td>
                                  </tr>
                                  <tr
                                    key={
                                      provenanceAddress +
                                      typeOfProvenance +
                                      Math.random()
                                    }
                                  >
                                    <td>
                                      Type of Item:{" "}
                                      {typeOfProvenance.toString()}
                                    </td>
                                  </tr>
                                  <tr key={provenanceAddress + year}>
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
              );
            })}
          </Row>
          {/* <Pagination 
          postsPerPage={20}
          totalPosts={provenanceObjects.length}
          paginate={paginate}
          /> */}
        </Container>
      );
    } else {
      return (
        <div>
          {mainAccount ? (
            <>
              <h1 style={{ paddingTop: "20vh" }}>No Provenances Returned.</h1>
            </>
          ) : (
            <>
              <h1 style={{ paddingTop: "20vh" }}>
                You have no registered Provenances.
              </h1>
            </>
          )}
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      {mainAccount ? null : (
        <h3>
          Registered Provenances for <br /> {mainAccount}
        </h3>
      )}
      {/*<TokensOwned />*/}
      <ProvenanceTable />
    </div>
  );
};

export default PublicItemTable;

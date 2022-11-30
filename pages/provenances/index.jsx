import { useEffect, useState } from "react";

//ethers import
import { ethers } from "ethers";

//nav imports
import RegisterItem from "../register-item/index.js";
// import OwnedItem from '../owned-item/OwnedItem';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

//context imports
import { useContractContext } from "../../src/context/ContractContext";
import { useItemContext } from "../../src/context/ItemContext";
import { useUserContext } from "../../src/context/UserContext";

//style imports
import styles from "./ProvenanceHub.module.css";
import { Container, Table, Row, Col, Card, Spinner } from "react-bootstrap";
import { BeatLoader } from "react-spinners";

import ItemTable from "../../src/components/PublicItemTable/PublicItemTable.js";

const OwnedProvenanceHub = () => {
  const { mainAccount, signer } = useUserContext();
  const {
    itemAdded,
    setItemAdded,
    provenanceObjects,
    ipfsGetterRootURL,
    bytes32ToString,
  } = useItemContext();
  const [loading, setLoading] = useState(false);
  const [hasProvenances, setHasProvenances] = useState(true);

  const router = useRouter();

  // to rebuild page and add new item. can probably be optimized.
  useEffect(async () => {
    const confirmAddition = await itemAdded;
    if (confirmAddition) {
      router.reload();
      setItemAdded(false);
    }
  }, []);

  useEffect(async () => {
    setLoading(true);
    setHasProvenances(false);
    const result = await provenanceObjects;
    if (result.length > 0) {
      setHasProvenances(true);
    }
  }, [provenanceObjects]);

  useEffect(async () => {
    setLoading(false);
  }, [hasProvenances]);

  const OwnedProvenanceTable = () => {
    if (provenanceObjects && provenanceObjects.length > 0 && !loading) {
      return (
        <>
          {provenanceObjects.map((array, index) => {
            const {
              ProvenanceContract,
              ProvenanceProps,
              ProvenanceOwnerInfo,
              ProvenancePendingOwner,
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

            const pendingBool = !(
              ProvenancePendingOwner === ethers.constants.AddressZero
            );
            const ownerBool = ownerAddress === mainAccount;

            const serialFormatted = bytes32ToString(serial);
            const brandFormatted = bytes32ToString(brand);
            const modelFormatted = bytes32ToString(model);

            return (
              <div key={provenanceAddress}>
                <Container>
                  <Link
                    href={
                      pendingBool
                        ? `provenances`
                        : `provenances/${provenanceAddress}`
                    }
                  >
                    <Card
                      key={provenanceAddress + "card"}
                      className={
                        pendingBool
                          ? styles.pendingContainer
                          : styles.ownedContainer
                      }
                    >
                      <h2 className={pendingBool ? styles.linkPlacebo : null}>
                        {brandFormatted} {modelFormatted}
                      </h2>

                      {pendingBool ? (
                        <p style={{ color: "red" }}>
                          This provenance has been released and is awaiting
                          claim by buyer {ProvenancePendingOwner}
                        </p>
                      ) : null}

                      <Card.Body>
                        <Row>
                          <Col>
                            <img
                              key={provenanceAddress + verificationPhotoHash}
                              src={ipfsGetterRootURL + verificationPhotoHash}
                              style={{ objectFit: "contain", width: "100%" }}
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
                                <tr key={provenanceAddress + provenanceAddress}>
                                  <td>
                                    Provenance Address: {provenanceAddress}
                                  </td>
                                </tr>
                                <tr key={provenanceAddress + brand}>
                                  <td>Brand: {brandFormatted}</td>
                                </tr>
                                <tr key={provenanceAddress + model}>
                                  <td>Model: {modelFormatted}</td>
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
                                    Type of Item: {typeOfProvenance.toString()}
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
                </Container>
              </div>
            );
          })}
        </>
      );
    } else {
      return (
        <>
          {loading ? (
            <div>
              <h1> Loading Your Provenances...</h1>
              <BeatLoader />
            </div>
          ) : !hasProvenances ? null : (
            <h1 style={{ paddingTop: "20vh" }}>
              You have no registered Provenances.
            </h1>
          )}
        </>
      );
    }
  };

  return (
    <div className={styles.container}>
      <h3>
        Registered Provenances for <br /> {mainAccount}
      </h3>
      {/*
          <button onClick={async ()=> {console.log(await MothershipContract.getOwnersInstruments())}}>Get Instruments via Contract</button>
          <button onClick={()=> {console.log((provenanceObjects))}}>Provenance Objects</button>
          <button onClick={async ()=> {console.log(items)}}>Get Items in State</button>
          */}
      {/*<TokensOwned />*/}
      <OwnedProvenanceTable />
    </div>
  );
};

export default OwnedProvenanceHub;

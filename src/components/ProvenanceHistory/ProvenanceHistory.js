import { useEffect, useState } from "react";

//react-bootstrap imports
import { Container, Card, Image } from "react-bootstrap";

// context imports
import { useItemContext } from "../../../src/context/ItemContext";
import { useContractContext } from "../../../src/context/ContractContext";

// styles
import styles from "./ProvenanceHistory.module.css";

const ProvenanceHistory = ({ provenanceContract, loaded }) => {
  const [provenanceHistoryArray, setProvenanceHistoryArray] = useState([]);

  const { MothershipContract } = useContractContext();

  const { ipfsGetterRootURL, bytes32ToString } = useItemContext();

  useEffect(async () => {
    if (MothershipContract && loaded) {
      loadProvenanceHistory();
    }
    async function loadProvenanceHistory() {
      const history = await provenanceContract.getOwnershipHistory();
      const historyShift = [...history];
      historyShift.shift();
      // The line below is throwing an error due to state update, memory leak. make a note to fix.
      setProvenanceHistoryArray(historyShift);
    }
  }, [MothershipContract, loaded]);

  if (loaded) {
    return (
      <div>
        <hr />
        <h1>Provenance Ownership History</h1>
        {provenanceHistoryArray.map((provenanceOwnerInfo, index) => {
          const { ownerAddress, date, verificationPhotoHash, ownerCount } =
            provenanceOwnerInfo;

          const dateFormatted = bytes32ToString(date);
          return (
            <Container key={ownerAddress}>
              <Card>
                <Card.Header>Owner {ownerCount}</Card.Header>
                <Card.Body>
                  <div className={styles.cardContainer}>
                    <div className={styles.cardPhotoContainer}>
                      <Image
                        src={ipfsGetterRootURL + verificationPhotoHash}
                        className={styles.cardPhoto}
                        alt={"verification photo"}
                      />
                    </div>
                    <div className={styles.cardInfoContainer}>
                      <Card.Title>Owner Address</Card.Title>
                      <Card.Text style={{ color: "black" }}>
                        {ownerAddress}
                      </Card.Text>
                      <Card.Title>Date Acquired</Card.Title>
                      <Card.Text style={{ color: "black" }}>
                        +{dateFormatted}
                      </Card.Text>

                      <Card.Title>Notes</Card.Title>
                      <Card.Text style={{ color: "black" }}>
                        Additional data can maybe stored off-chain?
                      </Card.Text>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Container>
          );
        })}
      </div>
    );
  } else {
    return <p>nothing to show here</p>;
  }
};

export default ProvenanceHistory;

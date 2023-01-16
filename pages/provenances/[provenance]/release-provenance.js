import { useEffect, useState } from "react";
import { ethers } from "ethers";

//next imports

import { useRouter } from "next/router";

//react-bootstrap imports
import { Container, Row, Col, Image, Button } from "react-bootstrap";

// context imports
import { useItemContext } from "../../../src/context/ItemContext";
import { useContractContext } from "../../../src/context/ContractContext";
import { useUserContext } from "../../../src/context/UserContext";

// styles
import styles from "./release-provenance.module.css";

// images

import greenCheckMark from "../../../public/images/green_checkmark.png";

const ReleaseProvenance = () => {
  const { provenanceObjects, ipfsGetterRootURL } = useItemContext();
  const { TokenContract, MothershipContract } = useContractContext();
  const { mainAccount, provider } = useUserContext();

  const [pendingTransfer, setPendingTransfer] = useState(false);
  const [transferInitiated, setTransferInitiated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pendingTransferAddress, setPendingTransferAddress] = useState();
  const [buyerAccount, setBuyerAccount] = useState();
  const [addressErrorMessage, setAddressErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [tokenApproved, setTokenApproved] = useState(false);
  const [approvedBuyerAccount, setApprovedBuyerAccount] = useState();

  const [outgoingContract, setOutgoingContract] = useState();
  const [outgoingProvenanceProps, setOutgoingProvenanceProps] = useState();
  const [outgoingProvenanceOwnerInfo, setOutgoingProvenanceOwnerInfo] =
    useState();

  const [escrowActive, setEscowActive] = useState();

  const router = useRouter();

  const { provenance } = router.query;

  useEffect(() => {
    if (!provenanceObjects || !provenance || provenanceObjects.length === 0) {
      return;
    }

    loadProvenance();

    async function loadProvenance() {
      const contract = provenanceObjects.find(
        (contract) =>
          contract.ProvenanceContract &&
          contract.ProvenanceContract.address === provenance
      );

      if (contract) {
        const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo } =
          contract;

        setOutgoingContract(ProvenanceContract);
        setOutgoingProvenanceProps(ProvenanceProps);
        setOutgoingProvenanceOwnerInfo(ProvenanceOwnerInfo);
        setLoaded(true);
      }
    }
  }, [provenanceObjects, provenance]);

  useEffect(() => {
    if (TokenContract && outgoingProvenanceProps) {
      checkApproved();
    }
    async function checkApproved() {
      const result = await TokenContract.getApproved(
        outgoingProvenanceProps.instrumentDeedToken.toString()
      );
      if (result === outgoingContract.address) {
        setTokenApproved(true);
      }
    }
  }, [TokenContract, outgoingProvenanceProps, outgoingContract]);

  useEffect(() => {
    if (outgoingContract || transferInitiated) {
      getPendingOwner();
    }

    async function getPendingOwner() {
      const pendingOwner = await outgoingContract.pendingOwner();

      if (pendingOwner != ethers.constants.AddressZero) {
        setPendingTransfer(true);
        setPendingTransferAddress(pendingOwner);
      } else {
        console.log("No Pending Owner");
      }
    }
  }, [outgoingContract, transferInitiated]);

  const handleChange = (event) => {
    console.log(event.target.value, "value");
    setBuyerAccount(event.target.value);
  };

  async function approveTransfer() {
    setSuccessMessage("");
    setAddressErrorMessage("");
    if (
      TokenContract &&
      outgoingContract &&
      outgoingProvenanceProps.instrumentDeedToken
    ) {
      // alert, change instrumentDeedTokent type
      await TokenContract.approve(
        outgoingContract.address,
        outgoingProvenanceProps.instrumentDeedToken
      )
        .then(async (result) => {
          provider
            .waitForTransaction(result.hash)
            .then(async (mined) => {
              if (mined) {
                setSuccessMessage("Transaction Success");
                setTokenApproved(true);
              }
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error.message, "User denied approval txn");
        });
    } else {
      console.log(
        "TokenContract",
        TokenContract,
        "outgoingContract",
        outgoingContract,
        "outgoingProvenanceProps",
        outgoingProvenanceProps
      );
    }
  }

  async function revokeTransferApproval() {
    await TokenContract.approve(
      ethers.constants.AddressZero,
      outgoingProvenanceProps.instrumentDeedToken.toString()
    ).then(async (result) => {
      provider
        .waitForTransaction(result.hash)
        .then(async (mined) => {
          if (mined) {
            setSuccessMessage("Transaction Success");
            setTokenApproved(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  // approve zero address for revoke approval for transfer
  //   break this into--> approve and then set pending owner

  async function release() {
    setSuccessMessage("");
    setAddressErrorMessage("");
    setTransferInitiated(false);
    if (ethers.utils.isAddress(buyerAccount) && buyerAccount != mainAccount) {
      await outgoingContract
        .setPendingOwner(buyerAccount)
        .then(async (result) => {
          provider.waitForTransaction(result.hash).then(async (mined) => {
            if (mined) {
              setSuccessMessage("Transaction Success");
              setTransferInitiated(true);
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setAddressErrorMessage(
        "You are either attempting to transfer to your own Ethereum address or an invalid address. Please check and re-enter."
      );
    }
  }

  if (loaded && outgoingContract && outgoingProvenanceProps) {
    return (
      <Container>
        <div style={{ textAlign: "center" }}>
          <h1>Transfer Provenance</h1>
          <h4> {outgoingContract.address}</h4>
          <p>
            include etherscan link maybe? also need it for approval txn and
            release txn
          </p>
        </div>

        {pendingTransfer ? (
          <div className={styles.containerBorder}>
            {successMessage ? <p>{successMessage}</p> : null}
            <h4>
              This provenance has been released and is awaiting claim &
              verification by: <p>{pendingTransferAddress}</p>
            </h4>
          </div>
        ) : (
          <div className={styles.transferContainer}>
            <Row>
              <h2>
                Step 1: Approve This Token For Transfer{" "}
                {tokenApproved ? (
                  <Image
                    alt="green checkmark"
                    src={greenCheckMark.src}
                    height="20px"
                  />
                ) : null}
              </h2>
            </Row>
            <Row>
              <Col>
                {tokenApproved ? (
                  <Button variant="danger" onClick={revokeTransferApproval}>
                    Made a mistake? Revoke Token Approval
                  </Button>
                ) : (
                  <Button
                    style={{ fontSize: "30px" }}
                    onClick={approveTransfer}
                  >
                    Approve Token Transfer
                  </Button>
                )}
              </Col>
            </Row>
            <hr />
            <Row>
              <h2>Step 2: Release this Provenance for Claim</h2>
              <h4 style={{ color: "red" }}>
                This step ***cannot*** be undone. Please be sure and
                double-check everything.
              </h4>
            </Row>

            {ethers.utils.isAddress(buyerAccount) ? (
              <h3>
                You are transferring this provenance to this address:{" "}
                {buyerAccount}
              </h3>
            ) : null}

            <h6>0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</h6>
            <h6>0x70997970C51812dc3A010C7d01b50e0d17dc79C8</h6>
            {addressErrorMessage ? <p>{addressErrorMessage}</p> : null}
            <h2>Enter Eth Address to Transfer To:</h2>
            <input
              name="userAddress"
              type="text"
              placeholder="enter address to transfer to here"
              onChange={handleChange}
              value={buyerAccount || ""}
              style={{
                width: "65%",
                height: "40px",
                fontSize: "20px",
                textAlign: "center",
              }}
            />
            {successMessage ? <p>{successMessage}</p> : null}

            <div className="mt-2">
              <Button
                style={{ fontSize: "40px", borderRadius: "20px" }}
                onClick={release}
                disabled={!tokenApproved}
              >
                Release this Provenance
              </Button>
            </div>
          </div>
        )}
      </Container>
    );
  } else {
    return <h1>Loading Provenance Information...</h1>;
  }
};

export default ReleaseProvenance;

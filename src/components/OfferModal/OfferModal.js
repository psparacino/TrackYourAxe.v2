import { Modal, Button } from "react-bootstrap";

import { ethers } from "ethers";

import { useState } from "react";

//import './OfferModal.css';

import { useUserContext } from "../../context/UserContext";

import styles from "./OfferModal.module.css";

export function OfferModal({
  handleChange,
  handleClose,
  newOfferAmount,
  show,
  provenanceContract,
  setOfferMade,
}) {
  const { provider } = useUserContext();

  const [successMessage, setSuccessMessage] = useState("");

  async function offer() {
    await provenanceContract
      .makeOffer({ value: ethers.utils.parseEther(newOfferAmount) })
      .then(async (result) => {
        provider.waitForTransaction(result.hash).then((mined) => {
          if (mined) {
            provenanceContract.once("OfferMade", (buyer, amount) => {
              setOfferMade(true);
              setSuccessMessage("Offer Successful!");
              setTimeout(handleClose, 4000);
            });
          }
        });
      })
      .catch((error) => console.log(error.data.message, "offer error"));
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
    >
      {successMessage ? (
        <h4 className={styles.successMessage}>{successMessage}</h4>
      ) : (
        <>
          <Modal.Header closeButton>
            <Modal.Title
              id="contained-modal-title-vcenter"
              className="mx-auto"
              style={{ paddingLeft: "100px" }}
            >
              Make an offer for this Provenance
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ textAlign: "center" }}>
            {newOfferAmount > 0 ? (
              <h4>
                You are offering {ethers.constants.EtherSymbol}
                {newOfferAmount} for this provenance
              </h4>
            ) : null}
            <input
              name="userAddress"
              type="text"
              placeholder="make offer in eth"
              onChange={handleChange}
              value={newOfferAmount || ""}
              style={{
                width: "65%",
                height: "40px",
                marginBottom: "20px",
                fontSize: "20px",
                textAlign: "center",
              }}
            />
            <div>
              <Button
                variant="warning"
                style={{ fontSize: "20px" }}
                onClick={offer}
              >
                send offer
              </Button>
            </div>
          </Modal.Body>
        </>
      )}
    </Modal>
  );
}

import { useState, React, useEffect } from "react";

import { ethers } from "ethers";
import { useUserContext } from "../../context/UserContext";

// images
import greenCheckMark from "../../../public/images/green_checkmark.png";

// styles
import { Button, Image, Dropdown, Modal } from "react-bootstrap";
import styles from "./ConnectWalletButton.module.css";
import { truncateAddress } from "../../hooks/utils";

const ConnectWalletButton = () => {
  const {
    mainAccount,
    setMainAccount,
    connectionErrorMessage,
    setConnectionErrorMessage,
    chainId,
    disconnect,
    connectWallet,
  } = useUserContext();

  const [showModal, setShowModal] = useState(false);
  const [showConnectButton, setShowConnectButton] = useState(true);
  
  useEffect(() => {
    if (mainAccount) {
      setShowConnectButton(false);
      setConnectionErrorMessage("");
    }
  }, [mainAccount, setConnectionErrorMessage]);

  useEffect(() => {
    let timeoutId;

      // setShowModal(true);
      setShowConnectButton(false);
      timeoutId = setTimeout(() => {
        setShowModal(false);
        setShowConnectButton(true);
      }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [ setShowModal, setShowConnectButton]);

  console.log("showModal", showModal);

  return (
    <div>
      {mainAccount ? (
        <Dropdown>
          <Dropdown.Toggle
            variant="primary"
            className={styles.SuccessButton}
            id="dropdown-basic"
          >
            {`Account: ${truncateAddress(mainAccount)}`}
            <Image
              fluid="true"
              className={styles.checkmarkImage}
              src={greenCheckMark.src}
              alt="checkmark"
            />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item>{`Chain Id: ${chainId}`}</Dropdown.Item>
            <Dropdown.Item onClick={disconnect} style={{ color: "red" }}>
              Disconnect Account
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <Button
          className={styles.button}
          id="connectButton"
          onClick={connectWallet}
        >
          <p className={styles.buttonText}>Connect Wallet</p>
        </Button>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Body>{connectionErrorMessage}</Modal.Body>
        </Modal>
    </div>
  );
};

export default ConnectWalletButton;

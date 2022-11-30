import { useState, useEffect, useReducer } from "react";
//import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";

//next imports
import Link from "next/link";
import { useRouter } from "next/router";

//component imports
import DragAndDrop from "../../src/components/DragAndDrop.js";
import PhotoPreviews from "../../src/components/PhotoPreviews.js";

// import { Modal } from '../../src/components/Modal.js';
import { ConfirmationModal } from "../../src/components/ConfirmationModal.js";

//context imports
import { useUserContext } from "../../src/context/UserContext.js";
import { useItemContext } from "../../src/context/ItemContext.js";
import { useContractContext } from "../../src/context/ContractContext.js";

//page imports

import ProvenanceSuccess from "../provenance-success/ProvenanceSuccess.js";

//styling imports
import styles from "./RegisterItem.module.css";
import {
  Form,
  InputGroup,
  Container,
  Button,
  Row,
  Col,
  Dropdown,
  Accordion,
} from "react-bootstrap/";

const formReducer = (state, event) => {
  if (event.reset) {
    return {
      type: "",
      serial: "",
      brand: "",
      year: 0,
      token: 0,
      date: 0,
      verificationphotohash: [],
      instrumentphotohashes: [],
    };
  }

  return {
    ...state,
    [event.name]: event.value,
  };
};

const RegisterItem = () => {
  const [formData, setFormData] = useReducer(formReducer, {
    instrumentphotohashes: [],
    verificationphotohash: [],
  });
  const [modalShow, setModalShow] = useState(false); //bootstrapmodal
  // tokens
  const [tokenId, setTokenId] = useState([]);
  const [tokenToMint, setTokenToMint] = useState(0);
  const [unusedTokenID, setUnusedTokenID] = useState(0);
  // form
  const [readyToMint, setReadyToMint] = useState(false);
  const [enableForm, setEnableForm] = useState(false);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [itemPhotosUploaded, setItemPhotosUploaded] = useState(false);

  const [mintErrorMessage, setMintErrorMessage] = useState("");
  const [mintSuccessMessage, setMintSuccessMessage] = useState("");

  //context
  const { mainAccount, provider, signer, dateString } = useUserContext();
  const { MothershipContract, TokenContract } = useContractContext();
  const { stringToBytes32 } = useItemContext();

  const {
    items,
    setItems,
    setItemAdded,
    tokens,
    setTokens,
    provenanceObjects,
    setProvenanceObjects,
    newProvenanceAddress,
    setNewProvenanceAddress,
    ipfsGetterRootURL,
  } = useItemContext();

  const router = useRouter();

  // low priority but keep this lifted, and fixed undefined on child components
  //const [ipfsGetterRootURL] = useState("https://gateway.pinata.cloud/ipfs/");

  //let navigate = useNavigate();

  useEffect(() => {
    if (TokenContract) {
      TokenToMint();
    }

    async function TokenToMint() {
      TokenContract.totalSupply().then((result) =>
        setTokenToMint(result.toNumber())
      );
    }
  }, [TokenContract, tokens]);

  useEffect(() => {
    if (readyToMint === false && formData.verificationphotohash.length > 0) {
      setEnableForm(true);
    } else {
      setEnableForm(false);
    }
  }, [readyToMint, formData.verificationphotohash]);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    console.log(form.checkValidity(), "checking Validity");
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    } else {
      event.preventDefault();
      setModalShow(true);
      setSubmitting(true);
    }
  };

  const handleChange = (event) => {
    const isCheckbox = event.target.type === "checkbox";
    setFormData({
      name: event.target.name,
      value: isCheckbox ? event.target.checked : event.target.value,
    });
  };

  // functions

  const createProvenance = () => {
    MothershipContract.createNewProvenance(
      formData.type,
      stringToBytes32(formData.serial.toString()),
      stringToBytes32(formData.brand),
      stringToBytes32(formData.model),
      formData.year,
      unusedTokenID,
      stringToBytes32(dateString),
      formData.verificationphotohash,
      formData.instrumentphotohashes
    ).then(async (result) => {
      provider.waitForTransaction(result.hash).then((mined) => {
        if (mined) {
          MothershipContract.once("ProvenanceCreated", (type, newAddress) => {
            setNewProvenanceAddress(newAddress);
            setItemAdded(true);
            router.push("/provenance-success");
          });
        }
      });
    });
  };

  //TokenContract Interaction Functions

  const mintToken = async () => {
    if (!readyToMint) {
      setMintErrorMessage("Upload a verfication photo to mint token");
      console.log(readyToMint);
    } else {
      //mint token, need to include image URI
      setMintSuccessMessage("");
      await TokenContract.safeMint(mainAccount, formData.verificationphotohash)
        .then(async (result) => {
          provider.waitForTransaction(result.hash).then((mined) => {
            if (mined) {
              TokenContract.once(
                "TokenCreated",
                async (owner, tokenId, success) => {
                  if (success) {
                    setTokens([...tokens, tokenId.toNumber()]);
                    setUnusedTokenID(tokenId.toNumber());
                    setMintSuccessMessage("Token Successfully Minted!");
                  }
                  setFormData({
                    name: "verificationphotohash",
                    value: formData.verificationphotohash,
                  });
                  setReadyToMint(false);
                }
              );
            }
          });
        })
        .then((result) => {
          console.log(result, "result");
        })
        .catch((error) => console.log(error.data));
    }
  };

  //Page Components

  //check if token has been used in a Provenance
  const UserTokens = () => {
    let provenanceTokens = [];
    let unusedTokens = [];

    useEffect(async () => {
      if (provenanceObjects && provenanceObjects.length > 0) {
        for (let i = 0; i < provenanceObjects.length; i++) {
          provenanceTokens.push(
            provenanceObjects[i].ProvenanceProps.instrumentDeedToken
          );
        }
      }
    }, [provenanceObjects]);

    tokens.forEach((token) => {
      const result = provenanceTokens.includes(token);
      if (!result) {
        unusedTokens.push(token);
      }
    });

    async function getTokenProps(unusedToken) {
      const uri = await TokenContract.tokenURI(unusedToken);
      setFormData({
        name: "verificationphotohash",
        value: uri,
      });
      setUnusedTokenID(unusedToken);
      setMintErrorMessage("");
      setReadyToMint(false);
    }

    //helper functions

    function resetTokenDetails() {
      {
        /*setTokenToMint(tokens.slice(-1))*/
      }
      setFormData({
        name: "verificationphotohash",
        value: [],
      });
      setReadyToMint(false);
      setItemPhotosUploaded(false);
    }

    return (
      <>
        <Row className={styles.buttonContainer}>
          <Col>
            <div className={styles.Dropdown}>
              <Button
                className={styles.resetButton}
                variant="danger"
                onClick={resetTokenDetails}
              >
                Reset Token Creation
              </Button>
            </div>
          </Col>
        </Row>

        <Row className={styles.buttonContainer}>
          {formData.verificationphotohash.length > 0 && readyToMint ? (
            <Col>
              <Button
                style={{ backgroundColor: "red", fontSize: "23px" }}
                onClick={mintToken}
                disabled={null}
              >
                {" "}
                Mint Token {tokenToMint}
              </Button>
            </Col>
          ) : null}
          <Col>
            <Dropdown>
              <Dropdown.Toggle
                style={{ fontSize: "25px" }}
                variant="success"
                id="unused-token-dropdown"
              >
                Tokens Awaiting Provenance
              </Dropdown.Toggle>

              {unusedTokens.length > 0 ? (
                <Dropdown.Menu>
                  <div
                    style={{
                      maxHeight: "200px",
                      width: "100%",
                      overflowY: "auto",
                    }}
                  >
                    {unusedTokens.map((unusedToken) => {
                      return (
                        <Dropdown.Item
                          key={unusedToken}
                          onClick={() => getTokenProps(unusedToken)}
                        >
                          {unusedToken}
                        </Dropdown.Item>
                      );
                    })}
                  </div>
                </Dropdown.Menu>
              ) : (
                <Dropdown.Menu>
                  <Dropdown.Item style={{ fontSize: "30px" }}>
                    there are no unused tokens
                  </Dropdown.Item>
                </Dropdown.Menu>
              )}
            </Dropdown>
            {provenanceTokens.length > 0 ? (
              <Col>
                <Accordion className="mx-auto mt-3" style={{ width: "364px" }}>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      Tokens already attached to Provenance
                    </Accordion.Header>
                    <Accordion.Body>{provenanceTokens}</Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Col>
            ) : null}
          </Col>
        </Row>
      </>
    );
  };

  return (
    <div className={styles.NewProvenance}>
      <Container>
        <h1 className="pt-5 mx-auto">Create A Deed of Provenance</h1>
        <h4>
          First time minting? Follow the{" "}
          <Link href="/guides/tutorial">tutorial</Link>
        </h4>
        <h2 style={{ paddingTop: "40px" }}>STEP 1: MINT TOKEN (NFT)</h2>
        <Accordion className={styles.bodyText}>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <strong>What happens in Step 1?</strong>
            </Accordion.Header>
            <Accordion.Body>
              Creation of a Provenance is a two part process. The NFT (also
              referred to as the token) acts as the proof of ownership for the
              Provenance itself. The behind-the-scenes mechanism to ensure your
              ownership of this token is industry-standard and audited by third
              party auditing experts, ensuring security.
              <br />
              <br />
              This token also requires a verification photo prove your ownership
              of the item. This photo needs to include your face and a picture
              of the item, preferably with serial number visible.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        {/* Verfication Photo Upload */}
        {readyToMint === false &&
        formData.verificationphotohash.length > 0 ? null : (
          <Row className="pt-3">
            <DragAndDrop
              photoLimit={1}
              formDataImport={formData}
              setMintErrorMessage={setMintErrorMessage}
              setReadyToMint={setReadyToMint}
              setFormData={setFormData}
              itemPhotosUploaded={itemPhotosUploaded}
              setItemPhotosUploaded={setItemPhotosUploaded}
            />
          </Row>
        )}
        {/* Verication Photo Preview */}
        {formData.verificationphotohash ? (
          <div style={{ position: "relative", textAlign: "center" }}>
            <PhotoPreviews
              photoLimit={1}
              formData={formData}
              readyToMint={readyToMint}
              unusedTokenID={unusedTokenID}
              tokenToMint={tokenToMint}
            />
            {mintSuccessMessage ? (
              <h2 className={styles.mintSuccess}>Mint Success!</h2>
            ) : null}
          </div>
        ) : null}

        {/* Token Updates */}
        <Row className="pt-4">
          <UserTokens />
        </Row>

        <h2 style={{ paddingTop: "40px" }}>
          STEP 2: CREATE PROVENANCE WITH MINTED TOKEN
        </h2>

        <Accordion className={styles.bodyText}>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <strong>What happens in Step 2?</strong>
            </Accordion.Header>
            <Accordion.Body>
              In this step you enter all the identifying information about your
              item. All of this info will be stored on a blockchain in it's own
              unique smart contract forever and is publicy verifiable at any
              time (the link to view the contract on-chain is in the individual
              item page).
              <br />
              <br />
              You also have the option upload additional photos of the item (20
              max).
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Form */}
        {/* Eventually Form and User Tokens need to be broken into separate components */}

        <Form
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
          className="border mt-4 pt-1"
        >
          <fieldset disabled={!enableForm}>
            {enableForm ? (
              <h1>Create Provenance with token # {unusedTokenID}</h1>
            ) : (
              <h2 style={enableForm ? {} : { color: "gray" }}>
                {" "}
                Mint a New Token or Select an Unused Token to Create a
                Provenance{" "}
              </h2>
            )}

            {enableForm ? (
              <h4 style={{ paddingTop: "10px" }}>
                {" "}
                Step 1: Input Item Details{" "}
              </h4>
            ) : null}

            <Form.Group className="mb-3 mt-5 px-3" required type="select">
              <Form.Label>Input Type of Item</Form.Label>
              <Form.Select
                required
                isInvalid=""
                name="type"
                onChange={handleChange}
                value={formData.type || ""}
              >
                <option value=""> Instrument/Accessory/Gear </option>
                <option value="0">Instrument</option>
                <option value="1">Accessory</option>
                <option value="2">Gear</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select an item type.
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Form.Group
                className="mb-3"
                as={Col}
                controlId="validationCustom03"
              >
                <Form.Label>Item Serial Number</Form.Label>
                <InputGroup
                  hasValidation
                  className="mb-3 px-3"
                  onChange={handleChange}
                  value={formData.serial || ""}
                >
                  <Form.Control
                    required
                    placeholder="Serial #"
                    aria-label="serial"
                    name="serial"
                    type="text"
                  />
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  Please enter a serial number for your item.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group
                className="mb-3"
                as={Col}
                controlId="validationCustom04"
              >
                <Form.Label>Year of Manufacture</Form.Label>
                <InputGroup
                  hasValidation
                  className="mb-3 px-3"
                  onChange={handleChange}
                  value={formData.year || ""}
                >
                  <Form.Control
                    required
                    placeholder="Year"
                    name="year"
                    aria-label="year"
                    type="number"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a year of manufacture for your item.
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Row>

            <Row>
              <Form.Group className="px-4">
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  required
                  isInvalid=""
                  name="brand"
                  onChange={handleChange}
                  value={formData.brand || ""}
                >
                  <option value=""> Select Brand/Make </option>
                  <option value="selmer">Selmer</option>
                  <option value="jupiter">Jupiter</option>
                  <option value="ishimori">Ishimori</option>
                  <option value="jlwoodwinds">JL Woodwinds</option>
                  <option value="yanigisawa">Yanigisawa</option>
                  <option value="yamaha">Yamaha</option>
                </Form.Select>
                <InputGroup
                  className="mt-2 w-50 mx-auto"
                  name="brand"
                  placeholder="other"
                  type="text"
                  onChange={handleChange}
                  value={formData.brand || ""}
                >
                  <Form.Control
                    as="textarea"
                    placeholder="other brand"
                    size="sm"
                  />
                </InputGroup>
              </Form.Group>
            </Row>

            <Row>
              <Form.Group className="px-4">
                <Form.Label>Select Model of Item</Form.Label>
                <Form.Select
                  required
                  isInvalid=""
                  name="model"
                  onChange={handleChange}
                  value={formData.model || ""}
                >
                  <option value=""> Select Model </option>
                  <option value="ottolink">Otto Link</option>
                  <option value="morgan">Morgan</option>
                  <option value="vandoren">Vandoren</option>
                  <option value="yamaha">Yamaha</option>
                </Form.Select>
                <InputGroup
                  className="mt-2 w-50 mx-auto"
                  name="brand"
                  type="text"
                  onChange={handleChange}
                  value={formData.model || ""}
                >
                  <Form.Control
                    as="textarea"
                    placeholder="other model"
                    size="sm"
                  />
                </InputGroup>
              </Form.Group>
            </Row>

            <Row>
              <Form.Group className="mb-3 mt-5">
                {enableForm ? (
                  <Row>
                    <h2>Upload Additional Images</h2>
                    <DragAndDrop
                      photoLimit={20}
                      formDataImport={formData}
                      setReadyToMint={setReadyToMint}
                      setFormData={setFormData}
                      itemPhotosUploaded={itemPhotosUploaded}
                      setItemPhotosUploaded={setItemPhotosUploaded}
                    />
                  </Row>
                ) : null}

                {formData.instrumentphotohashes.length >= 1 ? (
                  <PhotoPreviews
                    photoLimit={20}
                    formData={formData}
                    ipfsGetterRootURL={ipfsGetterRootURL}
                  />
                ) : null}
              </Form.Group>
            </Row>
            <div className="mt-3">
              <Button
                className={styles.submitButton}
                type="submit"
                disabled={submitting}
              >
                Confirm Provenance Details
              </Button>
            </div>
          </fieldset>
        </Form>
      </Container>

      {/*bootstrap modal*/}
      <ConfirmationModal
        style={{ zindex: "1" }}
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setSubmitting(false);
        }}
        formdata={formData}
        createprovenance={createProvenance}
        tokenid={tokenId}
        unusedtokenid={unusedTokenID}
        setSubmitting={setSubmitting}
      />
    </div>
  );
};

export default RegisterItem;

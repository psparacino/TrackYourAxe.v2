import { useState, useEffect, useReducer } from 'react';
//import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { ethers } from 'ethers';

//next imports
import Link from 'next/link'
import { useRouter } from 'next/router';

//component imports
import DragAndDrop from '../../src/components/DragAndDrop.js';
import PhotoPreviews from '../../src/components/PhotoPreviews.js';
import { Modal } from '../../src/components/Modal.js';
import { ConfirmationModal } from '../../src/components/ConfirmationModal.js';

//context imports
import { useUserContext } from '../../src/context/UserContext.js';
import { useItemContext } from '../../src/context/ItemContext.js';
import { useContractContext } from '../../src/context/ContractContext.js';

//page imports

import ProvenanceSuccess from '../provenance-success/ProvenanceSuccess.js';

//styling imports
import styles from "./RegisterItem.module.css"
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { Container, Row, Col, Dropdown, Accordion } from 'react-bootstrap/'



const formReducer = (state, event) => {
  if(event.reset) {
    return {
      type: '',
      serial: '',
      brand: '',
      year: 0,
      token: 0,
      verificationphotohash: [],
      instrumentphotohashes: [],
    }
  }
  
  return {
    ...state,
    [event.name]: event.value,
  }
  
 }

const RegisterItem = () => {

    //console.log(TokenContract, "MothershipContract on RI page test")
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useReducer(formReducer, {instrumentphotohashes : [], verificationphotohash : []});
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [modalShow, setModalShow] = useState(false) //bootstrapmodal

    const [tokenId, setTokenId] = useState([]);
    const [tokenToMint, setTokenToMint] = useState(0);
    const [unusedTokenID, setUnusedTokenID] = useState(0);
    const [mintErrorMessage, setMintErrorMessage] = useState('');
    const [readyToMint, setReadyToMint] = useState(false);
    const [enableForm, setEnableForm] = useState(false);

    const {mainAccount, provider, signer} = useUserContext();

    const { MothershipContract, TokenContract } = useContractContext();

    const {items, 
          setItems, 
          setItemAdded,
          tokens, 
          setTokens, 
          provenanceObjects, 
          setProvenanceObjects, 
          newProvenanceAddress, 
          setNewProvenanceAddress,
          ipfsGetterRootURL } = useItemContext();
    

    const router = useRouter();

      // low priority but keep this lifted, and fixed undefined on child components
    //const [ipfsGetterRootURL] = useState("https://gateway.pinata.cloud/ipfs/");

    //let navigate = useNavigate();

    useEffect(() => {
      if (TokenContract) {
        TokenToMint(); 
        }
         
      async function TokenToMint() {
        TokenContract.totalSupply()
        .then(result => (setTokenToMint(result.toNumber())))
      }  
      
    },[TokenContract, tokens])

    useEffect(() => {

      if (readyToMint === false && formData.verificationphotohash.length > 0) {
        setEnableForm(true)
      } else {
        setEnableForm(false)
      }
  
      
    },[readyToMint, formData.verificationphotohash])


    //from admin page should check if photos are verified and then re-release rest of
    //push to contract then check con track

    //form functions

      //should check to make sure all formData fields are filled before allowing the user to submit

    const handleSubmit = event => {
      event.preventDefault();
      setModalShow(true)
      setSubmitting(formData, true);
      //createProvenance();

      /*
      setTimeout(() => {
        setSubmitting(false);
        setFormData({
          reset: true
        })
      }, 3000)
      */
      
  }
      const handleChange = event => {
      const isCheckbox = event.target.type === 'checkbox';
      setFormData({
        name: event.target.name,
        value: isCheckbox ? event.target.checked : event.target.value,
      })
    }
    


  //MothershipContract Interaction Functions

  /*        Provenance.Types _enumType,
        string memory _serial, 
        string memory _brand, 
        string memory _model, 
        uint16 _year, 
        uint _instrumentDeedToken,
        string memory _verificationPhotoHash,
        string memory _firstOwner, 
        string[] memory _instrumentPhotoHashes
  */


  //will need to sign two Txns. one creating provenance. the other approving the token to be be bound to this provenance. Need to fix function.
  const createProvenance = () => {
    MothershipContract.createNewProvenance(
      formData.type, 
      formData.serial, 
      formData.brand , 
      formData.model, 
      formData.year, 
      unusedTokenID, 
      formData.verificationphotohash, 
      'j.doe', 
      formData.instrumentphotohashes)
      .then(async(result) => {
        provider.waitForTransaction(result.hash)
        .then(mined => {
            if (mined) {
              setItemAdded(true)
              MothershipContract.once("ProvenanceCreated", (type, newAddress) => {
                setNewProvenanceAddress(newAddress)
                
                router.push('/provenance-success')
            })}
        })
      })
    }
  


//just placehlder so i dont have to repopulate values for testing
// need to fix sign up flow to creation of new page. Event is firing too early if its on same block



const createPracticeProvenance = async() => {
  
 
    await MothershipContract.createNewProvenance(
      1, 
      Math.random().toString(), 
      'selmer', 
      'sba', 
      1967, 
      unusedTokenID, 
      'ipfs', 
      'j.doe', 
      ['ipfs', 'ipfs'])
      .then(async(result) => {
        provider.waitForTransaction(result.hash)
        .then(mined => {
            if (mined) {
              MothershipContract.once("ProvenanceCreated", (type, newAddress) => {
                console.log(result, "event result")  
                setNewProvenanceAddress(newAddress)
                router.push('/provenance-success')
            })}
        })
    })
  
}

//need to fool-proof this
/*

*/



  const getMothershipOwner = () => {

    MothershipContract.owner()
    .then(result => {
      console.log(result, "Mothership Owner")
    })
    .catch((error) => console.log(error))

  }
  

  //TokenContract Interaction Functions

  const mintToken = async() => {
    if (!readyToMint) {
      setMintErrorMessage("Upload a verfication photo to mint token")
      console.log(readyToMint)
    } else {
    //mint token, need to include image URI
    await TokenContract.safeMint(mainAccount, formData.verificationphotohash)
          .then(async(result) => {
            provider.waitForTransaction(result.hash)
            .then(mined => {
                if (mined) {
                  TokenContract.once("TokenCreated" , async(owner, tokenId, success) => {
                    if (success) {
                        setTokens([...tokens, tokenId.toNumber()])
                        console.log(success, "sucessshsh")
                    }
                    setFormData({
                      name: 'verificationphotohash',
                      value: []
                    })
                    setReadyToMint(false)
                })}
            })
        })
      .then(result => {console.log(result, "result")})
      .catch((error) => console.log(error.data))
      }
    }



  //Page Components

  //check if token has been used in a Provenance
  const UserTokens= () => {
    let provenanceTokens = [];
    let unusedTokens = [];

    for (let i = 0; i < provenanceObjects.length; i++) {

      provenanceTokens.push(provenanceObjects[i].ProvenanceProps.instrumentDeedToken.toNumber())
    }
    
    tokens.forEach((token) => {
      const result = provenanceTokens.includes(token);
      if (!result) {
        unusedTokens.push(token)
      }
      
    })
    
    async function getTokenProps(unusedToken) {
      const uri = await TokenContract.tokenURI(unusedToken);
      setFormData({
        name: 'verificationphotohash',
        value: uri})
      setUnusedTokenID(unusedToken)  
      setMintErrorMessage('') 
      setReadyToMint(false)
    }

    //helper functions

    function resetTokenDetails() {
          {/*setTokenToMint(tokens.slice(-1))*/}
          setFormData({
            name: "verificationphotohash",
            value: [],
          })
          setReadyToMint(false)
    } 
    

    return (
      <>
        <Row>
            {provenanceTokens.length > 0 ?
            <>
              <Row>
                <Accordion className="w-50 mx-auto pb-4">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Tokens already attached to Provenance</Accordion.Header>
                    <Accordion.Body>
                      {provenanceTokens}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Row>
            </>
            :null
            }
          
            <Col className={styles.buttonContainer}>
              <div className={styles.Dropdown}>
                <Button className={styles.button-6} onClick={resetTokenDetails}>Mint a New Token</Button>              
              </div>
            </Col>
            { formData.verificationphotohash.length > 0 && readyToMint  ?
            <Col>

              <Button className={styles.dropbtn} style={{backgroundColor: 'red'}} onClick={mintToken} disabled={null}> Mint Token {tokenToMint}</Button>            
            </Col>  :
            null }

            <Col className={styles.buttonContainer}>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="unused-token-dropdown">
                  Unused Tokens
                </Dropdown.Toggle>
                {unusedTokens.length > 0 ?
                <Dropdown.Menu>
                    {unusedTokens.map((unusedToken) => {
                      return <Dropdown.Item key={unusedToken} onClick={() => getTokenProps(unusedToken)}>{unusedToken}</Dropdown.Item>
                    })}
          
                </Dropdown.Menu> :
                <Dropdown.Menu>
                    <Dropdown.Item>"there are no unused tokens"</Dropdown.Item>
                </Dropdown.Menu>

                }
              </Dropdown>
            </Col>



            <p>{readyToMint ? null : mintErrorMessage}</p>   
        </Row>
      </>

    )
  }

  
  // console.log(formData, "formData")


    return(
        <div className={styles.NewProvenance}>
          <Container>
            <h1 className="pt-5 mx-auto">Create A Deed of Provenance</h1>

            {/*Verfication Photo Upload*/} 
            {readyToMint === false && formData.verificationphotohash.length > 0 ?
            
            null 
            :
            
            <Row className="pt-3">
              <DragAndDrop 
                photoLimit={1} 
                formDataImport={formData} 
                setMintErrorMessage={setMintErrorMessage} 
                setReadyToMint={setReadyToMint} 
                setFormData={setFormData} 
                />
            </Row>}
            
            {/*Verication Photo Preview */}

            { formData.verificationphotohash ?
            <PhotoPreviews photoLimit={1} formData={formData} readyToMint={readyToMint} unusedTokenID={unusedTokenID} tokenToMint={tokenToMint} />
            : null
            }

          {/*Token Updates*/}
          {/*readyToMint ? null : <p>You are currently creating a provenance for this token: {tokenToMint}</p>*/}
          <Row className="pt-4">
            <UserTokens />
          </Row>
          

          {/*Minting Buttons*/}
          {/*   
          <button onClick={getMintedTokens}> getMintedTokens in console</button>
          <button onClick={() => console.log(tokens, "tokenID in State")}> Check Token IDs in State</button>
          */}
            <Form onSubmit={handleSubmit} className="border mt-5 pt-4">
              <fieldset disabled={!enableForm}> 
                {enableForm ?
                  <h1>Create Provenance with token # {unusedTokenID}</h1>
                    :
                  <h2 style={enableForm ? {} : {color: 'gray'}}> Mint a New Token or Select an Unused Token to Create a Provenance </h2>
                  
                }
            
                  <Form.Group className="mb-3 mt-5 px-3">
                      <Form.Label>Input Type of Item</Form.Label>
                        <Form.Select name="type" onChange={handleChange} value={formData.type || ''}>
                            <option value=""> Instrument/Accessory/Gear </option>
                            <option value="0">Instrument</option>
                            <option value="1">Accessory</option>
                            <option value="2">Gear</option>
                        </Form.Select> 
                        
                  </Form.Group>


                <Row>
                  <Form.Group className="mb-3" as={Col}>
                    <Form.Label >Item Serial Number</Form.Label>
                      <InputGroup className="mb-3 px-3" onChange={handleChange} value={formData.serial || ''} >
                      <Form.Control
                        placeholder="Serial #"
                        aria-label="serial"
                        name="serial"
                        type="text"                    
                      />
                    </InputGroup>          
                  </Form.Group>

                  <Form.Group className="mb-3" as={Col}>
                    <Form.Label >Year of Manufacture</Form.Label>
                    {formData.year > 2023 ? <p>enter a real year you trump supporter</p> : null}
                      <InputGroup className="mb-3 px-3" onChange={handleChange} value={formData.year || ''}>
                      <Form.Control
                        placeholder="Year"
                        name="year"
                        aria-label="year"
                        type="number"
                        
                      />
                    </InputGroup>          
                  </Form.Group>
                </Row>
  
                <Row>
                  <Form.Group className="px-4">
                    <Form.Label>Brand</Form.Label>
                      <Form.Select name="brand" onChange={handleChange} value={formData.brand || ''}>
                          <option value=""> Select Brand/Make </option>
                          <option value="selmer">Selmer</option>
                          <option value="jupiter">Jupiter</option>
                          <option value="ishimori">Ishimori</option>
                          <option value="jlwoodwinds">JL Woodwinds</option>
                          <option value="yanigisawa">Yanigisawa</option>
                          <option value="yamaha">Yamaha</option>
                      </Form.Select>
                        <InputGroup className="mt-2 w-50 mx-auto" name="brand" placeholder="other" type="text" onChange={handleChange} value={formData.brand || ''}>
                        <Form.Control 
                        as="textarea" 
                        placeholder="other brand"
                        size="sm"
                        />
                        </InputGroup>
                  </Form.Group>
                </Row>

                  {/*need to account for mouthpiece or instruments brands here*/}      
                  
                  {/*frontend optimization, make selections here dependent on selections above*/}
                <Row>
                  <Form.Group className="px-4">
                    <Form.Label>Select Model of Item</Form.Label>
                      <Form.Select name="model" onChange={handleChange} value={formData.model || ''}>
                          <option value=""> Select Model </option>
                          <option value="ottolink">Otto Link</option>
                          <option value="morgan">Morgan</option>
                          <option value="vandoren">Vandoren</option>
                          <option value="yamaha">Yamaha</option>
                      </Form.Select>
                        <InputGroup className="mt-2 w-50 mx-auto" name="brand" type="text" onChange={handleChange} value={formData.model || ''}>
                        <Form.Control 
                        as="textarea" 
                        placeholder="other model"
                        size="sm"
                        />
                        </InputGroup>
                  </Form.Group>
                </Row>

              <div className="mt-3">
                <Button  type="submit" onClick={handleSubmit} disabled={submitting}>Create Provenance</Button>

              </div>           
            </fieldset>


            


          </Form>

          <Form.Group className="mb-3 mt-5">  
            {/*Item Photo Upload*/}
            {enableForm ?
            <Row>                       
              <DragAndDrop photoLimit={20} formDataImport={formData} setReadyToMint={setReadyToMint} setFormData={setFormData} />
            </Row>  :
            null}

            { formData.instrumentphotohashes.length >= 1 ?
            <PhotoPreviews photoLimit={20} formData={formData} ipfsGetterRootURL={ipfsGetterRootURL} />
            : null
            }
          </Form.Group> 
        </Container>

          
          {/*
          <button onClick={() => console.log(formData, "formData")}>FormData</button>
          <button onClick={getMothershipOwner}>Get Mothership Owner</button>
          <button onClick={() => console.log(MothershipContract, "MothershipContract")}>Mothership Contract</button>
          <button onClick={async() => console.log(await MothershipContract.getOwnersInstruments(), "Instruments to Owners")}>Instruments to Owners</button>
          */}
          <button onClick={() => setModalShow(true)}>activate modal for UI</button>

          {showConfirmationModal ? <Modal 
            setShowConfirmationModal={setShowConfirmationModal} 
            formData={formData} 
            createProvenance={createProvenance}
            createPracticeProvenance={createPracticeProvenance}
            tokenId={tokenId}
            unusedTokenID={unusedTokenID}
            setSubmitting={setSubmitting}
            ipfsGetterRootURL={ipfsGetterRootURL}  
            /> : null} 

          {/*bootstrap modal*/}

          <ConfirmationModal style={{zindex: '1'}} show={modalShow} onHide={() => setModalShow(false)}
            formdata={formData} 
            createprovenance={createProvenance}
            createpracticeprovenance={createPracticeProvenance}
            tokenid={tokenId}
            unusedtokenid={unusedTokenID}
            setsubmitting={setSubmitting}
              
            />    
            
          
        </div>
        
    )
}

export default RegisterItem;



  //Item Photo Save          
//<Form.Group className="mb-3 mt-5">  
//{/*Item Photo Upload*/}
//{enableForm ?
//<Row>                       
//  <DragAndDrop photoLimit={20} formDataImport={formData} setReadyToMint={setReadyToMint} setFormData={setFormData} />
//</Row>  :
//null}

//{ formData.instrumentphotohashes.length >= 1 ?
//<PhotoPreviews photoLimit={20} formData={formData} ipfsGetterRootURL={ipfsGetterRootURL} />
//: null
//}
//</Form.Group> 


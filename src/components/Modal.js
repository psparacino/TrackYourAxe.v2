//Modal.js
import React, { useRef } from "react";
import ReactDom from "react-dom";


//import './Modal.css';
import CloseButton from 'react-bootstrap/CloseButton'

export const Modal = ({ 
    setShowConfirmationModal, 
    setSubmitting, 
    formData, 
    createProvenance, 
    createPracticeProvenance,
    unusedTokenID, 
    ipfsGetterRootURL}) => {


    // close the modal when clicking outside the modal.
    const modalRef = useRef();
    const closeModal = (e) => {
        if (e.target === modalRef.current) {
        setShowConfirmationModal(false);
        }
        setSubmitting(false);
    };
    
    const ItemType = () => {
        let item = '';

        if (formData.type == 0) {
            item = 'Instrument'
        } else if (formData.type == 1) {
            item = 'Accessory'
        } else {
            item = 'Gear'
        }

        return (
            <b>Type of Item: {item}</b> 

        )
    }

    const verificationPhotoURL = ipfsGetterRootURL + formData.verificationphotohash;



  
    //render the modal JSX in the portal div.
    return ReactDom.createPortal(
        <div className="container" ref={modalRef} onClick={closeModal}>
            <div className="modal">
                <h4>Confirm All Info Before Provenance Creation</h4>
                {console.log(formData, "formData in Modal")}
                {console.log(ipfsGetterRootURL)}
                <img src={verificationPhotoURL} style={{width:'50%', height: '100%'}} alt="verification photo not yet uploaded" />
                <strong>Token ID: {unusedTokenID}</strong>
                <ItemType /> 
                <strong>Brand: {formData.brand}</strong>  
                <strong>Model Name: {formData.model}</strong>
                <strong>Year Manufactured: {formData.year}</strong>  
                <strong>Serial Number: {formData.serial}</strong>

                
                
        
                <CloseButton className="closeButton" onClick={() => setShowConfirmationModal(false)} />
                <button className="ProvenanceButton" onClick={createProvenance}>Create Provenance</button>
                <button className="ProvenanceButton" onClick={createPracticeProvenance}>Create Practice Provenance</button>
            </div>    
        </div>,
        document.getElementById("portal")
    );
    };
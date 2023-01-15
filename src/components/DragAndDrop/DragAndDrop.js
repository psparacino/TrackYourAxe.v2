import React, { useRef, useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { Spinner, Button } from "react-bootstrap";

import Image from "next/image";

import waitingkitten from "../../../public/images/waitingkitten.jpeg";

//import './DragAndDrop.css';

const DragAndDrop = ({
  photoLimit,
  formDataImport,
  setReadyToMint,
  setMintErrorMessage,
  setFormData,
  itemPhotosUploaded,
  setItemPhotosUploaded,
  claimPhoto,
}) => {
  const FormData = require("form-data");

  const fileInputRef = useRef();
  const modalImageRef = useRef();
  const modalRef = useRef();
  const progressRef = useRef();
  const uploadRef = useRef();
  const uploadModalRef = useRef();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validFiles, setValidFiles] = useState([]);
  const [unsupportedFiles, setUnsupportedFiles] = useState([]);

  const [loading, setLoading] = useState("");

  /*
    const [tokenMinted, setTokenMinted] = useState(false);
    const [tokenID, setTokenID] = useState(0);

    */

  const [photoLimitMessage, setPhotoLimitMessage] = useState(false);
  const [itemPhotoLimitError, setItemPhotoLimitError] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);

  useEffect(() => {
    let filteredArr = selectedFiles.reduce((acc, current) => {
      const x = acc.find((item) => item.name === current.name);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    setValidFiles([...filteredArr]);
  }, [selectedFiles]);

  //drag ops

  const preventDefault = (e) => {
    e.preventDefault();
    // e.stopPropagation();
  };

  const dragOver = (e) => {
    preventDefault(e);
  };

  const dragEnter = (e) => {
    preventDefault(e);
  };

  const dragLeave = (e) => {
    preventDefault(e);
  };

  const fileDrop = (e) => {
    preventDefault(e);
    const files = e.dataTransfer.files;

    if (files.length) {
      handleFiles(files);
    }
  };

  const fileInputClicked = () => {
    fileInputRef.current.click();
  };

  //File Selection and Validation

  const validateFile = (file) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/x-icon",
    ];
    if (validTypes.indexOf(file.type) === -1) {
      return false;
    }

    return true;
  };
  /*
    Original to save until deletion

    const handleFiles = (files) => {
        for(let i = 0; i < files.length; i++) {
            if (validateFile(files[i])) {
                setSelectedFiles(prevArray => [...prevArray, files[i]]);
            } else {
                files[i]['invalid'] = true;
                setSelectedFiles(prevArray => [...prevArray, files[i]]);
                setErrorMessage('File type not permitted');
                setUnsupportedFiles(prevArray => [...prevArray, files[i]]);
            }
        }
    }
    */
  /*

    const handleFiles = (files) => {

        for(let i = 0; i < files.length; i++) {
            if (validateFile(files[i])) {
                if (photoLimit == 20 && validFiles.length < 20 || photoLimit == 1 && validFiles.length < 1) {
                    setSelectedFiles(prevArray => [...prevArray, files[i]]);
                } else if (photoLimit == 20 && validFiles.length >= 20) {
                    setPhotoLimitMessage('Maximum file limit reached (20) for instrument photos.')
                } 
                else if (photoLimit == 1 && validFiles.length > 0) {
                    setPhotoLimitMessage('Please upload just one verification photo.')
                }
            } else {
                files[i]['invalid'] = true;
                setSelectedFiles(prevArray => [...prevArray, files[i]]);
                setErrorMessage('File type not permitted');
                setUnsupportedFiles(prevArray => [...prevArray, files[i]]);
            }
        }
   
    }
    */

  const handleFiles = (files) => {
    if (photoLimit === 20 && files.length >= 20) {
      setItemPhotoLimitError("Please limit items photos to 20. Handle Files");
    } else if (photoLimit === 1 && files.length > 1) {
      if (validateFile(files[0])) {
        setSelectedFiles((prevArray) => [...prevArray, files[0]]);
      }
      setPhotoLimitMessage("Please upload just one verification photo.");
      console.log(files.length, "file length");
    } else {
      for (let i = 0; i < files.length; i++) {
        if (validateFile(files[i])) {
          if (photoLimit === 1 && validFiles.length < 1) {
            setSelectedFiles((prevArray) => [...prevArray, files[i]]);
            if (!claimPhoto) {
              setReadyToMint(true);
            }
          } else if (photoLimit === 20 && validFiles.length < 20) {
            setSelectedFiles((prevArray) => [...prevArray, files[i]]);
            setReadyToMint(false);
          } else if (photoLimit === 20 && validFiles.length >= 20) {
            setPhotoLimitMessage(
              "Maximum file limit reached (20) for instrument photos."
            );
          } else if (photoLimit === 1 && validFiles.length > 0) {
            setPhotoLimitMessage("Please upload just one verification photo.");
          }
        } else {
          files[i]["invalid"] = true;
          setSelectedFiles((prevArray) => [...prevArray, files[i]]);
          setErrorMessage("File type not permitted");
          setUnsupportedFiles((prevArray) => [...prevArray, files[i]]);
        }
      }
    }
  };

  const filesSelected = () => {
    if (fileInputRef.current.files.length) {
      handleFiles(fileInputRef.current.files);
    }
  };

  const fileSize = (size) => {
    if (size === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fileType = (fileName) => {
    return (
      fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length) ||
      fileName
    );
  };

  const removeFile = (name) => {
    const index = validFiles.findIndex((e) => e.name === name);
    const index2 = selectedFiles.findIndex((e) => e.name === name);
    const index3 = unsupportedFiles.findIndex((e) => e.name === name);
    validFiles.splice(index, 1);
    selectedFiles.splice(index2, 1);
    setValidFiles([...validFiles]);
    setSelectedFiles([...selectedFiles]);
    if (index3 !== -1) {
      unsupportedFiles.splice(index3, 1);
      setUnsupportedFiles([...unsupportedFiles]);
    }

    if (validFiles.length <= photoLimit) {
      setPhotoLimitMessage("");
    }

    if (photoLimit === 1 && validFiles.length === 0) {
      setReadyToMint(false);
      setMintErrorMessage("");
    }
  };

  //Image modal

  const openImageModal = (file) => {
    const reader = new FileReader();
    modalRef.current.style.display = "block";
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      modalImageRef.current.style.backgroundImage = `url(${e.target.result})`;
    };
  };

  const closeModal = () => {
    modalRef.current.style.display = "none";
    modalImageRef.current.style.backgroundImage = "none";
  };

  const uploadFiles = async () => {
    event.preventDefault();
    setLoading(true);
    let instrumentPhotoHashesArray = [];
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    uploadModalRef.current.style.display = "block";
    //uploadRef.current.innerHTML = 'File(s) Uploading...';

    Promise.all(
      validFiles.map((validFile) => {
        const formData = new FormData();
        formData.append("file", validFile);

        return axios.post(url, formData, {
          maxBodyLength: "Infinity",
          headers: {
            pinata_api_key: `${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
            pinata_secret_api_key: `${process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY}`,
          },
        });
      })
    )
      .then((response) => {
        //uploadRef.current.innerHTML = 'File(s) Uploaded'
        setLoading(false);

        validFiles.length = 0;
        setValidFiles([...validFiles]);
        setSelectedFiles([...validFiles]);
        setUnsupportedFiles([...validFiles]);
        uploadModalRef.current.style.display = "none";
        for (let responseObject of response) {
          if (photoLimit === 1) {
            setFormData({
              name: "verificationphotohash",
              value: responseObject.data.IpfsHash,
            });
            //console.log(response.data.IpfsHash, "hitting photolimit 1")
            setPhotoLimitMessage("");
            setReadyToMint(true);
          } else {
            //axios.all

            instrumentPhotoHashesArray.push(responseObject.data.IpfsHash);
            setFormData({
              name: "instrumentphotohashes",
              value: instrumentPhotoHashesArray,
            });
            setItemPhotosUploaded(true);
          }
        }
      })
      .catch(() => {
        uploadRef.current.innerHTML = `<span class="error">Error Uploading File(s)</span>`;
        //undefined error keeps throwing here
        progressRef.current.style.backgroundColor = "red";
      })
      .catch((error) => console.log(error));
  };

  const closeUploadModal = () => {
    uploadModalRef.current.style.display = "none";
  };

  const PhotoUploadMessage = () => {
    let photoMsg;
    if (photoLimit === 1) {
      const msg =
        formDataImport.verificationphotohash.length > 0
          ? "Verication Photo Successfully Uploaded. Upload Another Photo to Change"
          : "Upload Your Verification Photo to Mint Token";
      photoMsg = msg;
    }

    if (photoLimit === 1 && claimPhoto) {
      const msg =
        formDataImport.verificationphotohash.length > 0
          ? "Verication Photo Successfully Uploaded. Upload Another Photo to Change"
          : "Upload Your Verification Photo to Claim Provenance";
      photoMsg = msg;
    }

    if (photoLimit === 20) {
      const msg =
        formDataImport && formDataImport.instrumentphotohashes.length >= 1
          ? "Please include all photos in your reupload"
          : "Upload Your Item Photos";
      photoMsg = msg;
    }

    return <h4>{photoMsg}</h4>;
  };

  {
    /*REMOVE WHEN DONE*/
  }

  function testdisplaymodal() {
    setLoading(true);
    uploadModalRef.current.style.display = "block";
  }

  return (
    <>
      <div className="container">
        {unsupportedFiles.length === 0 && validFiles.length ? (
          <button className="file-upload-btn" onClick={() => uploadFiles()}>
            Upload
          </button>
        ) : (
          ""
        )}
        {unsupportedFiles.length ? (
          <p>Please remove all unsupported files.</p>
        ) : (
          ""
        )}
        {itemPhotosUploaded ? (
          <>
            {console.log(itemPhotosUploaded, "item phtos?")}

            <Button
              variant="warning"
              style={{ marginBottom: "10px" }}
              onClick={() => setItemPhotosUploaded(false)}
            >
              Re-Upload Image(s)
            </Button>
          </>
        ) : (
          <div
            className="drop-container"
            onDragOver={dragOver}
            onDragEnter={dragEnter}
            onDragLeave={dragLeave}
            onDrop={fileDrop}
            onClick={fileInputClicked}
          >
            <div className="drop-message">
              <div className="upload-icon"></div>
              {<PhotoUploadMessage />}
            </div>
            <input
              ref={fileInputRef}
              className="file-input"
              type="file"
              multiple
              onChange={filesSelected}
            />
          </div>
        )}

        <div className="file-display-container">
          {validFiles.map((data, i) => (
            <div className="file-status-bar" key={i}>
              <div
                onClick={
                  !data.invalid
                    ? () => openImageModal(data)
                    : () => removeFile(data.name)
                }
              >
                <div className="file-type-logo"></div>
                <div className="file-type">{fileType(data.name)}</div>
                <span
                  className={`file-name ${data.invalid ? "file-error" : ""}`}
                >
                  {data.name}
                </span>
                <span className="file-size">({fileSize(data.size)})</span>{" "}
                {data.invalid && (
                  <span className="file-error-message">({errorMessage})</span>
                )}
                {itemPhotoLimitError && (
                  <span className="file-error-message">
                    ({itemPhotoLimitError})
                  </span>
                )}
              </div>
              <div
                className="file-remove"
                onClick={() => removeFile(data.name)}
              >
                X
              </div>
            </div>
          ))}
          {photoLimitMessage && (
            <span className="file-error-message">({photoLimitMessage})</span>
          )}
        </div>
      </div>

      <div className="modal" ref={modalRef}>
        <div className="overlay"></div>
        <span className="close" onClick={() => closeModal()}>
          X
        </span>
        <div className="modal-image" ref={modalImageRef}></div>
      </div>

      <div className="upload-modal" ref={uploadModalRef}>
        <div className="overlay"></div>
        <div className="close" onClick={() => closeUploadModal()}>
          X
        </div>
        <div className="progress-container">
          <span ref={uploadRef}></span>
          {loading ? <h4>Uploading Files...</h4> : null}
          <div
            style={{
              width: "35%",
              height: "auto",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <Image
              className={{ height: "50%", width: "50%", objectFit: "contain" }}
              src={waitingkitten}
              alt={"please hang in there"}
            />
          </div>

          <Spinner animation="border" className="mx-auto" />
        </div>
      </div>
      {/*<button onClick={testdisplaymodal}>Test Modal</button> */}
    </>
  );
};

export default DragAndDrop;

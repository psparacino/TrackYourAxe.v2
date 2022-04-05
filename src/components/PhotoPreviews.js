
// style imports
import styles from './PhotoPreviews.module.css';
import { Carousel, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";

const PhotoPreviews = ({
    formData, 
    photoLimit, 
    readyToMint, 
    unusedTokenID, 
    tokenToMint,
    ipfsGetterRootURL,
    claimPhoto}) => {
      


    const [ itemPhotoArray, setItemPhotoArray ] = useState([]);
;
    // let itemPhotoArray = [];
    let verificationHashURL = "https://gateway.pinata.cloud/ipfs/" + formData.verificationphotohash;

    //  maybe should do useEffect here
      /*
    
    for (let ipfsHash of formData.instrumentphotohashes) {

      let itemPhotosHashURL = ipfsGetterRootURL + ipfsHash;

      itemPhotoArray.push(itemPhotosHashURL);
    }
*/

// console.log(formData.instrumentphotohashes)

    useEffect(async() => {

      if (formData.instrumentphotohashes) {
        loadItemHashes()
      }

      async function loadItemHashes() {

        let itemArray = [];

        for (let i = 0; i < (await formData.instrumentphotohashes).length; i++) {
          
          let itemPhotosHashURL = ipfsGetterRootURL + (formData.instrumentphotohashes)[i];
          itemArray.push(itemPhotosHashURL);
        }
       setItemPhotoArray(itemArray);
       

       
      
      }
    
    },[formData.instrumentphotohashes, ipfsGetterRootURL])


    const ItemPhotoCarousel = () => {

      return (
        <div className="previewPhoto"> 

          {itemPhotoArray.length > 0 ?      
              <Carousel variant="dark">
                {itemPhotoArray.map((photo, index)=> {
                  return (       
                      <Carousel.Item key={index}>
                        <img 
                          key={photo} 
                          src={photo} 
                          alt="item photos not yet loaded"
                          className={styles.itemPhotoCarousel} />  
                      </Carousel.Item>
                      )
                })} 
              </Carousel>
              
          :
            <div>
              <h2>Item Photos Loading</h2>
              <Spinner animation="border" className='mx-auto' />
            </div>
          }
          
          </div>
      )
    }

    
    

    if (formData.verificationphotohash.length > 0 || itemPhotoArray.length >= 1 ) {
      return (
      
        <div className="previewContainer">
          
          {/* need to fix this flow and correct token #s */}
          { photoLimit == 1 ?
            
          <div className="previewPhoto" >
            { claimPhoto ?
              <h2>New Verification Photo for Provenance</h2> :
                readyToMint ?
                  <h2>Verification Photo for Token {tokenToMint}</h2> :
                  formData.verificationphotohash.length == 0 
                    ? null : <h2>Verification Photo for Token {unusedTokenID} </h2>
            }
            {formData.verificationphotohash.length == 0 ?
            null : 
              <img src={verificationHashURL} alt="verification photo not yet uploaded" />
             }
           </div>

          :          
            <ItemPhotoCarousel />
          }      
        
        

      </div>

    )} else {
      return null
    }
  }

  export default PhotoPreviews;

  
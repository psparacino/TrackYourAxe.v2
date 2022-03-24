//slick carousel style imports
import "../../node_modules/slick-carousel/slick/slick.css"; 
import "../../node_modules/slick-carousel/slick/slick-theme.css";

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
              <Carousel>
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
          
          { photoLimit == 1 ?

          <div className="previewPhoto" >
            { claimPhoto ?
              <h2>New Verification Photo for Provenance</h2> :
                readyToMint ?
                  <h2>Verification Photo for Token {tokenToMint}</h2> :
                  formData.verificationphotohash.length == 0 ? null : <h2>Verification Photo for Token {unusedTokenID} </h2>
            }
            {formData.verificationphotohash.length == 0 ?
            null : <img src={verificationHashURL} alt="verification photo not yet uploaded" /> }
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

  /*

          <div className="previewPhoto">     
          {photoLimit == 20 ?
            <Slider {...settings}>
            {console.log(itemPhotoArray, "itemPhotoArray")}
            {itemPhotoArray.map((photo)=> {
              return  <div>
                        <img key={photo} src={photo} alt="item photos not yet loaded" />  
                      </div>
              })}
            </Slider>
          :
            <div>
              <h2>Item Photos</h2>
              <img key={itemPhotoArray} src={itemPhotoArray} alt="item photos not yet loaded" /> 
            </div>

          }      
        </div>


        <Carousel.Item>
                <img
                  className="d-block w-100"
                  src="https://www.thephoblographer.com/wp-content/uploads/2020/04/WTFStockPhotos26.jpg?width=1200&enable=upscale"
                  alt="First slide"
                />
              </Carousel.Item>
              <Carousel.Item>
                <img
                  className="d-block w-100"
                  src="holder.js/800x400?text=Second slide&bg=282c34"
                  alt="Second slide"
                />

                <Carousel.Caption>
                    <h3>Second slide label</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src="holder.js/800x400?text=Third slide&bg=20232a"
                    alt="Third slide"
                  />

                  <Carousel.Caption>
                    <h3>Third slide label</h3>
                    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                  </Carousel.Caption>
                </Carousel.Item>
              </Carousel>

        */
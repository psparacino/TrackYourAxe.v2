//slick carousel style imports
import "../../node_modules/slick-carousel/slick/slick.css"; 
import "../../node_modules/slick-carousel/slick/slick-theme.css";
//carousel component import
import Slider from "react-slick";

const PhotoPreviews = ({
    formData, 
    photoLimit, 
    readyToMint, 
    unusedTokenID, 
    tokenToMint,
    ipfsGetterRootURL}) => {

    let itemPhotoArray = [];

    let verificationHashURL = "https://gateway.pinata.cloud/ipfs/" + formData.verificationphotohash;

     
    for (let ipfsHash of formData.instrumentphotohashes) {

      let itemPhotosHashURL = ipfsGetterRootURL + ipfsHash;

      itemPhotoArray.push(itemPhotosHashURL);
    }
    
    //need to fix arrows so they're visible plus properly resize
    var settings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 2,
      slidesToScroll: 4,
      initialSlide: 0,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 3,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            initialSlide: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };

    if (formData.verificationphotohash.length > 0 || itemPhotoArray.length >= 1 ) {
      return (
      
      <div className="previewContainer">
        { photoLimit == 1 ?
        <div className="previewPhoto" >

        { readyToMint ?
          <h2>Verification Photo for Token {tokenToMint}</h2> :
          <h2>Verification Photo for Token {unusedTokenID}</h2> 
        }
          {/*alternate not yet uploaded image here with ternary */}
          <img src={verificationHashURL} alt="verification photo not yet uploaded" />
        </div>
          :
        <div className="previewPhoto">
          
            {photoLimit == 20 ?
              <div>
                <h2>Item Photos</h2>
                <img key={itemPhotoArray} src={itemPhotoArray} alt="item photos not yet loaded" /> 
              </div>
            :

              <Slider {...settings}>
              {console.log(itemPhotoArray, "itemPhotoArray")}
              {itemPhotoArray.map((photo)=> {
                return  <div>
                          <img key={photo} src={photo} alt="item photos not yet loaded" />  
                        </div>
                })}

              </Slider>
            }
        </div>
        }

      </div>

    )} else {
      return null
    }
  }

  export default PhotoPreviews;
import { useEffect, useState } from 'react';

function WalletGuide() {
  const [ windowPresent, setWindowPresent ] = useState(false)
 
    useEffect(()=> {
      if (typeof(window) !== "undefined") {

      setWindowPresent(true)
    

      }

    },[])
  
    return (
   
          <div className="WalletGuide" id="bootstrap-overrides">
           TEST
           
          </div>
     
    );
  }
  
  export default WalletGuide;

import 'bootstrap/dist/css/bootstrap.css';
import '../styles/global.css'
import { useEffect } from 'react';


//temp style imports
import '../src/components/DragAndDrop.css';



//component imports
import NavBar from '../src/components/NavBar';

//context imports
import { UserContextProvider} from '../src/context/UserContext';
import { ContractContextProvider } from '../src/context/ContractContext';
import { ItemContextProvider } from '../src/context/ItemContext';
import { TransferContextProvider } from '../src/context/TransferContext';

// SSR Provider

import { SSRProvider } from 'react-bootstrap';

//hook imports
// import useHandleEthereum from "../src/hooks/useHandleEthereum.js";



function TrackYourAxe({ Component, pageProps }) {

  // const {mainAccount, setMainAccount, signer, provider} = useHandleEthereum();

  
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);
  
  return (
    <>
      <SSRProvider>
        <UserContextProvider>
          <ContractContextProvider>
            <ItemContextProvider>
              <TransferContextProvider>
                <NavBar />
                <Component {...pageProps} />
              </TransferContextProvider>         
            </ItemContextProvider>       
          </ContractContextProvider>     
        </UserContextProvider>   
      </SSRProvider> 
    </>
  
  
  )
}

export default TrackYourAxe;

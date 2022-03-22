import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css';


//temp style imports
import '../src/components/MetaMaskButton.css';
import '../src/components/ConfirmationModal.css';
import '../src/components/DragAndDrop.css';
import '../src/components/Modal.css';



import { useEffect } from 'react';



//component imports
import NavBar from '../src/components/NavBar';

//context imports

import { UserContextProvider} from '../src/context/UserContext';
import { ContractContextProvider } from '../src/context/ContractContext';
import { ItemContextProvider } from '../src/context/ItemContext';

//hook imports
import useHandleEthereum from "../src/hooks/useHandleEthereum.js";



function TrackYourAxe({ Component, pageProps }) {

  const {mainAccount, setMainAccount, signer, provider} = useHandleEthereum();


  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);
  
  return (
    <>

      <UserContextProvider>
        <ContractContextProvider>
          <ItemContextProvider>
            <NavBar mainAccount={mainAccount} setMainAccount={setMainAccount}/>
            <Component {...pageProps} />
          </ItemContextProvider>       
        </ContractContextProvider>     
      </UserContextProvider>    
    </>
  
  
  )
}

export default TrackYourAxe;
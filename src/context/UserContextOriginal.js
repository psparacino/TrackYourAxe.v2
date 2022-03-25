// src/context/state.js
import { createContext, useContext } from 'react';

import useHandleEthereum from '../hooks/useHandleEthereum';

const UserContext= createContext();

export function UserContextProvider({ children }) {
  const {mainAccount, setMainAccount, signer, provider, connectWallet } = useHandleEthereum();
  

  const ipfsGetterRootURL = "https://gateway.pinata.cloud/ipfs/";
  
  const date = new Date();  
  const dateString = date.toString();

  console.log(signer, "signer in UserContext")

  const state = { mainAccount, setMainAccount, signer, provider, ipfsGetterRootURL, dateString, connectWallet }

  return (
    <UserContext.Provider value={state}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
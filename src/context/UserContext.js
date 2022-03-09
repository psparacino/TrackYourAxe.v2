// src/context/state.js
import { createContext, useContext } from 'react';

import useHandleEthereum from '../hooks/useHandleEthereum';

const UserContext= createContext();

export function UserContextProvider({ children }) {
  const {mainAccount, setMainAccount, signer, provider} = useHandleEthereum();

  const ipfsGetterRootURL = "https://gateway.pinata.cloud/ipfs/";


  const state = { mainAccount, setMainAccount, signer, provider, ipfsGetterRootURL }

  return (
    <UserContext.Provider value={state}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
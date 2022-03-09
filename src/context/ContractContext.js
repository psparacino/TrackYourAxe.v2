// src/context/state.js
import { createContext, useContext } from 'react';

import useContractObjectRepo from '../hooks/useContractRepo';

const ContractContext= createContext();

export function ContractContextProvider({ children }) {

  const { MothershipContract, TokenContract } = useContractObjectRepo()

  

  const state = { MothershipContract, TokenContract };

  return (
    <ContractContext.Provider value={state}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContractContext() {
  return useContext(ContractContext);
}
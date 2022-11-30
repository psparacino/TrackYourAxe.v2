import { useItemContext } from "../src/context/ItemContext";
//ethers
import { ethers } from "ethers";

//abi
import Provenance from "../artifacts/contracts/Provenance.sol/Provenance.json";

//  this needs to be rewritten for non-user specific data only

export async function getProvenanceAddresses() {
  const { MothershipContract } = useContractObjectRepo();
  // const {mainAccount, setMainAccount, signer, provider} = useHandleEthereum();

  const addressArray = await MothershipContract.getOwnersInstruments();

  const paths = addressArray.map((address) => ({
    params: { provenanceAddress: address.toString() },
  }));

  return { paths, fallback: false };
}

export function getProvenanceProps(context) {
  const { provenanceObjects } = useItemContext();

  const ProvenanceFullProps = [];

  provenanceObjects.map((array, index) => {
    const { ProvenanceContract, ProvenanceProps, ProvenanceOwnerInfo } = array;
    ProvenanceFullProps.push({
      ProvenanceContract,
      ProvenanceProps,
      ProvenanceOwnerInfo,
    });
  });

  return {
    provAddress,
    ProvenanceFullProps,
  };
}

const { expect } = require("chai");
const { ethers } = require("hardhat");
const ProvenanceABI = require('../artifacts/contracts/Provenance.sol/Provenance.json');


//const provider = new ethers.providers.Web3Provider(window.ethereum);
//const signer = provider.getSigner(0);

describe("Mothership-Transfer Tests", function () {
    
    let TokenContract;
    let MothershipContract;
    let ProvenanceContract;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;

    before(async function () {
        const IDTC = await ethers.getContractFactory('InstrumentDeedToken');
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        TokenContract = await IDTC.deploy();

        MSC = await ethers.getContractFactory('Mothership');
        MothershipContract = await MSC.deploy(TokenContract.address);

        await TokenContract.safeMint(addr1.address, "www.google.com")

        const result = await MothershipContract.connect(addr1).createNewProvenance(1, 'serial#', 'Selmer', 'SBA', 1957, 0, 'ipfs', 'John', ["ipfs"])
        let receipt = await result.wait()
        let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
        let ProvenanceAddress = event[0].args.childAddress;
        ProvenanceContract = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);
      
    });

  

    

    // it("claimOwnership of from one owner to another", async function() { 
 
    //     await TokenContract.connect(addr1).approve(ProvenanceContract.address, 0)
    //     await ProvenanceContract.claimOwnership(addr2.address, 'owner2name', 'verificationPhoto2');
    //     expect(await MothershipContract.ownersToAxes(addr2.address, 0)).to.equal(ProvenanceContract.address)
     
    // });
    

    // it("retrieve previous owner information", async function() {

    //     //sell to address 3
    //     await TokenContract.connect(addr2).approve(ProvenanceContract.address, 0)
    //     await ProvenanceContract.connect(addr2).claimOwnership(addr3.address, 'owner3name', 'verificationPhoto3');
    //     //sell to address 4
    //     await TokenContract.connect(addr3).approve(ProvenanceContract.address, 0)
    //     await ProvenanceContract.connect(addr3).claimOwnership(addr4.address, 'owner4name', 'verificationPhoto4');
    // })
    


  });

  /*
    
        expect(await ProvenanceContract.owner()).to.equal(owner);*/
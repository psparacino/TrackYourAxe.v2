const { expect } = require("chai");
const { ethers } = require("hardhat");
const ProvenanceABI = require('../artifacts/contracts/Provenance.sol/Provenance.json');


//const provider = new ethers.providers.Web3Provider(window.ethereum);
//const signer = provider.getSigner(0);

describe("Provenance Tests", function () {
    
    let TokenContract;
    let MothershipContract;
    let ProvenanceContract;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        const IDTC = await ethers.getContractFactory('InstrumentDeedToken');
        [owner, addr1, addr2] = await ethers.getSigners();
        TokenContract = await IDTC.deploy();

        MSC = await ethers.getContractFactory('Mothership');
        MothershipContract = await MSC.deploy(TokenContract.address);

        await TokenContract.safeMint(addr1.address, "www.google.com")
      
    });

    it("contract Addresses", async function() {
        
    });

    it("verify token minted to address1", async function() {
        expect(await TokenContract.ownerOf(0)).to.equal(addr1.address);    
        expect(await TokenContract.balanceOf(addr1.address)).to.equal(1);
        expect(await TokenContract.tokenURI(0)).to.equal("www.google.com");
    });

    it("Mothership connected Token Address", async function() {

        expect(await MothershipContract.instrumentDeedTokenContract()).to.equal(TokenContract.address);
    });

    it("deploy Provenance from Mothership", async function() { 
        //console.log(addr1.address,"addr1.address")
        //console.log(MothershipContract.address, "MothershipContract address")


        const result = await MothershipContract.connect(addr1).createNewProvenance(1, 'serial#', 'Selmer', 'SBA', 1957, 0, 'ipfs', 'John', ["ipfs"])
        let receipt = await result.wait()
        let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
        let ProvenanceAddress = event[0].args.childAddress;
        ProvenanceContract = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);

        //Sample Provenance Trait
        expect((await ProvenanceContract.instrument()).serial).to.equal('serial#');
        //Mothership remains Provenance 'owner'
        expect(await ProvenanceContract.owner()).to.equal(MothershipContract.address);
        //Provenance listed owner is owner of item
        expect((await ProvenanceContract.ownerProvenance(1)).ownerAddress).to.equal(addr1.address)
        //expect((await ProvenanceContract.instrumentOwner()).ownerAddress).to.equal(addr1.address);
        
    });

    it("sale of from one owner to another", async function() { 
        //console.log(addr1.address,"addr1.address")
        //console.log(MothershipContract.address, "MothershipContract address")

        const result = await MothershipContract.connect(addr1).createNewProvenance(1, 'serial#', 'Selmer', 'SBA', 1957, 0, 'ipfs', 'John', ["ipfs"])
        let receipt = await result.wait()
        let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
        let ProvenanceAddress = event[0].args.childAddress;
        ProvenanceContract = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);
        await TokenContract.connect(addr1).approve(ProvenanceContract.address, 0)

        //console.log(await TokenContract.ownerOf(0), "tokenOwner")
        //console.log(await ProvenanceAddress, "provOwner")

        await ProvenanceContract.sale(addr2.address, 'owner2name', 'verificationPhoto2');

        //console.log(await TokenContract.ownerOf(0), "tokenOwner2")

        //console.log(await MothershipContract.ownersToAxes(addr2.address, 0), "ownerstoAxes")
        
        expect((await ProvenanceContract.ownerProvenance(2)).ownerAddress).to.equal(addr2.address)
        expect((await ProvenanceContract.ownerProvenance(1)).ownerAddress).to.equal(addr1.address)
        
        //expect((await MothershipContract.ownersToAxes(addr2.address)).to.equal(addr2.address)

     
        
    });

  });

  /*
    
        expect(await ProvenanceContract.owner()).to.equal(owner);*/
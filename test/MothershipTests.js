const { expect } = require("chai");
const { ethers } = require("hardhat");
const ProvenanceABI = require('../artifacts/contracts/Provenance.sol/Provenance.json');


//const provider = new ethers.providers.Web3Provider(window.ethereum);
//const signer = provider.getSigner(0);

describe("Mothership Tests", function () {
    
    let TokenContract;
    let MothershipContract;

    const provider = waffle.provider;

    let owner;
    let addr1;
    let addr2;
    const stringToBytes32 = (string) => ethers.utils.formatBytes32String(string);
    const bytes32ToString = (bytes) => ethers.utils.parseBytes32String(bytes);

    beforeEach(async function () {
        const IDTC = await ethers.getContractFactory('InstrumentDeedToken');
        [owner, addr1, addr2] = await ethers.getSigners();
        TokenContract = await IDTC.deploy();

        MSC = await ethers.getContractFactory('Mothership');
        MothershipContract = await MSC.deploy(TokenContract.address);

        await TokenContract.safeMint(addr1.address, "www.google.com")
      
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


        const result = await MothershipContract.connect(addr1).createNewProvenance(1, 
            ethers.utils.formatBytes32String('serial'), 
            ethers.utils.formatBytes32String('Selmer'), 
            ethers.utils.formatBytes32String('SBA'), 
            1957, 0, 
            ethers.utils.formatBytes32String("12/31/2000"), 
            ethers.utils.formatBytes32String('ipfs'), 
            [ethers.utils.formatBytes32String("ipfs")])
        let receipt = await result.wait()
        let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
        let ProvenanceAddress = event[0].args.childAddress;
        ProvenanceContract = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);

        //Sample Provenance Trait
        expect((await ProvenanceContract.instrument()).serial).to.equal(ethers.utils.formatBytes32String('serial'));
        //Mothership remains Provenance 'owner'
        expect(await ProvenanceContract.owner()).to.equal(MothershipContract.address);
        //Provenance listed owner is owner of item
        expect((await ProvenanceContract.ownerProvenance(1)).ownerAddress).to.equal(addr1.address)
        //expect((await ProvenanceContract.instrumentOwner()).ownerAddress).to.equal(addr1.address);
        
    });

    it("sale of from one owner to another", async function() { 
        let ProvenanceContractTest;
        

        const result = await MothershipContract.connect(addr1).createNewProvenance(1, 
            ethers.utils.formatBytes32String('serial'), 
            ethers.utils.formatBytes32String('Selmer'), 
            ethers.utils.formatBytes32String('SBA'), 
            1957, 0, 
            ethers.utils.formatBytes32String("12/31/2000"), 
            ethers.utils.formatBytes32String('ipfs'), 
            [ethers.utils.formatBytes32String("ipfs")])
        let receipt = await result.wait()
        let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
        let ProvenanceAddress = event[0].args.childAddress;

        

        // prepare transfer
        ProvenanceContractTest = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);

        await TokenContract.connect(addr1).approve(ProvenanceContractTest.address, 0)
        // console.log(await TokenContract.getApproved(0), "approved for token zero")
        await ProvenanceContractTest.connect(addr1).setPendingOwner(addr2.address)


        // original owner of provenance
        let provenanceOwner = (await ProvenanceContractTest.ownerProvenance(1)).ownerAddress;
 

        //need to break this into other tests and also make sure that old provenance is removed from the old owner
        const ProvenanceContractTestSecondSigner = ProvenanceContractTest.connect(addr2);  


        await ProvenanceContractTestSecondSigner.connect(addr2).claimOwnership(provenanceOwner, ethers.utils.formatBytes32String('verificationPhoto2'),ethers.utils.formatBytes32String('12/31/1999'));    


        const updatedAddr1Provs = await MothershipContract.connect(addr1).getOwnersInstruments();
        const updatedAddr2Provs = await MothershipContract.connect(addr2).getOwnersInstruments();
  
        

        expect(updatedAddr1Provs).to.deep.equal([])
        expect(updatedAddr2Provs[0]).to.equal(ProvenanceContractTest.address)

        expect((await ProvenanceContractTestSecondSigner.ownerProvenance(2)).ownerAddress).to.equal(addr2.address);
        expect((await ProvenanceContractTestSecondSigner.ownerProvenance(1)).ownerAddress).to.equal(addr1.address);
    
        
    });

    it("get all Provenances from All Owners", async function() { 
        const type = [0, 1, 2]
        const brand = ["Jupiter", "Yamaha", "JL Woodwinds", "Yanigisawa", "Antigua Winds", "Pearl", "Selmer", "Buffet"]
        const model = ["Mark VI", "SBA", "R13", "Bronze Series", "Cigar Cutter", "Balanced Action", "King 20", "Silver Fox"]
        const images = ["QmNvzkSMNCF9bRry5CHiTCnz7s8Fc6ooNVQyuFc4EPDaQV", "QmPYABsoen4yRJWp4ta7yrhxgsqNEQLK15c68BL6BQrQAW", "QmQ4wfPDcxJeLcypv6JQt6757Nmzi95k5wZbjjFYzjsUW2", "QmdBEnkC1qXc1pZsGkRTPkwhqohGyiTd7tZKvD1v8VQ65Y"]
    
        function serial() {
            return Math.floor(Math.random() * 1000);
        }
    
        function tokenID() {
            return Math.floor(Math.random() * 100)
        }
        function random_element(items)
            {  return items[Math.floor(Math.random()*items.length)];
           }
        function randomDate(start, end) {
            const dateStr = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            return dateStr.toLocaleDateString();
        }
        function randomYear(start, end) {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            }
    
        const batchMintTokens = () => {
            TokenContract.batchMint(100, random_element(images))
        }
    
        const create10Provenances = async() => {
            
    
                let type1 = random_element(type);        
                let serial1 = stringToBytes32((serial()).toString());    
                let brand1 = stringToBytes32(random_element(brand));
                let model1 = stringToBytes32(random_element(model));
                let year1 = (randomYear(new Date(1897, 0, 1), new Date())).getFullYear();
                let tokenID1 = tokenID();
                let date1 = stringToBytes32(((randomDate(new Date(1897, 0, 1), new Date()))).toString());
       
                let vImages1 = random_element(images);
    
        
    
                await MothershipContract.connect(addr1).createBatchProvenances(
                    type1, 
                    serial1, 
                    brand1, 
                    model1, 
                    year1, 
                    tokenID1, 
                    date1,
                    vImages1, 
                    images)
                    .then(async(result) => {
                      provider.waitForTransaction(result.hash)
                      .then(mined => {
                          if (mined) {        
                            MothershipContract.once("ProvenanceCreated", (type, newAddress) => {
                              
                              console.log(`CreateBatchProvenances(11) a success!`)
                              
                          })}
                      })
                      
                    })
                    .catch(error => console.log(error, "error"))
            
            }

        await batchMintTokens()

        for (var i = 1; i < 8; i++) create10Provenances();

        let ownerArray = await MothershipContract.getOwners();
        
        expect (ownerArray[0]).to.equal(addr1.address)  
        let allAxes = await MothershipContract.getAllProvenances();


      

        
    

    });

    

    // it("claimOwnership of from one owner to another", async function() { 

    //             const result = await MothershipContract.connect(addr1).createNewProvenance(1, 'serial#', 'Selmer', 'SBA', 1957, 0, 'ipfs', 'John', ["ipfs"])
    //     let receipt = await result.wait()
    //     let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
    //     let ProvenanceAddress = event[0].args.childAddress;
    //     ProvenanceContract = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);
 
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

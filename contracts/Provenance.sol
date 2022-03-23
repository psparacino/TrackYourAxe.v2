// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./Mothership.sol";
import "./InstrumentDeedToken.sol";


/* To Dos:
    more consistent naming
    ipfs functions
    token address (modifiable from third contract?)
    updatale contract patterns?
 */

contract Provenance is Ownable {

    //static instrument information
    struct Instrument {
        Types typeOfProvenance;
        string serial;
        string brand;
        string model;
        uint16 year;
        uint instrumentDeedToken;
        string[] photoHashes;
    }

    struct Owner {
        uint16 ownerCount;
        address ownerAddress;
        string name;
        string verificationPhotoHash;
        //date acquired;
    }

    mapping(uint16 => Owner) public ownerProvenance;

    enum Types{Instrument, Gear, Accessory}

    Types public typeOfProvenance;

    Instrument public instrument;

    //updatable state, will change on ownership
    Owner public instrumentOwner;

    address public pendingOwner;

    uint8 public ownerCount;

    //hardcode this address for less gas
    InstrumentDeedToken public instrumentDeedTokenContract;
    Mothership public mothershipContract;

    modifier onlyAuthorized() {
        require(ownerProvenance[ownerCount].ownerAddress == msg.sender || owner() == msg.sender, "onlyAuthorized fail");
        _;
    }

    //convert to bytes where possible for gas, shorten variable names
    constructor(
        Types enumType,
        string memory _serial, 
        string memory _brand, 
        string memory _model, 
        uint16 _year, 
        uint _instrumentDeedToken,
        string memory _verificationPhotoHash,
        string memory _firstOwner, 
        string[] memory _instrumentPhotoHashes,
        address _mothershipAddress,
        address _deedTokenAddress)
        {

            //set external contract addresses
            mothershipContract = Mothership(_mothershipAddress);
            instrumentDeedTokenContract = InstrumentDeedToken(_deedTokenAddress);

            //set Instrument Info
            instrument.typeOfProvenance = enumType;
            instrument.serial = _serial;
            instrument.brand = _brand;
            instrument.model = _model;
            instrument.year = _year;
            instrument.instrumentDeedToken = _instrumentDeedToken;
            instrument.photoHashes = _instrumentPhotoHashes;

            //set Owner Info
      
            ownerCount = 1;
            ownerProvenance[ownerCount] = Owner(ownerCount, instrumentDeedTokenContract.ownerOf(_instrumentDeedToken), _firstOwner, _verificationPhotoHash);    
  

    }

    //getters

    function getItemPics() public view returns(string[] memory) {
        return instrument.photoHashes;
    }
    //called on first step of transfer to new owner
    function setPendingOwner(address buyer) public onlyAuthorized {
        pendingOwner = buyer;

        mothershipContract.setPendingTransfer(buyer, address(this));
    }

    //newOwner claims new Token on proof of ownership and updates all state
    function claimOwnership(address _seller, string memory _verificationPhotoHash) public  {

        //transfer deed token
        // require(msg.sender == instrumentDeedTokenContract.ownerOf(instrument.instrumentDeedToken), "You are not the owner of the Deed Token for this instrument and therefore cannot sell it");
        require(msg.sender == pendingOwner, "You are not the pendingOwner of this item and therefore cannot claim it");

        // mothership updates
        mothershipContract.updateOnProvenanceSale(_seller, msg.sender, this);
        mothershipContract.removePendingTransfer(msg.sender, address(this));

        pendingOwner = address(0);
        //set new owner
        ++ownerCount;
        ownerProvenance[ownerCount] = Owner(ownerCount, msg.sender, 'placeholder name', _verificationPhotoHash);

        //transfer token
        instrumentDeedTokenContract.safeTransferFrom(_seller, msg.sender, instrument.instrumentDeedToken);
    }

    //might be able to do by looping over mapping and ownercount in the front end
    function getOwnershipHistory() public view returns(Owner[] memory) {
        
        Owner[] memory ownershipHistory = new Owner[](ownerCount+1);

        for (uint16 i = 1; i <= ownerCount; i++) {
            console.log("hitting");
            ownershipHistory[i] = ownerProvenance[i];
            console.log(i);
        }
        return ownershipHistory;
         
    }

    //publish new Instrument photo to Ipfs. Needs to replace old
    function addNewInstrumentPhoto(string memory instrumentPhotoHash) public onlyOwner {

    }

    function setNewVerificationPhoto(string memory instrumentPhotoHash) public onlyOwner {

    }

}
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
        bytes32 serial;
        bytes32 brand;
        bytes32 model;
        uint16 year;
        uint16 instrumentDeedToken;
        bytes[] photoHashes;
    }

    struct Owner {
        address ownerAddress;
        uint32 ownerCount;   
        bytes32 verificationPhotoHash;
        bytes32 date;
    }

    mapping(uint32 => Owner) public ownerProvenance;

    enum Types{Instrument, Gear, Accessory}

    Types public typeOfProvenance;

    Instrument public instrument;

    Owner public instrumentOwner;

    address public pendingOwner;

    uint32 public ownerCount;

     
    InstrumentDeedToken public instrumentDeedTokenContract;
    Mothership public mothershipContract;

    modifier onlyAuthorized() {
        require(ownerProvenance[ownerCount].ownerAddress == msg.sender || owner() == msg.sender, "onlyAuthorized fail");
        _;
    }

    //convert to bytes where possible for gas, shorten variable names
    constructor(
        Types enumType,
        bytes32 _serial, 
        bytes32 _brand, 
        bytes32 _model, 
        uint16 _year, 
        uint16 _instrumentDeedToken,
        bytes32 _date,
        bytes32 _verificationPhotoHash,
        bytes[] memory _instrumentPhotoHashes,
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
            ownerProvenance[ownerCount] = Owner(
                instrumentDeedTokenContract.ownerOf(_instrumentDeedToken), 
                ownerCount,      
                _verificationPhotoHash,
                _date);    
  

    }

    //getters

    function getItemPics() public view returns(bytes[] memory) {
        return instrument.photoHashes;
    }
    //called on first step of transfer to new owner
    function setPendingOwner(address buyer) external onlyAuthorized {
        pendingOwner = buyer;

        mothershipContract.setPendingTransfer(buyer, address(this));
    }

    //newOwner claims new Token on proof of ownership and updates all state
    function claimOwnership(address _seller, bytes32 _verificationPhotoHash, bytes32 date) external  {
        require(msg.sender == pendingOwner, "You are not the pendingOwner of this item and therefore cannot claim it");

        // mothership updates
        mothershipContract.updateOnProvenanceSale(_seller, msg.sender, this, date);
        mothershipContract.removePendingTransfer(msg.sender, address(this));

        //remove pending owner
        pendingOwner = address(0);

        //set new owner
        ++ownerCount;
        ownerProvenance[ownerCount] = Owner(msg.sender, ownerCount, _verificationPhotoHash, date);

        //transfer token
        instrumentDeedTokenContract.safeTransferFrom(_seller, msg.sender, instrument.instrumentDeedToken);
    }

    //might be able to do by looping over mapping and ownercount in the front end
    function getOwnershipHistory() external view returns(Owner[] memory) {
        
        Owner[] memory ownershipHistory = new Owner[](ownerCount+1);
        for (uint16 i = 1; i <= ownerCount; i++) {
            ownershipHistory[i] = ownerProvenance[i];
        }

        return ownershipHistory;       
    }

    // //publish new Instrument photo to Ipfs. Needs to replace old
    // function addNewInstrumentPhoto(bytes32 instrumentPhotoHash) public onlyOwner {

    // }

    // function setNewVerificationPhoto(bytes32 verificationPhotoHash) public onlyOwner {

    // }

}
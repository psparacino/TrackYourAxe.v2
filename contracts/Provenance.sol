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
        string verificationPhotoHash;
        string date;
    }

    struct Offer {
        address buyer;
        uint offer;
    }

    Types public typeOfProvenance;

    Instrument public instrument;

    //For Buyer-Initated Transfer

    Offer public currentOffer;

    //For Seller-Initated Transfer
    
    address public pendingOwner;

    mapping(uint16 => Owner) public ownerProvenance;

    enum Types{Instrument, Gear, Accessory}

    uint8 public ownerCount;



    event OfferMade(address buyer, uint amount);

    //Contract Instances. Can hardcode Addresses for less gas(?)
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
        string memory _date,
        string memory _verificationPhotoHash,
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
            ownerProvenance[ownerCount] = Owner(
                ownerCount, 
                instrumentDeedTokenContract.ownerOf(_instrumentDeedToken), 
                _verificationPhotoHash,
                _date);    
  

    }


    // ************************
    // Seller Initated Transfer
    // ************************
    function setPendingOwner(address buyer) public onlyAuthorized {
        pendingOwner = buyer;

        mothershipContract.setPendingTransfer(buyer, address(this));
    }

    //newOwner claims new Token on proof of ownership and updates all state
    function claimOwnership(address _seller, string memory _verificationPhotoHash, string memory date) public  {
        require(msg.sender == pendingOwner, "You are not the pendingOwner of this item and therefore cannot claim it");

        // mothership updates
        mothershipContract.updateOnProvenanceSale(_seller, msg.sender, this, date);
        mothershipContract.removePendingTransfer(msg.sender, address(this));

        //remove pending owner
        pendingOwner = address(0);

        //set new owner
        ++ownerCount;
        ownerProvenance[ownerCount] = Owner(ownerCount, msg.sender, _verificationPhotoHash, date);

        //transfer token
        instrumentDeedTokenContract.safeTransferFrom(_seller, msg.sender, instrument.instrumentDeedToken);
    }

    // ************************
    // Buyer Initated Transfer
    // ************************

    function makeOffer() public payable {
        require(ownerProvenance[ownerCount].ownerAddress != msg.sender, "You cannot purchase your own Provenance");
        require(msg.value > 0, "Offer must be above 0 wei");
        require(msg.value > currentOffer.offer, "Offer must greater than current standing offer");
 
        currentOffer.buyer = msg.sender;
        currentOffer.offer = msg.value;

        emit OfferMade(msg.sender, msg.value);

    }


    function cancelOffer() public {
        require(msg.sender == currentOffer.buyer || msg.sender == ownerProvenance[ownerCount].ownerAddress);
        uint declinedOffer = currentOffer.offer;
        address declinedBuyer = currentOffer.buyer;

        currentOffer.buyer = address(0);
        currentOffer.offer = 0;
        (bool sent, ) = payable(declinedBuyer).call{value: declinedOffer}("");
        require(sent, "return transaction failed");
        
    }
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function acceptOffer() public payable {
       require(msg.sender == ownerProvenance[ownerCount].ownerAddress);
       require(currentOffer.offer > 0, "Offer is currently 0");

        // mothership updates
        mothershipContract.updateOnProvenanceSale(msg.sender, currentOffer.buyer, this, uint2str(block.timestamp));

        //set new owner
        ++ownerCount;
        ownerProvenance[ownerCount] = Owner(ownerCount, currentOffer.buyer, "QmPhNm6hikNWTSX6AgHuf1BkbZbsXmKKEkDQRjRcdw7KZk", uint2str(block.timestamp));


        //transfer token
        instrumentDeedTokenContract.safeTransferFrom(msg.sender, currentOffer.buyer, instrument.instrumentDeedToken);

        currentOffer.buyer = address(0);
        currentOffer.offer = 0;
    }

    // ********
    // Getters
    // ********
    function getOwnershipHistory() public view returns(Owner[] memory) {
        
        Owner[] memory ownershipHistory = new Owner[](ownerCount+1);

        for (uint16 i = 1; i <= ownerCount; i++) {

            ownershipHistory[i] = ownerProvenance[i];
            console.log(i);
        }
        return ownershipHistory;
         
    }


    function getItemPics() public view returns(string[] memory) {
        return instrument.photoHashes;
    }

    //publish new Instrument photo to Ipfs. Needs to replace old
    function addNewInstrumentPhoto(string memory instrumentPhotoHash) public onlyOwner {

    }

    function setNewVerificationPhoto(string memory instrumentPhotoHash) public onlyOwner {

    }

}
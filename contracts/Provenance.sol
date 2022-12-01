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
        string[] photoHashes;
    }

    struct Owner {
        address ownerAddress;
        uint32 ownerCount;   
        string verificationPhotoHash;
        bytes32 date;
    }

    struct Offer {
        address buyer;
        uint offer;
    }


    // struct Multihash {
    //     bytes32 digest;
    //     uint8 hashFunction;
    //     uint8 size;
    // }

    mapping(uint32 => Owner) public ownerProvenance;

    enum Types{Instrument, Gear, Accessory}

    Types public typeOfProvenance;

    Instrument public instrument;

    Owner public instrumentOwner;

    Offer public currentOffer;

    address public pendingOwner;

    uint32 public ownerCount;

     
    InstrumentDeedToken public instrumentDeedTokenContract;
    Mothership public mothershipContract;

    event OfferMade(address buyer, uint amount);

    // event ImageEntrySet (
    //     address indexed key,
    //     bytes32 digest,
    //     uint8 hashFunction,
    //     uint8 size
    // );

    // event ImageEntryDeleted (
    //     address indexed key
    // );


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
                instrumentDeedTokenContract.ownerOf(_instrumentDeedToken), 
                ownerCount,      
                _verificationPhotoHash,
                _date);    
  

    }

    // Images
    //   function convertToMultiHash(bytes32 _digest, uint8 _hashFunction, uint8 _size) public returns(Multihash memory) {
    //         Multihash memory imageEntry = Multihash(_digest, _hashFunction, _size);
    //         ImageEntrySet(
    //         msg.sender, 
    //         _digest, 
    //         _hashFunction, 
    //         _size
    //         );
    //         return imageEntry;
    //     }

        /**
        * @dev deassociate any multihash entry with the sender address
        */
        // function clearImageEntry() public {
        //     require(entries[msg.sender].digest != 0);
        //     delete entries[msg.sender];
        //     ImageEntryDeleted(msg.sender);
        // }

        /*
            * @dev retrieve multihash entry associated with an address
            * @param _address address used as key
            */
        // function getImageEntry(address _address) public view returns(bytes32 digest, uint8 hashfunction, uint8 size)
        //     {
        //         Multihash storage entry = entries[_address];
        //         return (entry.digest, entry.hashFunction, entry.size);
        //     }

    //getters

    function getItemPics() public view returns(string[] memory) {
        return instrument.photoHashes;
    }

    // *******************************
    //Owner Initated Transfer Functions
     // *******************************

    function setPendingOwner(address buyer) external onlyAuthorized {
        pendingOwner = buyer;

        mothershipContract.setPendingTransfer(buyer, address(this));
    }

    //newOwner claims new Token on proof of ownership and updates all state
    function claimOwnership(address _seller, string calldata _verificationPhotoHash, bytes32 date) external  {
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

    // Piur
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

    // ************************
    // Pure Functions
    // ************************

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function acceptOffer() public payable {
       require(msg.sender == ownerProvenance[ownerCount].ownerAddress);
       require(currentOffer.offer > 0, "Offer is currently 0");

        // mothership updates
        mothershipContract.updateOnProvenanceSale(msg.sender, currentOffer.buyer, this, stringToBytes32(uint2str(block.timestamp)));

        //set new owner Need to fix photo hash
        ++ownerCount;
        ownerProvenance[ownerCount] = Owner(currentOffer.buyer,ownerCount, "QmPhNm6hikNWTSX6AgHuf1BkbZbsXmKKEkDQRjRcdw7KZk", stringToBytes32(uint2str(block.timestamp)));


        //transfer token
        instrumentDeedTokenContract.safeTransferFrom(msg.sender, currentOffer.buyer, instrument.instrumentDeedToken);

        currentOffer.buyer = address(0);
        currentOffer.offer = 0;
    }

    //might be able to do by looping over mapping and ownercount in the front end
    function getOwnershipHistory() external view returns(Owner[] memory) {
        
        Owner[] memory ownershipHistory = new Owner[](ownerCount+1);
        for (uint16 i = 1; i <= ownerCount; i++) {
            ownershipHistory[i] = ownerProvenance[i];
        }
        return ownershipHistory;       
    }

    // ************************
    // Admin Only Functions
    // ************************

    // //publish new Instrument photo to Ipfs. Needs to replace old
    // function addNewInstrumentPhoto(bytes32 instrumentPhotoHash) public onlyOwner {

    // }

    // function setNewVerificationPhoto(bytes32 verificationPhotoHash) public onlyOwner {

    // }

}
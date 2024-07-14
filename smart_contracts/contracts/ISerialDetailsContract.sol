// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ISerialHeaderContract.sol";

interface ISerialDetailsContract {

    struct SerialDetailStruct {
        uint256 serialId;
        Details details;
    }

    struct Details {
        string date_code;
        string lot_code;
        uint256 po_item;
        string po_number;
        uint256 qty;
        string receiving_location;
        string receiving_plant;
        uint256 serial_header_id;
        string sending_location;
        string sending_plant;
        string shipment_carrier;
        string uom;

    }

    event SerialDetailAdded(uint256 serialId);
    event SerialDetailUpdated(uint256 serialId);
    event ConditionFailed(uint256 serial_header_id, uint256 serialId, string message);

    function setSerialHeaderContract(ISerialHeaderContract _serialHeaderContract) external;

    function uploadSerialDetails(uint256[] calldata _serialIds, Details[] calldata _details) external;
    
    function getSerialDetail(uint256 _serialId) external view returns (uint256, Details memory);
    
    function getDetails(uint256 _serialId) external view returns (Details memory);
    
    function getSerialDetailStruct(uint256 _serialId) external view returns (SerialDetailStruct memory);
    
    function getAllSerialIds() external view returns (uint256[] memory);
    
    function getSerialDetailStructs(uint256[] calldata _serialIds) external view returns (SerialDetailStruct[] memory);
    
}

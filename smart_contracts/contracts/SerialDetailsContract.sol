// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ISerialHeaderContract.sol";
import "./ISerialDetailsContract.sol";


contract SerialDetailsContract  is ISerialDetailsContract{

    ISerialHeaderContract public serialHeaderContract; 
    
    mapping(uint256 => SerialDetailStruct) public serialDetails;
    uint256[] private allSerialIds; // To store all serial IDs for enumeration
    
        // Function to set the address of SerialHeaderContract
    function setSerialHeaderContract(ISerialHeaderContract _serialHeaderContract) external {
        serialHeaderContract = _serialHeaderContract;
    }

    // Private function to check if serial header exists
    function _serialHeaderExists(uint256 _serialHeaderId) private view returns (bool) {
        return serialHeaderContract.serialHeaderExists(_serialHeaderId);
    }

    // Function to upload serial details
    function uploadSerialDetails(uint256[] memory _serialIds, Details[] memory _details) external {
        require(_serialIds.length == _details.length, "Array lengths must match");
        for (uint256 i = 0; i < _serialIds.length; i++) {
            if (_serialHeaderExists(_details[i].serial_header_id)) {
                if (serialDetails[_serialIds[i]].serialId == 0) {
                       serialDetails[_serialIds[i]] = SerialDetailStruct({
                        serialId: _serialIds[i],
                        details: _details[i]
                    });
                    allSerialIds.push(_serialIds[i]); // Record the serial ID in allSerialIds
                    emit SerialDetailAdded(_serialIds[i]);
                }
                else {
                emit ConditionFailed(_details[i].serial_header_id, _serialIds[i],"Serial detalis already exist");
                continue;
            }
            } else {
                 emit ConditionFailed(_details[i].serial_header_id, _serialIds[i],"Serial header does not exist");
                continue;
            }
        }
    }
    
    // Function to get serial detail by ID
    function getSerialDetail(uint256 _serialId) external view returns (uint256, Details memory) {
        SerialDetailStruct storage serial = serialDetails[_serialId];
        return (serial.serialId, serial.details);
    }

    // Function to get details by serial ID
    function getDetails(uint256 _serialId) external view returns (Details memory) {
        return serialDetails[_serialId].details;
    }

    // Function to get serial detail by ID
    function getSerialDetailStruct(uint256 _serialId) external view returns (SerialDetailStruct memory) {
        return serialDetails[_serialId];
    }

    // Function to retrieve all serial IDs
    function getAllSerialIds() external view returns (uint256[] memory) {
        return allSerialIds;
    }

    // Function to get filtered serial detail structs by list of IDs
    function getSerialDetailStructs(uint256[] memory _serialIds) external view returns (SerialDetailStruct[] memory) {
        SerialDetailStruct[] memory filteredDetails = new SerialDetailStruct[](_serialIds.length);
        
        for (uint256 i = 0; i < _serialIds.length; i++) {
            require(serialDetails[_serialIds[i]].serialId != 0, "Serial ID does not exist");
            filteredDetails[i] = serialDetails[_serialIds[i]];
        }
        return filteredDetails;
    }
}
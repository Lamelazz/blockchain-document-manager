// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentVault {

    struct FileMeta {
        string cid;
        uint timestamp;
        bool exists;
    }

    mapping(bytes32 => FileMeta) public files;

    function register(bytes32 hash, string calldata cid) external {
        files[hash] = FileMeta(cid, block.timestamp, true);
    }

    function verify(bytes32 hash) external view returns(string memory cid,uint timestamp,bool exist){
        FileMeta memory f = files[hash];
        return (f.cid, f.timestamp, f.exists);
    }
}

pragma solidity ^0.4.17;

contract Car {
    string public brand;

    constructor (string initalBrand) public {
        brand = initalBrand;
    }

    function setBrand(string newBrand) public {
        brand = newBrand;
    }
}
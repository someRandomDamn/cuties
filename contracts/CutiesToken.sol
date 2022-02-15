// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CutiesToken is AccessControl, ERC20Burnable, ERC20Capped {

  bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");
  mapping (address => bool) public blackList;

  constructor(
    string memory name,
    string memory symbol,
    uint256 initialSupply,
    uint256 maxSupply
  ) ERC20(name, symbol) ERC20Capped(maxSupply) {
    _mint(msg.sender, initialSupply);
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(OPERATOR_ROLE, msg.sender);
  }

  function mint(address to, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _mint(to, amount);
  }

  function withdrawToken(address _tokenContract, uint256 _amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
    IERC20 tokenContract = IERC20(_tokenContract);

    tokenContract.transfer(msg.sender, _amount);
  }

  function addToBlackList(address _wallet) public onlyRole(OPERATOR_ROLE) {
    blackList[_wallet] = true;
  }

  function removeFromBlackList(address _wallet) public onlyRole(OPERATOR_ROLE) {
    delete blackList[_wallet];
  }

  function _mint(address to, uint256 amount) internal override(ERC20, ERC20Capped) {
    super ._mint(to, amount);
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal view override {
    require(!_isInBlackList(from), "Sender is in the blacklist");
    require(!_isInBlackList(to), "Recipient is in the blacklist");
  }

  function _isInBlackList(address _wallet) internal view returns (bool) {
    return blackList[_wallet];
  }
}

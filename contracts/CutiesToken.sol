// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract CutiesToken is ERC20 {

  address private _owner;
  uint256 private immutable _maxSupply;
  mapping (address => bool) public blackList;
  mapping (address => bool) public operatorList;

  constructor(
    string memory name,
    string memory symbol,
    uint256 initialSupply,
    uint256 maxSupply
  ) ERC20(name, symbol) {
    require(maxSupply > 0, "ERC20: max supply is 0");
    _maxSupply = maxSupply;
    _mint(msg.sender, initialSupply);
    _owner = _msgSender();
  }

  /** Withdraw */
  function withdrawToken(address _tokenContract, uint256 _amount) public onlyOwner {
    IERC20 tokenContract = IERC20(_tokenContract);

    tokenContract.transfer(msg.sender, _amount);
  }

  function withdrawNativeToken(uint256 _amount) public onlyOwner {
    require(address(this).balance >= _amount, 'Not enough funds');
    payable(msg.sender).transfer(_amount);
  }

  function withdrawNFT(address _nftContract, uint256 tokenId) public onlyOwner {
    IERC721 tokenContract = IERC721(_nftContract);

    tokenContract.transferFrom(address(this), msg.sender, tokenId);
  }

  /** Mint */
  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function _mint(address account, uint256 amount) internal virtual override {
    require(ERC20.totalSupply() + amount <= _maxSupply, "ERC20: max supply exceeded");
    super._mint(account, amount);
  }

  /** Burning */
  function burn(uint256 amount) public onlyOwner {
    _burn(_msgSender(), amount);
  }

  function burnFrom(address account, uint256 amount) public onlyOwner {
    _spendAllowance(account, _msgSender(), amount);
    _burn(account, amount);
  }

  /** Role management */
  function addToOperatorList(address _wallet) public onlyOwner {
    operatorList[_wallet] = true;
  }

  function removeFromOperatorList(address _wallet) public onlyOwner {
    delete operatorList[_wallet];
  }

  modifier onlyOwner() {
    require(_owner == _msgSender(), "Only owner has permissions");
    _;
  }

  modifier onlyOperatorRole() {
    require(_owner == _msgSender() || operatorList[_msgSender()], "Not enough permissions");
    _;
  }

  /** Blacklist */
  function addToBlackList(address _wallet) public onlyOperatorRole {
    blackList[_wallet] = true;
  }

  function removeFromBlackList(address _wallet) public onlyOperatorRole {
    delete blackList[_wallet];
  }

  function _beforeTokenTransfer(address from, address to, uint256) internal view override {
    require(!_isInBlackList(from), "Sender is in the blacklist");
    require(!_isInBlackList(to), "Recipient is in the blacklist");
  }

  function _isInBlackList(address _wallet) internal view returns (bool) {
    return blackList[_wallet];
  }
}

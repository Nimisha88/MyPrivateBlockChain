const SHA256 = require('crypto-js/sha256');
const BitcoinMsg = require('bitcoinjs-message');
const Block = require('./block.js');

class Blockchain {
  constructor() {
    this.chain = [];
    this._addBlock(this._createGenesisBlock());
  }

  get height() {
    return this.chain.length;
  }

  get presentTime() {
    return new Date().getTime().toString().slice(0,-3);
  }

  _createGenesisBlock() {
    return new Block("First Block in the chain - Genesis Block");
  }

  _addBlock(newBlock) {
    let self = this;
    return new Promise((resolve, reject) => {
      try {
        newBlock.height = self.height;
        newBlock.previousBlockHash = (self.height > 0)? self.chain[self.height - 1].hash : null;
        // Hash must be added after all other data is added
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        self.chain.push(newBlock);
        resolve(newBlock);
      }
      catch(error) {
        reject(error);
      }
    });
  }

  getBlockByHeight(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      resolve(self.chain.height < height ? false : self.chain[height]);
    });
  }

  getBlockByHash(hash) {
    let self = this;
    return new Promise((resolve, reject) => {
      resolve(self.chain.filter(block => block.hash === hash));
    });
  }

  getBlockByAddress(address) {
    let self = this;
    return new Promise((resolve, reject) => {
      let ownersBlocks = self.chain.filter(block => block.owner === address);
      Promise.all(ownersBlocks.map(block => block.getBData()))
        .then((decodedBlocks) => resolve(decodedBlocks))
        .catch(error => reject(`Blockdata not decoded properly! Error: ${error}`));
    });
  }

  requestMessageOwnershipVerification(address) {
    let self = this;
    return new Promise((resolve, reject) => {
      resolve(`${address}:${self.presentTime}:starRegistry`);
    });
  }

  submitStar(address, message, signature, star) {
    let self = this;
    return new Promise((resolve, reject) => {
      const [msgAddr, msgTime, msgReq] = message.split(':');
      const reqTime = this.presentTime;

      let isVerified = (reqTime - msgTime) < (5*60) ? BitcoinMsg.verify(message, address, signature) : null;

      switch(isVerified) {
        case null:
          reject('Registry request expired!');
        case false:
          reject('Signature unverified!');
        case true:
          self._addBlock(new Block({owner: address, star}, address))
            .then(block => resolve(block))
            .catch(error => reject(error));
          break;
        default:
          reject('Something went wrong!');
      }

    });
  }

  validateChain() {
    let self = this;
    return new Promise((resolve, reject) => {
      // TODO validate each block
      // TODO Verify chain is not broken
      // TODO
    });
  }
}

module.exports = Blockchain

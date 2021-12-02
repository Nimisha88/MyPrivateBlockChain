/**
 * Import libraries
 */

const SHA256 = require('crypto-js/sha256');
const BitcoinMsg = require('bitcoinjs-message');
const Block = require('./block.js');

/**
 *          Blockchain
 *
 *  This class adds new blocks to the chain post validating the chain
 *  It also supports retrieval of block by height or hash
 *  It also retrieves stars registered to an owner
 */

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

        self.validateChain()
          .then(errors => {
            if(errors.length) {
              errors.push('Validation of BlockChain failed, block rejected!');
              self.chain.pop();
              reject(errors);
            }
            else {
              resolve(newBlock);
            }
          })
          .catch(err => reject(err));
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
          break;
        case false:
          reject('Signature unverified!');
          break;
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

  alterBlockAtHeight(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.chain[height].previousBlockHash = '11111';
      resolve(self.chain[height]);
    })
  }

  validateChain() {
    let self = this;
    return new Promise((resolve, reject) => {
      let errors = [];

      // Verify chain is not broken
      for (let block of self.chain) {
        if (block.height) {
          if(block.previousBlockHash !== self.chain[block.height-1].hash) {
            errors.push(`Chain is broken at height ${block.height}`);
          }
        }
      }

      // Validate all blocks
      Promise.all(self.chain.map(block => block.validate()))
        .then(validatedBlocks => {
          if(validatedBlocks.includes(false)) {
            errors.push(`One or more blocks are invalid`);
          }
          resolve(errors);
        })
        .catch(err => reject(err));
    });
  }
}

module.exports = Blockchain

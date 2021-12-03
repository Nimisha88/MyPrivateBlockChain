/**
 * Blockchain
 * ----------------------------------------------------------------------------
 * This class lets user request to register a star using its bitcoin Signature.
 * Upon request, it verifies the signature, validates the chain and
 * then adds the new block to the chain.
 * It also lets user to retrieve blocks by height or hash.
 * Users can retrieve stars registered to a bitcoin legacy address.
 * If the chain invalidates or if any block in the chain is manipulated,
 * the new block doesn't get added.
 *
 **/

/**
 * Import libraries
 * crypto-js - to access SHA256 Cryptographic Hash Algorithm
 * bitcoinjs-message - to verify bitcoin signature
 * block.js - Block class of the chain
 **/

const SHA256 = require('crypto-js/sha256');
const BitcoinMsg = require('bitcoinjs-message');
const Block = require('./block.js');

/** Blockchain class definition **/

class Blockchain {
  constructor() {
    this.chain = [];
    // Create the Genesis block upon initializations
    this._addBlock(this._createGenesisBlock());
  }

  // Getter function for height - works as class variable
  get height() {
    return this.chain.length;
  }

  // Fetches current time in seconds
  get presentTime() {
    return new Date().getTime().toString().slice(0,-3);
  }

  // Private method to create Genesis block
  _createGenesisBlock() {
    return new Block("First Block in the chain - Genesis Block");
  }

  /**
   * Private method to add a new block
   * ---------------------------------------------------------------------------
   * Adds height and previous block's hash to the new block
   * Generates hash for the new block
   * Calls validateChain() to validate all blocks in the chain and also ensures
   * that the chain is not broken
   **/

  _addBlock(newBlock) {
    let self = this;
    return new Promise((resolve, reject) => {
      try {
        newBlock.height = self.height;
        newBlock.previousBlockHash = (self.height > 0)? self.chain[self.height - 1].hash : null;
        // Hash must be added after all other data is added
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        self.chain.push(newBlock);

        // Validate Chain
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

  // Fetch block by the height
  getBlockByHeight(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      resolve(self.chain.height < height ? false : self.chain[height]);
    });
  }

  // Fetch block by the hash
  getBlockByHash(hash) {
    let self = this;
    return new Promise((resolve, reject) => {
      resolve(self.chain.filter(block => block.hash === hash));
    });
  }

  // Fetch all decoded Star data for a given bitcoin legacy address
  getBlockByAddress(address) {
    let self = this;
    return new Promise((resolve, reject) => {
      let ownersBlocks = self.chain.filter(block => block.owner === address);
      Promise.all(ownersBlocks.map(block => block.getBData()))
        .then((decodedBlocks) => resolve(decodedBlocks))
        .catch(error => reject(`Blockdata not decoded properly! Error: ${error}`));
    });
  }

  // Fetch appropriate message to be signed by the user using bitcoin wallet
  requestMessageOwnershipVerification(address) {
    let self = this;
    return new Promise((resolve, reject) => {
      resolve(`${address}:${self.presentTime}:starRegistry`);
    });
  }

  /**
   * Method to add new data to the Blockchain
   * ---------------------------------------------------------------------------
   * Verifies if the request isn't expired i.e. < 5 mins
   * Uses bitcoinjs-message lib to verify owner's signature
   * If all is well, it adds the new block with Star data to the chain
   **/

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

  // Method to invalide a block at a given height for testing purposes
  alterBlockAtHeight(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.chain[height].previousBlockHash = '11111';
      resolve(self.chain[height]);
    })
  }

  /**
   * Method to validate Blockchain before adding new data to it
   * ---------------------------------------------------------------------------
   * Recalcutes hashes of all blocks and verifies that blocks are intact
   * Verifies previous block's hash of all blocks to ensure chain is intact
   * In case of errors, all errors are stored and returned
   **/

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

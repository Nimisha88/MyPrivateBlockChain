/**
 * Block
 * -----------------------------------------------------------------------------
 * This class defines a block thats added in the Block chain.
 * It takes Star to be registered and its owner's bitcoin address as input.
 * It encodes the Star data before adding.
 * It also adds the current time in seconds.
 **/

/**
 * Import libraries
 * -----------------------------------------------------------------------------
 * crypto-js - to access SHA256 Cryptographic Hash Algorithm
 * hex2ascii - to decode encoded Block data
 */

const SHA256 = require('crypto-js/sha256');
const HEX2ASCII = require('hex2ascii');

/**
 * Block class definition
 */

class Block {
  constructor(data, owner=null) {
    this.hash = null;
    this.height = 0;
    this.owner = owner; // Not encoded
    this.data =  Buffer.from(JSON.stringify(data)).toString('hex'); // Encode data to Hex
    this.time = new Date().getTime().toString().slice(0, -3);
    this.previousBlockHash = null;
  }

  // Fetch the decoded Block Data
  getBData() {
    let self = this;
    return new Promise((resolve, reject) => {
      try {
        // If Genesis Block resolve null, else resolve decoded data
        const bData = !self.height ? null : JSON.parse(HEX2ASCII(self.data));
        resolve(bData);
      }
      catch(error) {
        reject(error);
      }
    });
  }

  // Recalculate hash to verify if the block is valid
  validate() {
    let self = this;
    return new Promise((resolve, reject) => {
      try {
        // Destructing Block Object
        const { hash, height, owner, data, time, previousBlockHash } = self;
        resolve(hash === SHA256(JSON.stringify({hash: null, height, owner, data, time, previousBlockHash})).toString());
      }
      catch(error) {
        reject(error);
      }
    });
  }
}

// Exporting the class Block to be reused in other files
module.exports = Block;

/**
 * Import libraries
 */

const SHA256 = require('crypto-js/sha256');
const HEX2ASCII = require('hex2ascii');

/**
 * Class with a constructor for block
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

  // Get decoded Block Data
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

  validate() {
    let self = this;
    return new Promise((resolve, reject) => {
      try {
        // Destructing Block Object
        const {hash, height, data, time, previousBlockHash} = self;
        // Recalculate Hash and resolve with True or False
        resolve(hash === SHA256(JSON.stringify({ height, data, time, previousBlockHash })).toString());
      }
      catch(error) {
        // Reject Promise
        reject(error);
      }
    });
  }
}

// Exporting the class Block to be reused in other files
module.exports = Block;

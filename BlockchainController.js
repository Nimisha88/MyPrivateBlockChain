/**
 *          BlockchainController
 *
 * This class expose the endpoints that the client applications will use to interact with the
 * Blockchain dataset
 **/

class BlockchainController {

  // Initiallize the controller instance with express.js app and the Blockchain class instances
  constructor(app, blockChainObj) {
    this.app = app;
    this.blockchain = blockChainObj;

    // Initialize all API routes
    this.getServiceHome();
    this.alterBlockAtHeight();
    this.getBlockByHeight();
    this.getBlockByHash();
    this.getStarsByOwner();
    this.requestOwnership();
    this.submitStar();
    this.getChainValidation();
  }

  // Endpoint to webservice default
  getServiceHome() {
    this.app.get('/', (req, res) => res.send('Hi there! My blockchain webservice is up and running!'));
  }

  // Endpoint to test Validation
  alterBlockAtHeight() {
    this.app.get('/breakChain/height/:height', async (req, res) => {
      if(req.params.height) {
        try {
          let block = await this.blockchain.alterBlockAtHeight(req.params.height);
          if (block){
            return res.status(200).json(block);
          } else {
            return res.status(404).send('Block not altered!');
          }
        }
        catch(error) {
          res.status(500).send(`Error: ${error}`);
        }
      }
      else {
        return res.status(404).send('Please review the block height and try again!');
      }
    });
  }

  // Enpoint to retrieve a Block by Height (GET Endpoint)
  getBlockByHeight() {
    this.app.get('/block/height/:height', async (req, res) => {
      if(req.params.height) {
        try {
          let block = await this.blockchain.getBlockByHeight(req.params.height);
          if (block){
            return res.status(200).json(block);
          } else {
            return res.status(404).send('Block not found!');
          }
        }
        catch(error) {
          res.status(500).send(`Error: ${error}`);
        }
      }
      else {
        return res.status(404).send('Please review the block height and try again!');
      }
    });
  }

  // Endpoint to retrieve a Block by Hash (GET endpoint)
  getBlockByHash() {
    this.app.get('/block/hash/:hash', async (req, res) => {
      if(req.params.hash) {
        try {
          let block = await this.blockchain.getBlockByHash(req.params.hash);
          if (block.length === 1){
            return res.status(200).json(block[0]);
          } else {
            return res.status(404).send('Block not found!');
          }
        }
        catch(error) {
          res.status(500).send(`Error: ${error}`);
        }
      }
      else {
        return res.status(404).send('Please review the block hash and try again!');
      }
    });
  }

  // Endpoint to retrieve the list of Stars registered by an owner (GET endpoint)
  getStarsByOwner() {
    this.app.get('/blocks/:address', async (req, res) => {
      if(req.params.address) {
        try {
          let blocks = await this.blockchain.getBlockByAddress(req.params.address);
          if (blocks.length !== 0){
            return res.status(200).json(blocks);
          } else {
            return res.status(404).send('No blocks owned by the owner!');
          }
        }
        catch(error) {
          res.status(500).send(`Error: ${error}`);
        }
      }
      else {
        return res.status(404).send(`Please review the owner's address and try again!`);
      }
    });
  }

  // Endpoint to allow user to request Ownership of a Wallet address (POST Endpoint)
  requestOwnership() {
    this.app.post('/requestValidation', async (req, res) => {
      if(req.body.address) {
        try {
          const message = await this.blockchain.requestMessageOwnershipVerification(req.body.address);
          if (message) {
            res.status(200).json(message);
          }
          else {
            res.status(500).send('Something went wrong, please try again!');
          }
        }
        catch (error) {
          res.status(500).send(`Error: ${error}`);
        }
      }
      else {
        return res.status(500).send('Please verify the wallet address and try again!');
      }
    });
  }

  // Endpoint to allow user to Submit a Star post requesting Ownership (POST endpoint)
  submitStar() {
    this.app.post('/submitStar', async (req, res) => {
      if(req.body.address && req.body.message && req.body.signature && req.body.star) {
        const {address, message, signature, star} = req.body;
        try {
          let block = await this.blockchain.submitStar(address, message, signature, star);
          console.log(JSON.stringify(block));
          if(block){
              return res.status(200).json(block);
          }
          else {
              return res.status(500).send('Something went wrong, please try again!');
          }
        }
        catch (error) {
          res.status(500).send(`Error: ${error}`);
        }
      }
      else {
        return res.status(500).send('Please verify request parameters and try again!');
      }
    });
  }

  // Endpoint to validate chain
  getChainValidation() {
    this.app.get('/validateChain', async (req, res) => {
      try {
        const errors = await this.blockchain.validateChain();
        if (errors.length) {
          errors.push('Validation of BlockChain failed!');
          return res.status(200).json(errors);
        }
        else {
          return res.status(200).send(`Chain is valid`);
        }
      }
      catch(error) {
        res.status(500).send(`Error: ${error}`);
      }
    });
  }
}

const initBlockChainController = (app, blockChainObj) => {
  return new BlockchainController(app, blockChainObj);
}

module.exports = initBlockChainController

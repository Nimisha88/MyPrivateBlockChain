/**
 *          BlockchainController
 *
 * This class expose the endpoints that the client applications will use to interact with the
 * Blockchain dataset
 */

class BlockchainController {

  // Initiallize the controller instance with express.js app and the Blockchain class instances
  constructor(app, blockChainObj) {
    this.app = app;
    this.blockchain = blockChainObj;

    // Initialize all API routes
    this.getBlockByHeight();
    this.getBlockByHash();
    this.getStarsByOwner();
    this.requestOwnership();
    this.submitStar();
  }

  // Enpoint to retrieve a Block by Height (GET Endpoint)
  getBlockByHeight() {
    this.app.get('/block/height/:height', async (req, res) => {
      // TODO implement getBlockByHeight logic
    });
  }

  // Endpoint to retrieve a Block by Hash (GET endpoint)
  getBlockByHash() {
    this.app.get('/block/hash/:hash', async (req, res) => {
      // TODO implement getBlockByHash logic
    });
  }

  // Endpoint to retrieve the list of Stars registered by an owner (GET endpoint)
  getStarsByOwner() {
    this.app.get('/blocks/:address', async (req, res) => {
      // TODO implement getStarsByOwner logic
    });
  }

  // Endpoint to allow user to request Ownership of a Wallet address (POST Endpoint)
  requestOwnership() {
    this.app.post('/requestValidation', async (req, res) => {
      // TODO implement requestOwnership logic
    });
  }

  // Endpoint to allow user to Submit a Star post requesting Ownership (POST endpoint)
  submitStar() {
    this.app.post('/submitStar', (req, res) => {
      // TODO implement submitStar logic
    });
  }
}

const initBlockChainController = (app, blockChainObj) => {
  return new BlockchainController(app, blockChainObj);
}

module.exports = initBlockChainController

# MyPrivateBlockChain
It is a blockchain for an Astronomy fan which allows him and his friends to register stars, and track the ownership of each. When the application is run, it creates the Genesis Block. It then lets the user to request a message to be signed using a Wallet to verify his ownership. The user then uses his wallet to sign the message and requests to add the star under his ownership using his signature. If the message isn't signed within 5 minutes of the request, the message expires otherwise a new block is created with the encoded Star data. After validation, the new block is added to the chain. The user can then fetch the decoded star data based on ownership.

## Software, Firmware and Hardware
* NodeJS v14.17.3 and latest version of following packages:
  * express (includes body-parser), hex2ascii, morgan
  * bitcoinjs-message, crypto-js
* Bitcoin-core and a wallet to sign the message(s)
* Postman desktop agent (and a compatible browser) to make localhost requests

## Application Endpoints
* '/' - Default to webservice home
* '/breakChain/height/:height' - Alters block's previousBlockHash value to test validation
* '/block/height/:height' - Fetches block by height
* '/block/hash/:hash' - Fetches block by hash
* '/blocks/:address' - Fetches decoded Star(s) data by owner's wallet address
* '/requestValidation' - Requests message to be signed
* '/submitStar' - Requests signature to be verified and Star data to be added to the chain

## Installation instructions
* Install [NodeJS](https://nodejs.org/) and npm
* Download the application locally and do the following:
  * Open a terminal and cd to the main directory
  * Run ```npm install``` to install dependencies
  * Run ```node app.js``` to intialize the webservice
* Open Postman desktop agent (and a compatible browser) to make localhost requests

## Application access
Use Postman desktop agent to do following API calls:
* **GetBlockByHeight** - http://localhost:8000/block/height/<add-height>
* **GetBlockByHash** - http://localhost:8000/block/hash/<add-hash>
* **GetBlocksByOwnership** - http://localhost:8000/blocks/<add-wallet-address>
* **RequestOwnership** - http://localhost:8000/requestValidation
```
{
  "address": <add-wallet-address-in-quotes>
}
```
* **SubmitStar** - http://localhost:8000/submitStar
```
{
  "address": <add-wallet-address-in-quotes>,
  "message": <add-ownership-request-message-in-quotes>,
  "signature": <add-signature-in-quotes>,
  "star": {
            "dec": "70° 51.8' 57",
            "ra": "16h 29m 1.0s",
            "story": "Testing Star 1"
          } // alter star data as needed
}
```
* **InvalidateBlockByHeight** - http://localhost:8000/breakChain/height/<add-height>

## Folder Structure

* main
  * README.md - Read me file
  * .gitignore - Files that were ignored in commit
  * package.json - Contains list of installable dependencies needed to run the application locally
  * app.js - Webservice scripting to handle API requests asynchronously
  * BlockchainController - Ensure only one instance of chain and routes requests according to enp points
  * src/
    * block.js - Class to define block
    * blockchain.js - Class to define blockchain


## Copyright

The application is designed and developed by **Nimisha Viraj** as a part of [Udacity Blockchain Developer Nanodegree](https://www.udacity.com/course/blockchain-developer-nanodegree--nd1309).


## Acknowledgements

* [Udacity](https://udacity.com) - Source of project requirements
* [Stackoverflow](https://stackoverflow.com/) - Source of resolutions to coding errors and roadblocks
* [Postman](https://www.postman.com/) - For making API calls a breeze
* [JavaScript Info](https://javascript.info/promise-basics) - For such an perfect tutorial on JS Promises


## Limitation and Scope

* Presently, there is no check on format of message or Star data
* A front-end GUI can be added for ease of access and data visualization

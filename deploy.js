const Web3 = require("web3");

const ganache = require("ganache-cli");

const HDWalletProvider = require("truffle-hdwallet-provider");

const provider = new HDWalletProvider(
  "damage method pair destroy diary polar master dish happy bubble two giraffe",
  "https://rinkeby.infura.io/v3/097cf08b81f047458ffc898b8c2537b9"
);

const web3 = new Web3(provider);

const { interface, bytecode } = require("./compile");

const deploy = async () => {
  console.log("Fetching the accounts....");
  const accounts = await web3.eth.getAccounts();

  console.log("Deploying from the account ", accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
    })
    .send({
      gas: "1000000",
      from: accounts[0],
    });

  console.log("Deployed to the address ", result.options.address);
};

deploy();

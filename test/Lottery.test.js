const Web3 = require("web3");
const ganache = require("ganache-cli");
const web3 = new Web3(ganache.provider());

const assert = require("assert");

const { interface, bytecode } = require("../compile");

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
    })
    .send({
      from: accounts[0],
      gas: "1000000",
    });
});

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("gets manager for the contract", async () => {
    const manager = await lottery.methods.getManager().call({
      from: accounts[0],
    });

    console.log("Manager => ", manager);
  });

  it("player enters contract", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("1.5", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.strictEqual(accounts[0], players[0]);
    assert.strictEqual(1, players.length);
  });

  it("allow multiple players enter contract", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("1.5", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("1.5", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("1.5", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[3],
      value: web3.utils.toWei("1.5", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.strictEqual(4, players.length);
  });

  it("requires minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 23,
      });

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("only manager can pick the winner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("sends money to the winner and reset the players", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });
    const finalBalance = await web3.eth.getBalance(accounts[0]);

    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei("1.8", "ether"));
  });
});

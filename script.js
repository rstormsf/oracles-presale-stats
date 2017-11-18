require('dotenv').config();
var fs = require('fs');

const Web3 = require('web3');
const local = 'http://localhost:8545';
const provider = new Web3.providers.HttpProvider(local);
const web3 = new Web3(provider);

const ContributionABI = require('../build/contracts/PresaleOracles.json').abi;
var myContract = new web3.eth.Contract(ContributionABI, process.env.PRESALE_ADDRESS);

myContract.getPastEvents('Contribution', {fromBlock: 0}).then((e) => {
    e.forEach((log) => {
        web3.eth.getTransactionReceipt(log.transactionHash).then((receipt) => {
            var gasUsed = new web3.utils.BN(receipt.gasUsed);
            web3.eth.getTransaction(log.transactionHash)
            .then((tx)=>{
                var gas = new web3.utils.BN(tx.gas);
                var gasPrice = new web3.utils.BN(tx.gasPrice);
                var fee = gasUsed.mul(gasPrice).toString(10);
                var gasPrice_gwei = gasPrice.div( new web3.utils.BN(1000000000)).toString(10);
                fee = web3.utils.fromWei(fee);
                web3.eth.getCode(log.returnValues['investor']).then((isContract) => {
                    isContract = isContract === '0x' ? "NO" : "YES";

                    var data = `${log.blockNumber},
                    ${log.returnValues['investor']},
                    ${web3.utils.fromWei(log.returnValues['investorAmount'])},
                    ${web3.utils.fromWei(log.returnValues['totalAmount'])},
                    ${fee},
                    ${gasUsed},
                    ${gasPrice_gwei},
                    ${isContract},
                    ${log.transactionHash}\n`;
                    
                    fs.appendFileSync('formList.csv', 
                        data.replace(/\r?\n?\s?/g, '') + "\n",
                     'utf8');
                 });
            });

        });
        
    })
})

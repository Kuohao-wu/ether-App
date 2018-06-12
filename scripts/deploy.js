const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const config = require('../config')
const HDWalletProvider = require('truffle-hdwallet-provider')

const mnemonic = config.mnemonic
const { bytecode, interface } = require('../compiled/ProjectList.json')

// 配置钱包
const provider = new HDWalletProvider(mnemonic, config.infuraUrl)

// 实例化web3
const web3 = new Web3(provider)

// 部署
console.log('开始部署...')
console.time('合约部署耗时')
;(async () => {
  // 获取钱包中的账户地址
  const accounts = await web3.eth.getAccounts()
  // 新建一个Contract实例并部署
  const result = await new web3.eth.Contract(JSON.parse(interface))
                 .deploy({data: bytecode})
                 .send({ from: accounts[0], gas: '6000000'})
  console.timeEnd('合约部署耗时')
  
  const contractAddress = result.options.address
  console.log('部署完毕，合约地址为: ', contractAddress)

  // 把合约地址保存起来
  const contractAddressPath = path.resolve(__dirname, '../config/contractAddress.json')

  fs.writeFileSync(contractAddressPath, JSON.stringify(contractAddress))
  console.log('合约地址写入成功:', contractAddressPath)
  console.log('合约查看地址:', `https://rinkeby.etherscan.io/address/${contractAddress}`)
})()
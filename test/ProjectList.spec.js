const ganache = require('ganache-cli')
const path = require('path')
const Web3 = require('web3')
const assert = require('assert')
const BigNumber = require('bignumber.js')   // 使用bignumber来处理大位数运算

// 获取ganache提供的钱包插件
const provider = ganache.provider()

// 获取字节码和ABI
const Project = require('../compiled/Project.json')
const projectList = require('../compiled/ProjectList.json')

// 实例化web3
const web3 = new Web3(provider)

let accounts
let projectListContract
let projectContract

describe('deploy contract', () => {
  // 每次单测都重新部署合约，起到一个隔离的作用
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    // 部署列表合约
    projectListContract = await new web3.eth.Contract(JSON.parse(projectList.interface))
                                .deploy({ data: projectList.bytecode })
                                .send({ from: accounts[0], gas: '5000000'})
    // 创建一个项目
    await projectListContract.methods.createProject('ethereum DApp tourial', 100, 1000, 100000).send({
      from: accounts[0],
      gas: '5000000'
    })
    // 获取项目地址
    const [address] = await projectListContract.methods.getProjects().call()
    // 部署项目合约
    projectContract = await new web3.eth.Contract(JSON.parse(Project.interface), address)
  })

  it('should deploy the projectList and project', () => {
    // 断言存在合约地址
    assert.ok(projectListContract.options.address)
    assert.ok(projectContract.options.address)
  })

  it('should save correct project properties', async () => {
    const owner = await projectContract.methods.owner().call()
    const descripton = await projectContract.methods.description().call()
    const minInvest = await projectContract.methods.minInvest().call()
    const maxInvest = await projectContract.methods.maxInvest().call()
    const goal = await projectContract.methods.goal().call()

    assert.equal(owner, accounts[0])
    assert.equal(descripton, 'ethereum DApp tourial')
    assert.equal(minInvest, 100)
    assert.equal(maxInvest, 1000)
    assert.equal(goal, 100000)
  })

  it('should contribute the project', async () => {
    const investor = accounts[1]
    // 参与投资
    await projectContract.methods.contribute().send({
      from: investor,
      value: 200
    })
    const investorsCount = await projectContract.methods.investorsCount().call()
    assert.equal(investorsCount, 1)
  })

  it('has minInvest 100', async () => {
    const investor = accounts[1]
    // 参与投资
    try {
      await projectContract.methods.contribute().send({
        from: investor,
        value: 10
      })
      assert.ok(false)
    } catch(e) {
      assert.ok(e)
    }
  })

  it('has maxInvest 1000', async () => {
    try {
      const investor = accounts[1]
      await projectContract.methods.contribute().send({
        from: investor,
        value: 1001
      })
      assert.ok(false)
    } catch(e) {
      assert.ok(e)
    }
  })

  it('allow investor approve payments', async () => {
    const owner = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const receiver = accounts[4]
    
    // 收款方接收资金前的账户余额
    const receiverOldBalance = new BigNumber(await web3.eth.getBalance(receiver))

    //投资人发起投资
    await projectContract.methods.contribute().send({
      from: investor1,
      value: 500
    })


    await projectContract.methods.contribute().send({
      from: investor2,
      value: 800
    })

    //项目方发起资金申请
    const description = 'purchase machines'
    const amount = 400
    await projectContract.methods.createPayment(description, amount, receiver).send({
      from: owner,
      gas: 1000000
    })

    // 投资人进行投票
    await projectContract.methods.approvePayment(0).send({
      from: investor1,
      gas: 100000
    })
    await projectContract.methods.approvePayment(0).send({
      from: investor2,
      gas: 100000
    })

    // 检查投资人是否存在投票列表中
    const existVoter = await projectContract.methods.voterIsExist(0, investor1).call()
    assert.ok(existVoter)
    // 检查如果传入非投资人是否返回false

    const existReceiver = await projectContract.methods.voterIsExist(0, receiver).call()
    assert.ok(!existReceiver)

    // 项目方划转资金
    await projectContract.methods.doPayment(0).send({
      from: owner,
      gas: 100000
    })

    // 检查payment状态
    const payment = await projectContract.methods.payments(0).call()
    assert.ok(payment.completed, true)
    assert.ok(payment.amount, 400)

    // 检查接收方当前余额, 确保余额正确发生改变
    const receiverCurrentBalance = new BigNumber(await web3.eth.getBalance(receiver))
    const balanceDiff = receiverCurrentBalance.minus(receiverOldBalance)
    assert.ok(balanceDiff, 400)
  })
})
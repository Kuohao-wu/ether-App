<template>
  <div>
    <el-row class="project-base-info">
      <el-col 
        :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>项目基本信息</span>
          </div>
          <el-progress :percentage="projectInfo.process" color="#8e71c7"></el-progress>
          <div class="m-project-info">
            <el-row :gutter="20" class="info-row">
              <el-col :span="4">
                <div class="info-row-box">
                  <div class="box-title">
                    {{projectInfo.goal}} ETH
                  </div>
                  <div>募资上限</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="info-row-box">
                  <div class="box-title">
                    {{projectInfo.minInvest}} ETH
                  </div>
                  <div>最小投资金额</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="info-row-box">
                  <div class="box-title">
                    {{projectInfo.maxInvest}} ETH
                  </div>
                  <div>最大投资金额</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="info-row-box">
                  <div class="box-title">{{projectInfo.investorsCount}} 人</div>
                  <div>参投人数</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="info-row-box">
                  <div class="box-title">{{projectInfo.balance}} ETH</div>
                  <div>已募集资金数量</div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="control-bar">
            <el-input placeholder="请输入投资金额" v-model="contributeProject.investPrice" size="small" class="input-group">
              <template slot="append">ETH</template>
            </el-input>
            <el-button type="primary" size="small" @click="contribute" :loading="contributeProject.loading">立即投资</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="project-payment-info">
      <el-col :span="24">
        <el-card class="box-card"> 
          <div slot="header" class="clearfix">
            <span>资金支出信息</span>
          </div>
          <el-table
            :data="projectInfo.payments"
            stripe
            style="width: 100%">
            <el-table-column
              prop="use"
              label="用途"
              width="180">
            </el-table-column>
            <el-table-column
              prop="amount"
              label="金额"
              width="180">
            </el-table-column>
            <el-table-column
              prop="receiver"
              label="收款方">
            </el-table-column>
            <el-table-column
              prop="completedStatus"
              label="已完成">
            </el-table-column>
            <el-table-column
              label="操作">
              <template slot-scope="scope">
                <el-button
                  v-if="scope.row.canDopayment"
                  type="primary" 
                  size="small"
                  :loading="transactProject.loading"
                  @click="transact(scope.$index)"
                >
                  划转
                </el-button>
                <el-button
                 v-if="!scope.row.completed"
                 type="primary"
                 size="small"
                 :loading="approveProject.loading"
                 @click="approve(scope.$index)"
                 >
                  投票
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <a :href="'/projects/' + projectInfo.address + '/payments/create'">
            <el-button type="primary" size="small" class="apply-payment-btn">申请资金支出</el-button>
          </a>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import web3 from '@/lib/web3'
import Project from '@/lib/project'
export default {
  name: 'projectDetail', 
  data() {
   return {
     contributeProject: {
       investPrice: '',
       loading: false
     },
     transactProject: {
       loading: false
     },
     approveProject: {
       loading: false
     }
   }
  },
  async asyncData({params}) {
    const contract  = Project(params.address)
    const summary = await contract.methods.getSummary().call()
    const [description, minInvest, maxInvest, goal, balance, investorsCount, paymentsCount, owner] = Object.values(summary)
    const payments = await Promise.all(
      Array.apply(null, { length: paymentsCount }).map((item, index) => contract.methods.payments(index).call())
    )

    const projectInfo =  {
      description,
      address: params.address,
      process: Math.ceil(balance / goal * 100),
      goal: web3.utils.fromWei(goal, 'ether'),
      balance: web3.utils.fromWei(balance, 'ether'),
      minInvest: web3.utils.fromWei(minInvest, 'ether'),
      maxInvest: web3.utils.fromWei(maxInvest, 'ether'),
      investorsCount,
      owner,
      payments: payments.map(item => ({
        use: item.description,
        amount: web3.utils.fromWei(item.amount, 'ether') + 'ETH',
        receiver: item.receiver,
        completed: item.completed,
        canDopayment: !item.completed && (item.votersCount / investorsCount > 0.5),
        completedStatus: item.completed ? '是' : '否'
      }))
    }
    return { projectInfo }
  },
  methods: {
    async contribute() {
      const { investPrice } = this.contributeProject
      const { minInvest, maxInvest, balance, goal } = this.projectInfo
      // 检查数据填写正确性
      const checkDataList = [
        {
          test: investPrice <= 0,
          tips: '投资金额必须大于0'
        },
        {
          test: investPrice < minInvest,
          tips: '投资金额必须大于最小投资金额'
        },
        {
          test: investPrice > maxInvest,
          tips: '投资金额必须小于最大投资金额'
        },
        {
          test: investPrice > goal,
          tips: '投资金额必须小于投资总上限'
        }
      ]
      for (let i = 0; i < checkDataList.length; i++) {
        const item = checkDataList[i]
        if (item.test) {
          this.$message({
            message: item.tips,
            type: 'success'
          })
          return
        }
      }

      try {
        // 获取账户
        this.contributeProject.loading = true

        const accounts = await web3.eth.getAccounts()
        await Project(this.projectInfo.address).methods.contribute().send({
          from: accounts[0],
          value: web3.utils.toWei(investPrice, 'ether'),
          gas: '5000000'
        })
        this.$message({
          message: '投资项目成功',
          type: 'success'
        })

        // 刷新页面
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } catch(error) {
        this.$message.error(error.message)
      } finally {
        this.contributeProject.loading = false
      }
    },
    async transact(i) {
      try {
        this.transactProject.loading = true
        const accounts = await web3.eth.getAccounts()
        const sender = accounts[0]
        if (sender !== this.projectInfo.owner) {
          this.$message.error('只有管理员才有权进行资金划转')
          return
        }
        
        // 资金划转
        const contract = await Project(this.projectInfo.address)
        await contract.methods.doPayment(i).send({
          from: sender,
          gas: '5000000'
        })
        
        this.$message({
          message: '资金划转成功',
          type: 'success'
        })
        
        // 刷新页面
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch(error) {
        this.$message.error(error.message)
      } finally {
        this.transactProject.loading = false
      }
    },
    async approve(i) {
      try {
        this.approveProject.loading = true
        const accounts = await web3.eth.getAccounts()
        const sender = accounts[0]

        const contract = await Project(this.projectInfo.address)
        // 检查投票者是否为投资人
        const existInvestor = await contract.methods.investors(sender).call()
        if (existInvestor === '0') {
          this.$message.error('只有投资人才能进行投票')
          return
        }
        // 检查投票者是否已经进行投票
        const existVoter = await contract.methods.voterIsExist(i, sender).call()
        if (existVoter) {
          this.$message({
            message: '您已进行过投票',
            type: 'error',
            duration: 2000
          })
          return
        }
        await contract.methods.approvePayment(i).send({
          from: sender,
          gas: '5000000'
        })

        this.$message({
          message: '投票成功',
          type: 'success'
        })
      } catch(error) {
        this.$message({
          type: 'error',
          message: error.message,
          duration: 0,
          showClose: true
        })
      } finally {
        this.approveProject.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .project-base-info {
    margin-bottom: 35px;
  }
  .m-project-info {
    margin-top: 20px;
    .info-row {
      margin-bottom: 20px;
    }
    .info-row-box {
      font-weight: 300;
      background-color: cornflowerblue;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      border-radius: 5px;
      color: #fff;
      padding: 10px 12px;
      line-height: 1.5;
      .box-title {
        font-size: 20px;
        font-weight: 400;
        padding-bottom: 10px;
      }
    }
  }
  .input-group {
    width: auto;
    margin-right: 20px;
  }
  .apply-payment-btn {
    margin-top: 20px;
  }
</style>



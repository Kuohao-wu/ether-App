<template>
  <el-row>
    <el-col :span="24">
      <el-card>
        <div slot="header" class="clearfix">
          <span>请求支出资金</span>
        </div>
        <el-form :model="form" label-width="120px">
          <el-form-item label="项目名称">
            <el-input v-model="project.description" disabled/>
          </el-form-item>
          <el-form-item label="支出金额">
            <el-input v-model="form.amount" placeholder="请输入支出金额">
              <template slot="append">ETH</template>
            </el-input>
          </el-form-item>
          <el-form-item label="资金用途">
            <el-input v-model="form.description" placeholder="请输入资金用途">
              <template slot="append">ETH</template>
            </el-input>
          </el-form-item>
          <el-form-item label="收款账号">
            <el-input v-model="form.receiver" placeholder="请输入收款账号">
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" size="small" :loading="loading">立即创建</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import web3 from '@/lib/web3'
import Project from '@/lib/project'
export default {
  name: 'paymentCreate', 
  data() {
   return {
     form: {
       receiver: '',
       amount: '',
       description: ''
     },
     loading: false
   }
  },
  async asyncData({params}) {
    const summary = await Project(params.address).methods.getSummary().call()
    const [description, minInvest, maxInvest, balance, goal, investorsCount, paymentsCount, owner] = Object.values(summary)

    return {
      project: {
        address: params.address,
        description,
        balance,
        owner
      }
    }
  },
  methods: {
    checkData() {
      const { receiver, amount, description } = this.form
      const conditiionList = [
        {
          test: amount <= 0,
          tips: '支出金额必须大于0'
        },
        {
          test: amount > this.project.balance,
          tips: '支出金额不能大于账户余额'
        },
        {
          test: description === '',
          tips: '资金用途不能为空'
        },
        {
          test: !web3.utils.isAddress(receiver),
          tips: '请输入正确的收款人地址'
        }
      ]
      for (let i = 0; i < conditiionList.length; i++) {
        const item = conditiionList[i]
        if (item.test) {
          this.$message({
            message: item.tips,
            type: 'success'
          })
          return false
        }
        return true
      }
    },
    async onSubmit() {
      if (!this.checkData()) return

      try {
        this.loading = true
        
        // 获取账户地址
        const accounts = await web3.eth.getAccounts()
        const sender = accounts[0]

        if (sender !== this.project.owner) {
          console.log(this.project.owner)
          this.$message.error('只有管理员才能申请资金支出')
          return
        }

        // 创建资金划转申请
        const contract = await Project(this.project.address)
        await contract.methods
        .createPayment(this.form.description, web3.utils.toWei(this.form.amount, 'ether'), this.form.receiver)
        .send({ from: sender, gas: '5000000' })

        this.$message({
          message: '资金申请成功',
          type: 'success'
        })

        // 返回上一页
        setTimeout(() => {
          window.history.go(-1)
        }, 1000)
      } catch (error) {
        this.$message.error(error.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>



<template>
  <el-row>
    <el-col :span="24">
      <el-card>
        <div slot="header" class="clearfix">
          <span>发起项目</span>
        </div>
        <el-form :model="form" label-width="120px">
          <el-form-item label="项目名称">
            <el-input v-model="form.description" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="资金募集上限">
            <el-input v-model="form.goal" placeholder="请输入资金募集上限">
              <template slot="append">ETH</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最小投资资金">
            <el-input v-model="form.minInvest" placeholder="请输入最小投资资金">
              <template slot="append">ETH</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最大投资资金">
            <el-input v-model="form.maxInvest" placeholder="请输入最大投资资金">
              <template slot="append">ETH</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :loading="loading">立即创建</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-alert
        v-show="errorMsg"
        class="error-tips"
        :title="errorMsg"
        type="error">
      </el-alert>
    </el-col>
  </el-row>
</template>

<script>
import ProjectList from '@/lib/projectList'
import web3 from '@/lib/web3'
export default {
  name: 'projectCreate', 
  data() {
   return {
     form: {
       description: '',
       goal: '',
       minInvest: '',
       maxInvest: '',
     },
     errorMsg: '',
     loading: false
   }
  },
  methods: {
    checkData() {
      const { description, goal, minInvest, maxInvest } = this.form
      const conditionList = [
        {
          test: description === '',
          tips: '项目名称不能为空'
        },
        {
          test: goal <= 0,
          tips: '资金募集上限必须大于0'
        },
        {
          test: minInvest <= 0,
          tips: '最小投资资金不能为空'
        },
        {
          test: maxInvest <= 0,
          tips: '最大投资资金不能为空',
        },
        {
          test: maxInvest < minInvest,
          tips: '最大投资资金不能小于最小投资资金'
        }
      ]
      for(let i = 0; i < conditionList.length; i++) {
        if (conditionList[i].test) {
          this.errorMsg = conditionList[i].tips
          return false
        }
      }
      return true
    },
    async onSubmit() {
      // 检查数据填写正确性
      if (!this.checkData()) return
      let { description, goal, minInvest, maxInvest } = this.form
      goal = web3.utils.toWei(goal, 'ether')
      minInvest = web3.utils.toWei(minInvest, 'ether')
      maxInvest = web3.utils.toWei(maxInvest, 'ether')
      try {
        this.loading = true
        const accounts = await web3.eth.getAccounts()
        await ProjectList.methods.createProject(description, minInvest, maxInvest, goal)
        .send({
          from: accounts[0],
          gas: '5000000'
        })

        this.$message({
          message: '项目创建成功!',
          type: 'success'
        })

        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      } catch (error) {
        this.$message.error('项目创建失败!')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .error-tips {
    margin-top: 25px;
  }
</style>



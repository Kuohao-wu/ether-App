<template>
  <el-row :gutter="30">
    <el-col
      v-for="project in projects"
      :key="project.address"
      :span="12">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{project.description}}</span>
        </div>
        <el-progress :percentage="project.process" color="#8e71c7"></el-progress>
        <div class="m-project-info">
          <el-row :gutter="20" class="info-row">
            <el-col :span="8">
              <div class="info-row-box">
                <div class="box-title">
                  {{project.goal}} ETH
                </div>
                <div>募资上限</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-row-box">
                <div class="box-title">
                  {{project.minInvest}} ETH
                </div>
                <div>最小投资金额</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-row-box">
                <div class="box-title">
                  {{project.maxInvest}} ETH
                </div>
                <div>最大投资金额</div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="info-row">
            <el-col :span="8">
              <div class="info-row-box">
                <div class="box-title">{{project.investorCount}} 人</div>
                <div>参投人数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-row-box">
                <div class="box-title">{{project.balance}} ETH</div>
                <div>已募集资金数量</div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="control-bar">
          <nuxt-link :to="'/projects/' + project.address">
            <el-button type="primary" size="small">立即投资</el-button>
          </nuxt-link>
          <nuxt-link class="view-detail" :to="'/projects/' + project.address">查看详情</nuxt-link>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import ProjectList from '@/lib/projectList'
import Project from '@/lib/project'
import web3 from '@/lib/web3'
export default {
  name: 'Index',
  async asyncData() {
    const addressList = await ProjectList.methods.getProjects().call()
    const summaryList = await Promise.all(
      addressList.map(address => Project(address).methods.getSummary().call())
    )
    const projects = addressList.map((address, index) => {
    const [
      description,
      minInvest,
      maxInvest,
      goal,
      balance,
      investorCount,
      paymentCount,
      owner
    ] = Object.values(summaryList[index])
      return {
        address,
        description,
        minInvest: web3.utils.fromWei(minInvest, 'ether'),
        maxInvest: web3.utils.fromWei(maxInvest, 'ether'),
        goal: web3.utils.fromWei(goal, 'ether'),
        balance: web3.utils.fromWei(balance, 'ether'),
        process: Math.ceil(balance / goal * 100),
        investorCount,
        paymentCount,
        owner
      }
    }).reverse()

    return {
      projects
    }
  }
}
</script>

<style lang="scss" scoped>
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
      text-indent: 2em;
      padding: 10px 0;
      .box-title {
        font-size: 20px;
        font-weight: 400;
        padding-bottom: 10px;
      }
    }
  }
  .view-detail {
    margin-top: 10px;
    float: right;
    color: cornflowerblue;
  }
</style>



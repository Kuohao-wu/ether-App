<template>
  <el-container>
    <el-header class="m-header">
      <el-menu
        :default-active="activeIndex" 
        class="el-menu-demo" 
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="handleSelect">
        <el-menu-item index="1">DAICO</el-menu-item>
        <el-menu-item index="2">
          <a href="/" class="menu-link">Project</a>
        </el-menu-item>
      </el-menu>
      <el-button type="primary" size="small" class="create-project-btn">
        <nuxt-link to="/projects/create">
          发起项目
        </nuxt-link>
      </el-button>
    </el-header>
    <el-main>
      <div class="wrapper">
        <nuxt/>
      </div>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'default', 
  data() {
   return {
     activeIndex: '2'
   }
  },
  methods: {
    handleSelect(key, keyPath) {
      
    }
  }
}
</script>

<style lang="scss">
  .m-header {
    position: relative;
    padding: 0;
  }
  .menu-link {
    display: block;
  }
  .create-project-btn {
    position: absolute;
    top: 50%;
    right: -30px;
    transform: translate(-50%, -50%);
    a {
      color: #fff;
    }
  }
</style>



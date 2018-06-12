const fs = require('fs-extra')
const path = require('path')
const solc = require('solc')

// 先清空编译输出目录
const compiledPath = path.resolve(__dirname, '../compiled')
fs.removeSync(compiledPath)
fs.ensureDirSync(compiledPath)

const contractsPath = path.resolve(__dirname, '../contracts')
const contractsFiles = fs.readdirSync(contractsPath)

contractsFiles.forEach(fileName => {
  const contractsSource = fs.readFileSync(path.join(contractsPath, fileName), 'utf8')
  // 编译合约
  const compiledResult = solc.compile(contractsSource)

  // 如果编译发生错误，则抛出
  if (Array.isArray(compiledResult.errors) && compiledResult.errors.length) {
      throw new Error(compiledResult.errors[0])
  }

  // 循环保存编译结果为json
  Object.keys(compiledResult.contracts).forEach(name => {
    const contractName = name.split(':')[1]
    const filePath = path.resolve(compiledPath, `${contractName}.json`)
    fs.outputJsonSync(filePath, compiledResult.contracts[name])
  })
})


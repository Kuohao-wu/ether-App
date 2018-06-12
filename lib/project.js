import web3 from './web3'
import ProjectJSON from '../compiled/Project.json'

const getContract = address => new web3.eth.Contract(JSON.parse(ProjectJSON.interface), address)

export default getContract
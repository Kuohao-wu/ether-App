pragma solidity ^0.4.17;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    function mul(uint a, uint b) internal pure returns (uint) {
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint a, uint b) internal pure returns (uint) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint a, uint b) internal pure returns (uint) {
        assert(b <= a);
        return a - b;
    }

    function add(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        assert(c >= a);
        return c;
    }
}

// projects合约列表
contract ProjectList {
    using SafeMath for uint;
    address[] public projects;

    // 创建一个项目
    function createProject(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
        address newProject = new Project(_description, _minInvest, _maxInvest, _goal, msg.sender);
        projects.push(newProject);
    }

    // 获取项目列表
    function getProjects() public view returns (address[]) {
        return projects;
    }
}

// 单个project合约
contract Project {
    using SafeMath for uint;
    struct Payment {
        string description;    // 支出用途
        uint amount;           // 支出总计
        address receiver;      // 资金接收者
        bool completed;        // 是否完成资金支出请求
        mapping(address => bool) voters;      // 投票人数集合
        uint votersCount;       // 投票人数
    }

    address public owner;   // 项目所有者
    string public description;  // 项目介绍
    uint public minInvest;      // 最小投资资金
    uint public maxInvest;      // 最大投资资金
    uint public goal;           // 融资上限
    uint public investorsCount;   // 投资人人数
    mapping(address => uint) public investors; // 投资人列表
    Payment[] public payments;  // 资金支出列表

    // 类似于装饰器，实现包裹函数的功能
    modifier ownerOnly() {
        // 发起资金支出请求的必须是项目拥有者
        require(msg.sender == owner);
        _;
    }

    // 初始化变量
    constructor(string _description, uint _minInvest, uint _maxInvest, uint _goal, address _owner) public {
        owner = _owner;
        description = _description;
        minInvest = _minInvest;
        maxInvest = _maxInvest;
        goal = _goal;
    }

    // 参与项目投资接口
    function contribute() public payable {
        // 使用require断言，如果条件不满足，交易就会被回滚
        // 当前交易的金额要大于或等于最小投资金额，小于或等于最大投资金额
        require(msg.value >= minInvest);
        require(msg.value <= maxInvest);

        // 当前账户余额要小于或等于融资上限
        uint newBalance = 0;
        newBalance = address(this).balance.add(msg.value);
        require(newBalance <= goal);
        
        // 将投资者地址和投资金额记录到投资者集合中
        investors[msg.sender] = msg.value;
        investorsCount += 1;
    }

    // 发起资金支出请求
    function createPayment(string _description, uint _amount, address _receiver) ownerOnly public {
        // 初始化项目资金支出列表
        Payment memory newPayment = Payment({
            description: _description,
            amount: _amount,
            receiver: _receiver,
            completed: false,
            votersCount: 0
        });

        payments.push(newPayment);
    }

    // 投票赞成某个资金支出请求，需要指定是哪一条请求，要求投票的人是投资人，并且没有重复投票
    function approvePayment(uint index) public {
        Payment storage payment = payments[index];

        // 必须是投资人才能进行投票，在投资人列表中找不到交易发起者，则终止投票
        require(investors[msg.sender] > 0);

        // 如果已存在交易发起者，则终止投票
        require(!payment.voters[msg.sender]);

        // 符合以上条件，将交易发起者到资金支出的投票集合中
        payment.voters[msg.sender] = true;
        payment.votersCount += 1;
    }

    // 完成资金支出，需要指定是哪笔支出，即调用该接口给资金接收方转账，不能重复转账
    // 并且赞成票数超过投资人数量的50%
    function doPayment(uint index) ownerOnly public {

        Payment storage payment = payments[index];

        // 断言资金支出请求尚未完成
        require(!payment.completed);
        // 断言资金支出请求投票人才超过投资人数的一半
        require(payment.votersCount > (investorsCount / 2));
        // 断言当前账户余额大于资金支出请求的总数，否则回滚
        require(address(this).balance >= payment.amount);

        // 确认以上断言，对资金接收方发起转账，完成交易
        payment.receiver.transfer(payment.amount);
        payment.completed = true;
    }
    // 把项目基本信息返回
    function getSummary() public view returns (string, uint, uint, uint, uint, uint, uint, address) {
        return (
            description,
            minInvest,
            maxInvest,
            goal,
            address(this).balance,
            investorsCount,
            payments.length,
            owner
        );
    }

    // 判断投票者是否已经投票
    function voterIsExist(uint paymentIndex, address voterAddress) public view returns (bool) {
        Payment storage payment = payments[paymentIndex];
        
        if (payment.voters[voterAddress]) {
            return true;
        }
        return false;
    }
}

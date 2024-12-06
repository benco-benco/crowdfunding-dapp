// Set up Web3
let web3;
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // Request account access
} else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
} else {
    alert("Please install MetaMask or another Web3 provider.");
}

// Contract ABI (generated by Truffle after deployment)
const contractABI = [
    // Add your contract ABI here (can be found in the build folder)
    {
        "constant": true,
        "inputs": [],
        "name": "targetAmount",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "currentContributions",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "timeLeft",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "refund",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"name": "_amount", "type": "uint256"}],
        "name": "contribute",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    }
];

// Contract address (the one from the Truffle deployment output)
const contractAddress = "0x6Fe9e9e3C67cF860f2Ae6dc9051c58e47f70dD46";

// Create contract instance
const crowdfundingContract = new web3.eth.Contract(contractABI, contractAddress);

// Set up web3 provider and user account
let userAccount;
web3.eth.getAccounts().then(accounts => {
    userAccount = accounts[0];
    document.getElementById("contractAddress").innerText = contractAddress;
});

// Fetch contract data and update the UI
async function updateContractInfo() {
    const targetAmount = await crowdfundingContract.methods.targetAmount().call();
    const currentContributions = await crowdfundingContract.methods.currentContributions().call();
    const timeLeft = await crowdfundingContract.methods.timeLeft().call();

    document.getElementById("targetAmount").innerText = web3.utils.fromWei(targetAmount, "ether");
    document.getElementById("currentContributions").innerText = web3.utils.fromWei(currentContributions, "ether");
    document.getElementById("timeLeft").innerText = timeLeft;
}

// Event listeners
document.getElementById("contributeButton").addEventListener("click", async () => {
    const amount = document.getElementById("contributeAmount").value;
    if (amount && !isNaN(amount)) {
        const weiAmount = web3.utils.toWei(amount, "ether");
        await crowdfundingContract.methods.contribute().send({ from: userAccount, value: weiAmount });
        updateContractInfo(); // Refresh contract info
    }
});

document.getElementById("refundButton").addEventListener("click", async () => {
    await crowdfundingContract.methods.refund().send({ from: userAccount });
    updateContractInfo(); // Refresh contract info
});

// Initial update of contract info
updateContractInfo();

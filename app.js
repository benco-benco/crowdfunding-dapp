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

// Contract ABI (replace with actual ABI from Truffle)
const contractABI = [
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
    },
    {
        "inputs": [{"name": "_auditor", "type": "address"}, {"name": "_targetAmount", "type": "uint256"}, {"name": "_duration", "type": "uint256"}],
        "name": "startCampaign",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Contract address (the one from Truffle deployment)
const contractAddress = "0x57c101f2b149C86d56ecC820EaE23df95754105F";

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

// Handle start campaign button click
document.getElementById("startCampaignButton").addEventListener("click", async () => {
    const fundGoal = document.getElementById("fundGoal").value;
    const campaignDuration = document.getElementById("campaignDuration").value;

    if (fundGoal && campaignDuration) {
        const fundGoalWei = web3.utils.toWei(fundGoal, "ether");
        const durationInSeconds = campaignDuration * 24 * 60 * 60; // Convert days to seconds

        try {
            await crowdfundingContract.methods.startCampaign()
                .send({ from: userAccount });
            alert("Campaign started successfully!");

            // Update the contract info (refresh status)
            updateContractInfo();
        } catch (error) {
            console.error(error);
            alert("An error occurred while starting the campaign.");
        }
    }
});



// Contribute to the campaign
document.getElementById("contributeButton").addEventListener("click", async () => {
    const amount = document.getElementById("contributeAmount").value;
    if (amount && !isNaN(amount)) {
        const weiAmount = web3.utils.toWei(amount, "ether");

        try {
            await crowdfundingContract.methods.contribute()
                .send({ from: userAccount, value: weiAmount });
            alert("Contribution successful!");

            // Refresh contract info after contribution
            updateContractInfo();
        } catch (error) {
            console.error(error);
            alert("An error occurred while contributing.");
        }
    } else {
        alert("Please enter a valid amount.");
    }
});


// Refund button (for contributors if campaign fails)
document.getElementById("refundButton").addEventListener("click", async () => {
    await crowdfundingContract.methods.refund().send({ from: userAccount });
    updateContractInfo(); // Refresh contract info
});

// Initial update of contract info
updateContractInfo();

// Call this function to load active campaigns
listActiveCampaigns();


async function listActiveCampaigns() {
    const totalCampaigns = await crowdfundingContract.methods.totalCampaigns().call();
    const activeCampaigns = [];

    for (let i = 0; i < totalCampaigns; i++) {
        const campaign = await crowdfundingContract.methods.campaigns(i).call();
        if (campaign.isActive) {
            activeCampaigns.push(campaign);
        }
    }

    // Display the active campaigns in the UI
    const campaignList = document.getElementById("campaignList");
    campaignList.innerHTML = ""; // Clear previous list

    activeCampaigns.forEach(campaign => {
        const listItem = document.createElement("li");
        listItem.innerText = `Campaign by ${campaign.owner} | Goal: ${web3.utils.fromWei(campaign.targetAmount, "ether")} ETH | Raised: ${web3.utils.fromWei(campaign.raisedAmount, "ether")} ETH`;
        campaignList.appendChild(listItem);
    });
}

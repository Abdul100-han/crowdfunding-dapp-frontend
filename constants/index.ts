export const CROWDFUNDING_ADDRESS = '0xE5fC5aC321791703016dd26fc63FEB8a593B677d' as const;

export const CROWDFUNDING_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "minimumUsdContribution",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "fundingGoalUsd",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "durationInSeconds",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "priceFeed",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "fund",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getAddressToAmountFunded",
    "inputs": [
      {
        "name": "funder",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDeadline",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getEthUsdValue",
    "inputs": [
      {
        "name": "ethAmountWei",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "usdValue",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFunderAtIndex",
    "inputs": [
      {
        "name": "index",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFunderCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFundingGoalUsd",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMinimumUsdContribution",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getOwner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPriceFeed",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRefund",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getTotalUsdRaised",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Funded",
    "inputs": [
      {
        "name": "funder",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Refunded",
    "inputs": [
      {
        "name": "funder",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Withdrawn",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "Crowdfunding__BelowMinimumUsd",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__DeadlineNotReached",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__DeadlineReached",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__InvalidConstructorArgs",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__InvalidPrice",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__NotOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__NothingToRefund",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__StalePriceFeed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__TargetAlreadyMet",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__TargetNotMet",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__TransferFailed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Crowdfunding__ZeroContribution",
    "inputs": []
  }
] as const;

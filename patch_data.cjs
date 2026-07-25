const fs = require('fs');

const content = `export interface DocResource {
  title: string;
  url: string;
}

export interface DocTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readingTime: string;
  keywords: string[];
  content: string;
  relatedTopics: string[];
  officialResources: DocResource[];
}

export const DOC_TOPICS: DocTopic[] = [
  {
    id: 'fvm-overview',
    title: 'FVM Overview',
    description: 'Learn about the core concepts and implementation details of FVM.',
    difficulty: 'Intermediate',
    readingTime: '10 min read',
    keywords: ['fvm', 'fevm', 'smart contracts', 'actors', 'wasm', 'evm'],
    relatedTopics: ['lotus-api', 'storage-deals'],
    officialResources: [
      { title: 'FVM Official Website', url: 'https://fvm.filecoin.io/' },
      { title: 'FVM Docs', url: 'https://docs.filecoin.io/smart-contracts/fundamentals/architecture-of-fvm' },
      { title: 'GitHub Repository', url: 'https://github.com/filecoin-project/ref-fvm' }
    ],
    content: \`
## Introduction
The Filecoin Virtual Machine (FVM) is a robust runtime environment for smart contracts (often referred to as *actors*) on the Filecoin network. It introduces general programmability to the Filecoin blockchain, empowering developers to orchestrate data storage, compute, and decentralized applications (dApps) in a unified ecosystem.

## Overview & Key Concepts
- **Actors**: The Filecoin terminology for smart contracts. Built-in actors handle core network functions (like miner operations and market dynamics), while user-defined actors are deployed by developers.
- **WASM Runtime**: FVM executes WebAssembly (WASM), making it inherently language-agnostic. Rust is commonly used for native FVM development.
- **EVM Compatibility (FEVM)**: Through FEVM, developers can deploy unmodified Solidity contracts to Filecoin using standard tools like Hardhat, Foundry, and Remix.

> **Tip**
> FEVM is the easiest entry point for Ethereum developers. You can use your existing Web3 workflows.

## Execution Model
The execution model in FVM is deterministic. All nodes in the Filecoin network execute the exact same WASM bytecode to verify state transitions. Gas is consumed for execution, similar to Ethereum, but optimized for storage-heavy operations.

## Example Code (Solidity on FEVM)
\\\`\\\`\\\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BasicDataRegistry {
    mapping(address => string) public userCIDs;

    // Store a CID associated with the sender
    function registerCID(string memory _cid) public {
        userCIDs[msg.sender] = _cid;
    }

    // Retrieve the stored CID
    function getCID(address _user) public view returns (string memory) {
        return userCIDs[_user];
    }
}
\\\`\\\`\\\`

## Best Practices
1. **Optimize Gas**: execution on Filecoin incurs gas. Be mindful of loops and complex storage operations.
2. **Leverage Storage Hooks**: Build contracts that react to storage deal state changes (e.g., automatically funding renewals).

> **Warning**
> Always test FEVM contracts on the Calibration testnet before mainnet deployment.
\`
  },
  {
    id: 'lotus-api',
    title: 'Lotus API',
    description: 'Interact with the Filecoin network via the Lotus JSON-RPC API.',
    difficulty: 'Advanced',
    readingTime: '12 min read',
    keywords: ['lotus', 'rpc', 'json-rpc', 'api', 'endpoints'],
    relatedTopics: ['network-parameters', 'fvm-overview'],
    officialResources: [
      { title: 'Lotus API Reference', url: 'https://lotus.filecoin.io/reference/lotus/api/' },
      { title: 'Lotus Official Docs', url: 'https://lotus.filecoin.io/' }
    ],
    content: \`
## Introduction
Lotus is the reference implementation of the Filecoin protocol. The Lotus API enables developers to interact with a Lotus node via JSON-RPC, providing programmatic access to chain state, wallet management, storage deals, and more.

## JSON RPC & Authentication
All requests are sent via HTTP POST or WebSocket to the Lotus node. Most endpoints require authentication using a JWT token.

> **Best Practice**
> Always use HTTPS and secure your JWT tokens. Use fine-grained permissions (read, write, sign, admin) depending on the required API access.

## Common API Namespaces
- **Chain APIs**: \\\`Filecoin.ChainHead\\\`, \\\`Filecoin.ChainGetBlock\\\`
- **Wallet APIs**: \\\`Filecoin.WalletNew\\\`, \\\`Filecoin.WalletBalance\\\`
- **State APIs**: \\\`Filecoin.StateMinerPower\\\`, \\\`Filecoin.StateNetworkName\\\`
- **Mpool APIs**: \\\`Filecoin.MpoolPushMessage\\\`

## Example Request (cURL)
\\\`\\\`\\\`bash
curl -X POST "http://127.0.0.1:1234/rpc/v1" \\\\
     -H "Content-Type: application/json" \\\\
     -H "Authorization: Bearer YOUR_TOKEN" \\\\
     -d '{
       "jsonrpc": "2.0",
       "method": "Filecoin.ChainHead",
       "params": [],
       "id": 1
     }'
\\\`\\\`\\\`

## Example Code (JavaScript)
\\\`\\\`\\\`javascript
const response = await fetch("http://127.0.0.1:1234/rpc/v1", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN"
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "Filecoin.WalletBalance",
    params: ["f1..."],
    id: 1
  })
});
const data = await response.json();
console.log("Balance:", data.result);
\\\`\\\`\\\`
\`
  },
  {
    id: 'cid-specification',
    title: 'CID Specification',
    description: 'Understand Content Identifiers used in IPFS and Filecoin.',
    difficulty: 'Beginner',
    readingTime: '8 min read',
    keywords: ['cid', 'ipfs', 'multihash', 'base32', 'base58btc'],
    relatedTopics: ['storage-deals', 'retrieval-markets'],
    officialResources: [
      { title: 'IPFS CID Docs', url: 'https://docs.ipfs.tech/concepts/content-addressing/' },
      { title: 'CID Inspector', url: 'https://cid.ipfs.tech/' }
    ],
    content: \`
## What is a CID?
A Content Identifier (CID) is a self-describing, content-addressed identifier. Instead of pointing to *where* content is located (like a URL), it forms an address based on the *content itself*. CIDs are foundational to IPFS and Filecoin.

## CIDv0 vs CIDv1
- **CIDv0**: The original version. Always uses Base58BTC encoding and SHA-256 hash. Starts with \\\`Qm...\\\`.
- **CIDv1**: Highly flexible. Supports multiple encodings (Base32, Base58), codecs (dag-pb, raw), and hash functions. Commonly starts with \\\`bafy...\\\`.

> **Information**
> Modern Filecoin and IPFS applications prefer CIDv1 encoded in Base32 for compatibility with subdomains.

## CID Structure Diagram
A CIDv1 consists of:
1. **Multibase Prefix**: Defines the encoding (e.g., \\\`b\\\` for Base32).
2. **CID Version**: Represents the version (e.g., \\\`1\\\`).
3. **Multicodec**: Indicates the data format (e.g., \\\`dag-pb\\\`).
4. **Multihash**: The actual cryptographic hash (e.g., \\\`sha2-256\\\` + hash length + digest).

## Example CIDs
\\\`\\\`\\\`text
// CIDv0 (Base58BTC)
QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG

// CIDv1 (Base32)
bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
\\\`\\\`\\\`

## Common Mistakes
- **Assuming CID implies availability**: A CID is just a fingerprint. The data must actually be hosted by a node to be retrievable.
- **Mixing up PieceCID and Payload CID**: In Filecoin, PieceCID represents the padded, CommP hash used for storage deals, while Payload CID is the standard IPFS data hash.
\`
  },
  {
    id: 'storage-deals',
    title: 'Storage Deals',
    description: 'Learn the lifecycle and mechanics of Filecoin storage deals.',
    difficulty: 'Intermediate',
    readingTime: '15 min read',
    keywords: ['storage deals', 'piececid', 'commp', 'verified', 'datacap'],
    relatedTopics: ['retrieval-markets', 'lotus-api'],
    officialResources: [
      { title: 'Making Storage Deals', url: 'https://docs.filecoin.io/storage/' },
      { title: 'Boost Docs', url: 'https://boost.filecoin.io/' }
    ],
    content: \`
## Overview
A storage deal is an agreement between a client and a storage provider (SP). The client pays the SP in FIL (Filecoin's native token) to store data for a specific duration, and the SP must continuously mathematically prove they are storing it (Proof of Spacetime).

## Key Concepts
- **PieceCID (CommP)**: The Commitment of Piece. Data in Filecoin must be padded to a specific size (e.g., 32 GiB sectors). The PieceCID is the root hash of this padded data.
- **Verified Deals**: Deals made using Filecoin Plus (Fil+) DataCap. Verified deals provide the Storage Provider with 10x block reward power, making them highly incentivized (often free for clients).

## Deal Lifecycle
1. **Discovery**: Client finds an SP matching their price and location requirements.
2. **Data Transfer**: Client transfers the CAR (Content Addressable aRchive) file to the SP via HTTP or Graphsync.
3. **Proposal**: Client submits a deal proposal on-chain or off-chain (Boost).
4. **Acceptance & Sealing**: SP accepts, packs data into a sector, and performs the compute-intensive *sealing* process.
5. **Proving**: SP submits WindowPoSt (Window Proof of Spacetime) daily to prove data retention.

> **Warning**
> If a Storage Provider fails their daily WindowPoSt, they are slashed (lose collateral), ensuring high network reliability.

## Example JSON-RPC Deal Proposal
\\\`\\\`\\\`json
{
  "jsonrpc": "2.0",
  "method": "Filecoin.ClientStartDeal",
  "params": [{
    "Data": {
      "TransferType": "graphsync",
      "Root": { "/": "bafy..." },
      "PieceCid": null,
      "PieceSize": 0
    },
    "Wallet": "f1...",
    "Miner": "f01234",
    "EpochPrice": "0",
    "MinBlocksDuration": 518400,
    "VerifiedDeal": true
  }],
  "id": 1
}
\\\`\\\`\\\`
\`
  },
  {
    id: 'retrieval-markets',
    title: 'Retrieval Markets',
    description: 'Understand how data is retrieved from the Filecoin network.',
    difficulty: 'Intermediate',
    readingTime: '9 min read',
    keywords: ['retrieval', 'markets', 'payment channels', 'lassie'],
    relatedTopics: ['storage-deals', 'cid-specification'],
    officialResources: [
      { title: 'Filecoin Retrievals', url: 'https://docs.filecoin.io/storage/retrieve/' },
      { title: 'Saturn CDN', url: 'https://saturn.tech/' }
    ],
    content: \`
## Overview
The retrieval market is an off-chain market where clients pay retrieval providers for delivering content quickly. Unlike storage deals (which are slow and on-chain), retrieval deals are designed to be fast, synchronous, and optimized for latency.

## How It Works
When a client requests a CID:
1. **Routing**: The client queries the network (DHT or indexers) to find which Storage Providers hold the data.
2. **Pricing Query**: The client asks the SP for the retrieval price (often 0 FIL for unsealed/hot data).
3. **Data Transfer**: Data is streamed back to the client.
4. **Payment Channels**: If the retrieval requires payment, it's done incrementally using Payment Channels. The client sends micropayments as data blocks arrive.

## Best Practices & Performance Tips
- **Use Lassie**: Lassie is a highly optimized retrieval client for Filecoin and IPFS. It handles routing and protocols automatically.
- **Project Saturn**: Consider leveraging Saturn, Filecoin's Web3 CDN, for ultra-low latency sub-second retrievals worldwide.

> **Tip**
> Many Storage Providers offer *free retrievals* if they store the data "unsealed" (hot storage). Always query for unsealed copies first.

## Example CLI Retrieval (using Lassie)
\\\`\\\`\\\`bash
# Install lassie
go install github.com/filecoin-project/lassie/cmd/lassie@latest

# Fetch a CID
lassie fetch bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
\\\`\\\`\\\`
\`
  },
  {
    id: 'network-parameters',
    title: 'Network Parameters',
    description: 'Core configuration values and parameters of the Filecoin blockchain.',
    difficulty: 'Beginner',
    readingTime: '5 min read',
    keywords: ['epoch', 'block time', 'gas', 'sector size', 'finality'],
    relatedTopics: ['lotus-api'],
    officialResources: [
      { title: 'Network Parameters Specs', url: 'https://spec.filecoin.io/' }
    ],
    content: \`
## Core Metrics
Filecoin mainnet operates using strict mathematical and temporal parameters to maintain consensus and security.

### Epoch & Block Time
- **Epoch Duration**: Exactly 30 seconds.
- **Tipsets**: Filecoin uses Tipsets (sets of blocks mined at the same epoch) rather than a single block chain. This resolves forks quickly.

### Storage Parameters
- **Sector Sizes**: Filecoin mainnet supports 32 GiB and 64 GiB sectors. Storage providers must fill these sectors with data (or zeroes) to prove storage capacity.
- **Minimum Deal Duration**: 180 days (roughly 518,400 epochs).
- **Maximum Deal Duration**: Up to 3.5 years (Sector expiration limits).

> **Information**
> To convert real-world time to epochs: \\\`Epochs = (Days * 24 * 60 * 60) / 30\\\`

### Finality
A Filecoin block is considered completely final and irreversible after 900 epochs (7.5 hours). However, for most applications, a few confirmations (e.g., 2-5 tipsets) provide sufficient practical security.

## Example Epoch Calculation (JavaScript)
\\\`\\\`\\\`javascript
const SECONDS_PER_EPOCH = 30;
const GENESIS_TIMESTAMP = 1598306400; // Mainnet genesis

function dateToEpoch(date) {
    const ts = Math.floor(date.getTime() / 1000);
    return Math.floor((ts - GENESIS_TIMESTAMP) / SECONDS_PER_EPOCH);
}

console.log("Current Epoch:", dateToEpoch(new Date()));
\\\`\\\`\\\`
\`
  }
];
`;
fs.writeFileSync('src/data/docs.ts', content);

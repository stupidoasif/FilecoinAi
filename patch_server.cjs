const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  // Explorer API Route`;

const proxyStr = `  // Lotus RPC Proxy Routes
  const requireRpc = (req, res, next) => {
    if (!process.env.LOTUS_RPC_URL) {
      return res.status(503).json({ error: "Live Filecoin node not configured." });
    }
    next();
  };

  app.post("/rpc/v1/storage/deal/new", requireRpc, async (req, res) => {
    try {
      const rpcUrl = process.env.LOTUS_RPC_URL;
      const { cid, miner, duration, verified } = req.body;
      const rpcParams = [{
         Data: {
           TransferType: "graphsync",
           Root: { "/": cid },
           PieceCid: null,
           PieceSize: 0
         },
         Wallet: req.body.wallet || "f1...",
         Miner: miner,
         EpochPrice: "2500000000",
         MinBlocksDuration: duration,
         ProviderCollateral: "0",
         DealStartEpoch: -1,
         FastRetrieval: true,
         VerifiedDeal: verified
      }];

      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify({
        jsonrpc: "2.0",
        method: "Filecoin.ClientStartDeal",
        params: rpcParams,
        id: 1
      });

      const response = await fetch(rpcUrl, { method: "POST", headers, body });
      const rawResponse = await response.text();

      res.json({ url: rpcUrl, method: "POST", headers, body, rawResponse });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed" });
    }
  });

  app.get("/rpc/v1/chain/head", requireRpc, async (req, res) => {
    try {
      const rpcUrl = process.env.LOTUS_RPC_URL;
      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify({
        jsonrpc: "2.0",
        method: "Filecoin.ChainHead",
        params: [],
        id: 1
      });

      const response = await fetch(rpcUrl, { method: "POST", headers, body });
      const rawResponse = await response.text();

      res.json({ url: rpcUrl, method: "POST", headers, body, rawResponse });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed" });
    }
  });

  app.post("/rpc/v1/state/miner/power", requireRpc, async (req, res) => {
    try {
      const rpcUrl = process.env.LOTUS_RPC_URL;
      const { miner, tipsetKey } = req.body;
      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify({
        jsonrpc: "2.0",
        method: "Filecoin.StateMinerPower",
        params: [miner, tipsetKey || []],
        id: 1
      });

      const response = await fetch(rpcUrl, { method: "POST", headers, body });
      const rawResponse = await response.text();

      res.json({ url: rpcUrl, method: "POST", headers, body, rawResponse });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed" });
    }
  });

  // Explorer API Route`;

const newContent = content.replace(targetStr, proxyStr);
fs.writeFileSync('server.ts', newContent);

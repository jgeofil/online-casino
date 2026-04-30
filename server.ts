import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "vertexai-neurl" 
  });
}
const firestore = admin.firestore();

// Setup Coinbase
const apiKeyName = process.env.CDP_API_KEY_NAME || "";
const apiKeyValue = (process.env.CDP_API_KEY_PRIVATE_KEY || "").replace(/\\n/g, '\n');
const networkId = process.env.CDP_NETWORK_ID || "base-sepolia";

if (apiKeyName && apiKeyValue) {
  Coinbase.configure({ apiKeyName, privateKey: apiKeyValue });
}

const WALLET_FILE = path.join(__dirname, "wallet_data.json");

async function getOrCreateWallet() {
  if (!apiKeyName || !apiKeyValue) return null;
  
  try {
    const data = await fs.readFile(WALLET_FILE, "utf-8");
    const walletData = JSON.parse(data);
    return await Wallet.import(walletData);
  } catch (e) {
    try {
      console.log("Creating new Coinbase wallet...");
      const wallet = await Wallet.create({ networkId });
      const exportedWallet = await wallet.export();
      await fs.writeFile(WALLET_FILE, JSON.stringify(exportedWallet));
      
      // Log the address so the user knows where to send funds
      const address = await wallet.getDefaultAddress();
      console.log("====================================================");
      console.log("NEW WALLET CREATED FOR WITHDRAWALS");
      console.log("Network:", networkId);
      console.log("Address:", address.toString());
      console.log("IMPORTANT: Fund this wallet to process withdrawals!");
      console.log("====================================================");
      
      return wallet;
    } catch (err) {
      console.error("Failed to create wallet:", err);
      return null;
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route for withdrawal
  app.post("/api/withdraw", async (req, res) => {
    const { amount, address, idToken } = req.body;

    if (!idToken) return res.status(401).json({ error: "Missing identity token" });

    try {
      // 1. Verify user
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // 2. Check balance in Firestore
      const userRef = firestore.collection("users").doc(uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
      const userData = userDoc.data();
      
      if (!userData || userData.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // 3. Process Crypto Transfer
      const wallet = await getOrCreateWallet();
      if (!wallet) {
          return res.status(503).json({ error: "Coinbase SDK not configured. Set CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY." });
      }

      // Using USDC by default for "real value" feel
      try {
        const transfer = await wallet.createTransfer({
          amount,
          assetId: Coinbase.assets.Usdc,
          destination: address,
        });

        // Wait for confirmation
        const completedTransfer = await transfer.wait();
        const hash = completedTransfer.getTransactionHash();

        // 4. Update balance in Firestore
        await userRef.update({
          balance: admin.firestore.FieldValue.increment(-amount),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 5. Record withdrawal
        await firestore.collection("withdrawals").add({
          userId: uid,
          address,
          amount,
          status: "processed",
          txHash: hash,
          link: completedTransfer.getTransactionLink(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, hash });
      } catch (cryptoError: any) {
        console.error("Crypto transfer failed:", cryptoError);
        res.status(400).json({ error: `Crypto Error: ${cryptoError.message || "Is the wallet funded?"}` });
      }

    } catch (error: any) {
      console.error("Withdrawal endpoint failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

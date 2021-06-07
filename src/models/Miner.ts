import mongoose from "mongoose";

export type MinerDocument = mongoose.Document & {
  symbol: string;
  walletAddress: string;
  userId: number;
};

const minerSchema = new mongoose.Schema<MinerDocument>({
  symbol: String,
  walletAddress: String,
  userId: Number
}, {
  timestamps: true,
  versionKey: false
});

export const Miner = mongoose.model<MinerDocument>("Miner", minerSchema);

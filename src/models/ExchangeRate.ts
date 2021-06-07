import mongoose from "mongoose";

export type ExchangeRateDocument = mongoose.Document & {
  currencyCode: string,
  date: string,
  time: string,
  basePrice: number,
  cashBuyingPrice: number,
  cashSellingPrice: number,
  ttBuyingPrice: number,
  ttSellingPrice: number,
  currencyUnit: number
};

const exchangeRateSchema = new mongoose.Schema<ExchangeRateDocument>({
  currencyCode: String,
  date: String,
  time: String,
  basePrice: Number,
  cashBuyingPrice: Number,
  cashSellingPrice: Number,
  ttBuyingPrice: Number,
  ttSellingPrice: Number,
  currencyUnit: Number
}, {
  timestamps: true,
  versionKey: false
});

export const ExchangeRate = mongoose.model<ExchangeRateDocument>("ExchangeRate", exchangeRateSchema);

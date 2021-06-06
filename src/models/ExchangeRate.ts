import mongoose from "mongoose";

export type ExchangeRateDocument = mongoose.Document & {
    symbol: string;
    price: number;
    date: Date;
};

const exchangeRateSchema = new mongoose.Schema<ExchangeRateDocument>(
    {
        symbol: String,
        price: Number,
        date: { type: Date, default: Date.now }
    },
    {
        versionKey: false // disable the "__v" attribute
    }
);

export const ExchangeRate = mongoose.model<ExchangeRateDocument>("ExchangeRate", exchangeRateSchema);

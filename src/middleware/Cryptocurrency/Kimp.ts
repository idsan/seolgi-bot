import axios from 'axios';
import { ExchangeRate } from '../../models/ExchangeRate'
import 'dotenv/config';

let usdCurrencyRate: number;
let numberWithCommas = (x: number) => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

class KimpData {
    public kimpRate!: number;

    constructor (public binancePrice: number, public upbitPrice: number) { 
        this.kimpRate = (upbitPrice - binancePrice * usdCurrencyRate) / (binancePrice * usdCurrencyRate)
    }
}

export class Kimp {
    async fetchKimpData(symbol: string): Promise<KimpData> {
        let binancePrice;
        let upbitPrice;

        try {
            binancePrice = await (await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${ symbol.toUpperCase() }USDT`, { timeout: 3000 })).data.price;
            upbitPrice = await (await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${ symbol.toUpperCase() }`, { timeout: 3000 })).data[0].trade_price;
        } catch (err) {
            throw err;
        }

        return new KimpData(binancePrice, upbitPrice);
    }

    async getKimp(): Promise<string> {
        let symbols = ['BTC', 'ETH', 'XRP', 'LTC', 'ETC', 'DOGE'];
        let returnString = `UPbit - Binance\n\n`;
    
        // fetch exchange rate data from the DB
        let result = await ExchangeRate.findOne({}, null, {sort: { _id: -1 }}) || { price: 0 };
        usdCurrencyRate = result.price;
    
        for (const symbol of symbols) {
            let kimpData!: KimpData;
    
            try {
                kimpData = await this.fetchKimpData(symbol);
            } catch (error) {
                console.error(error);
                return '데이터를 불러오는데 실패하였습니다.';
            }
    
            returnString += `[ ${ symbol } ] ${ (kimpData.kimpRate * 100).toFixed(2) }%\n`;
            returnString += `${ numberWithCommas(kimpData.upbitPrice) } KRW\n`;
            returnString += `${ numberWithCommas(parseFloat((kimpData.binancePrice * 1).toFixed(2))) } USD\n\n`;
        };
    
        console.log(`김프 가격 출력 ${ new Date() }`);
        return(returnString.trim());
    }
}


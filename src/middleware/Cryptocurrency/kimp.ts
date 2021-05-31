import axios from 'axios';
import 'dotenv/config';
import { ExchangeRate } from '../ExchangeRate/models/ExchangeRate'

let usdCurrencyRate: number;

class KimpData {
    kimpRate: number = -1;
    upbitPrice: number = -1;
    binancePrice: number = -1;
}

let numberWithCommas = (x: number) => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

let fetchKimpData = async (symbol: string) => {
    let temp: KimpData = new KimpData();

    try {
        temp.binancePrice = await (await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${ symbol.toUpperCase() }USDT`, { timeout: 3000 })).data.price;
        temp.upbitPrice = await (await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${ symbol.toUpperCase() }`, { timeout: 3000 })).data[0].trade_price;
    } catch (err) {
        throw err;
    }
    temp.kimpRate = (temp.upbitPrice - temp.binancePrice * usdCurrencyRate) / (temp.binancePrice * usdCurrencyRate);

    return temp;
}

export const kimp = async () => {
    let symbols = ['BTC', 'ETH', 'XRP', 'LTC', 'ETC', 'DOGE'];
    let returnString = `UPbit - Binance\n\n`;

    // fetch exchange rate data from the DB
    let result = await ExchangeRate.findOne({}, null, {sort: { _id: -1 }}) || { price: 0 };
    usdCurrencyRate = result.price;

    for (const symbol of symbols) {
        let kimpData!: KimpData;

        try {
            kimpData = await fetchKimpData(symbol);
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

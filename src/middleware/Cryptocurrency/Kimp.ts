import axios from 'axios';
import { ExchangeRate } from '../../models/ExchangeRate';
import 'dotenv/config';

let numberWithCommas = (x: number) => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

class KimpData {
  constructor (public binancePrice: number, public upbitPrice: number) { }
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
    const exchangeRateData = await ExchangeRate.findOne({ currencyCode: 'USD' });
    const usdBasePrice = exchangeRateData?.basePrice!;

    for (const symbol of symbols) {
      try {
        const { upbitPrice, binancePrice } = await this.fetchKimpData(symbol);
        const kimpRate = (upbitPrice - binancePrice * usdBasePrice) / (binancePrice * usdBasePrice);
        returnString += `[ ${ symbol } ] ${ (kimpRate * 100).toFixed(2) }%\n`;
        returnString += `${ numberWithCommas(upbitPrice) } KRW\n`;
        returnString += `${ numberWithCommas(parseFloat((binancePrice * 1).toFixed(2))) } USD\n\n`;
      } catch (error) {
        console.error(error);
        return '데이터를 불러오는데 실패하였습니다.';
      }
    };

    console.log(`김프 가격 출력 ${ new Date() }`);
    return(returnString.trim());
  }
}

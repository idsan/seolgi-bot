import axios from 'axios';
import 'dotenv/config';

let usdCurrencyRate: number;

class KimpData {
    kimpRate: number = -1;
    upbitPrice: number = -1;
    binancePrice: number = -1;
}

let numberWithCommas = (x: number) => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

let fetchKimpData = async (symbol: string) => {
    let temp: KimpData = new KimpData();

    temp.binancePrice = await (await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${ symbol.toUpperCase() }USDT`)).data.price;
    temp.upbitPrice = await (await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${ symbol.toUpperCase() }`)).data[0].trade_price;
    temp.kimpRate = (temp.upbitPrice - temp.binancePrice * usdCurrencyRate) / (temp.binancePrice * usdCurrencyRate);

    return temp;
}

export const kimp = async () => {
    let symbols = ['BTC', 'ETH', 'XRP', 'LTC', 'ETC', 'DOGE'];
    let returnString = `UPbit - Binance\n\n`;
    let response = await axios.get(process.env['CURRENCY_RATE_API_URI']!);
    usdCurrencyRate = response.data.price; // 달러 환율 받아오기

    for (const symbol of symbols) {
        let kimpData!: KimpData;

        try {
            kimpData = await fetchKimpData(symbol);
        } catch (error) {
            console.error(error);
        }

        returnString += `[ ${ symbol } ] ${ (kimpData.kimpRate * 100).toFixed(2) }%\n`;
        returnString += `${ numberWithCommas(kimpData.upbitPrice) } KRW\n`;
        returnString += `${ numberWithCommas(parseFloat((kimpData.binancePrice * 1).toFixed(2))) } USD\n\n`;
    };

    console.log(`김프 가격 출력 ${ new Date() }`);
    return(returnString.trim());
}

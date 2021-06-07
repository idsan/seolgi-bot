import axios from 'axios';
import { Miner } from '../../models/Miner'

let numberWithCommas = (x: string) => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

class MinerStats {
  unconfirmed?: number;
  estimatedDailyEarnings: number;
  estimatedWeeklyEarnings: number;
  estimatedMonthlyEarnings: number;

  constructor(public unpaid: number, public coinsPerMin: number, public currentHashrate: number, public averageHashrate: number, public reportedHashrate: number, public validShares: number, public staleShares: number, public invalidShares: number) {
    this.unpaid = unpaid * 1e-18;
    this.coinsPerMin = coinsPerMin;
    this.estimatedDailyEarnings = coinsPerMin * 60 * 24;
    this.estimatedWeeklyEarnings = this.estimatedDailyEarnings * 7
    this.estimatedMonthlyEarnings = this.estimatedDailyEarnings * 30
    this.currentHashrate = currentHashrate * 1e-6;
    this.averageHashrate = averageHashrate * 1e-6;
    this.reportedHashrate = reportedHashrate * 1e-6;
    this.validShares = validShares;
    this.staleShares = staleShares;
    this.invalidShares = invalidShares;
  }

  getAllSharesCount() {
    return this.validShares + this.staleShares + this.invalidShares;
  }

  getValidSharesPercentage() {
    return Math.floor(this.validShares / this.getAllSharesCount() * 100);
  }

  getStaleSharesPercentage() {
    return Math.floor(this.staleShares / this.getAllSharesCount() * 100);
  }

  getInvalidSharesPercentage() {
    return Math.floor(this.invalidShares / this.getAllSharesCount() * 100);
  }
}

export class Ethermine {
  async getMinerStats(userId: number) {
    let miner = await Miner.findOne({ userId: userId });

    if (miner === null) {
      return 'no';
    }
    
    let { walletAddress, symbol } = miner;

    if (!(walletAddress.length === 42 && walletAddress.slice(0, 2) === '0x')) {
      return 'Invalid address';
    }

    let ethermineAPIURI: string;

    if (symbol === 'ETH') {
      ethermineAPIURI = `https://api.ethermine.org/miner/${ walletAddress.slice(2) }/currentStats`;
    } else {
      ethermineAPIURI = `https://api-etc.ethermine.org/miner/${ walletAddress.slice(2) }/currentStats`;
    }

    console.log(ethermineAPIURI);

    let minerStats;
    let upbitTicker;

    try {
      minerStats = await axios.get(ethermineAPIURI, { timeout: 10000 });
      upbitTicker = await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${ symbol }`, { timeout: 10000 });
    } catch (err) {
      return err.message;
    }

    if (minerStats.data.status === 'ERROR') {
      return minerStats.data.error;
    }

    const { unpaid, coinsPerMin, currentHashrate, averageHashrate, reportedHashrate, validShares, staleShares, invalidShares, unconfirmed } = minerStats.data.data;

    const ms = new MinerStats(unpaid, coinsPerMin, currentHashrate, averageHashrate, reportedHashrate, validShares, staleShares, invalidShares);

    if (unconfirmed !== null) {
      ms.unconfirmed = unconfirmed * 1e-18;
    }
    const tradePrice = upbitTicker.data[0].trade_price;
    // console.log(ms);

    return `
[ WalletAddress ]
${ walletAddress }
${ (ms.unconfirmed !== undefined) ? `
○ Immature Balance
${ (ms.unconfirmed)?.toFixed(5) } ${ symbol } / ${ numberWithCommas((ms.unconfirmed * tradePrice).toFixed(0)) } KRW` : ``}

○ Unpaid Balance
${ (ms.unpaid).toFixed(5) } ${ symbol } / ${ numberWithCommas((ms.unpaid * tradePrice).toFixed(0)) } KRW

○ Estimated Earnings
(Daily)
${ (ms.estimatedDailyEarnings).toFixed(5) } ${ symbol } / ${ numberWithCommas((ms.estimatedDailyEarnings * tradePrice).toFixed(0)) } KRW
(Weekly)
${ (ms.estimatedWeeklyEarnings).toFixed(5) } ${ symbol } / ${ numberWithCommas((ms.estimatedWeeklyEarnings * tradePrice).toFixed(0)) } KRW
(Monthly)
${ (ms.estimatedMonthlyEarnings).toFixed(5) } ${ symbol } / ${ numberWithCommas((ms.estimatedMonthlyEarnings * tradePrice).toFixed(0)) } KRW

○ Hashrate (MH/s)
Current ${ (ms.currentHashrate).toFixed(1) }
Average ${ (ms.averageHashrate).toFixed(1) }
Reported ${ (ms.reportedHashrate).toFixed(1) }

○ Shares
Valid ${ ms.validShares } ${ (ms.getValidSharesPercentage() !== 0) ? `(${ ms.getValidSharesPercentage() } %)`: '' }
Stale ${ ms.staleShares } ${ (ms.getStaleSharesPercentage() !== 0) ? `(${ ms.getStaleSharesPercentage() } %)`: '' }
Invalid ${ ms.invalidShares } ${ (ms.getInvalidSharesPercentage() !== 0) ? `(${ ms.getInvalidSharesPercentage() } %)`: '' }
`;
  }

  async setMinerInfo(uid: number, symbol: string, walletAddress: string) {
    let miningUser = await Miner.findOne({ userId: uid });

    // 등록 된 정보가 없으면 CREATE
    if (miningUser === null) {
      let miner = new Miner();

      miner.userId = uid;
      miner.symbol = symbol;
      miner.walletAddress = walletAddress;
  
      await miner.save();
      console.log(miner);

      return '등록 성공';
    }

    // 등록 된 정보가 있으면 UPDATE
    try {
      await Miner.updateOne({ userId: miningUser.userId }, { $set: { symbol: symbol, walletAddress: walletAddress } });
    } catch (err) {
      throw err;
    }
  }
}
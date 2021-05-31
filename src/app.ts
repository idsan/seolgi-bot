import { Context, Telegraf } from 'telegraf';
import axios from 'axios';
import mongoose from "mongoose";
import bluebird from "bluebird";
import { kimp } from './middleware/Cryptocurrency';
import { Ethermine } from './middleware/Cryptocurrency/Ethermine'
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN');
const ethermine = new Ethermine();
// Connect to MongoDB
const mongoUrl: string = process.env["MONGODB_URI"]!;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
    () => { console.log('DB Connected!') },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
});

bot.hears('설기야', (ctx) => ctx.reply(`멍멍!!`));

// Cryptocurrency 관련
bot.command('kimp', async (ctx) => {
    let chat = await ctx.reply('데이터를 불러오는 중입니다. 잠시만 기다려 주세요.');    
    bot.telegram.editMessageText(chat.chat.id, chat.message_id, undefined, await kimp());
});

// 채굴 상태 보기 (본인)
bot.command('minerstats', async (ctx) => {
    let result = await ethermine.getMinerStats(ctx.message.from.id);
    ctx.reply(result);
});


// 채굴자 정보 보기 (본인)
bot.command('minerinfo', async (ctx) => {
    let miningUser = null;
    try {
        miningUser = await ethermine.getMinerInfo(ctx.message.from.id);
    } catch (err) {
        console.error(err);
    }

    if (miningUser === null) {
        ctx.reply('등록 된 정보가 없습니다. 지갑주소를 등록해주세요.');
        return;
    }

    ctx.reply(`
${ ctx.message.from.first_name }님의 정보입니다.

[ Symbol ]
${ miningUser.symbol }

[ WalletAddress ]
${ miningUser.walletAddress }
`);
});

// 채굴자 정보 등록 (본인)
bot.command('setminerinfo', async (ctx) => {
    let uid = ctx.message.from.id;
    let tokens = ctx.message.text.split(' ');

    if (tokens.length !== 3) {
        ctx.reply('명령어를 올바르게 입력하세요.');
        return;
    }

    let symbol = tokens[1].toUpperCase();
    let walletAddress = tokens[2];

    if (!(symbol === 'ETH' || symbol === 'ETC')) {
        ctx.reply('지원하지 않는 코인입니다.');
        return;
    }

    try {
        await ethermine.setMinerInfo(uid, symbol, walletAddress);
        ctx.reply('수정 성공');
    } catch (err) {
        console.error(err)
        ctx.reply('수정 실패');
    }
});

bot.launch();
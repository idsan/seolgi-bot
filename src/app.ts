import { Context, Telegraf } from 'telegraf';
import axios from 'axios';
import { kimp } from './middleware/Cryptocurrency';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN');

bot.hears('설기야', (ctx) => ctx.reply(`멍멍!`));

// Cryptocurrency 관련
bot.command('kimp', async (ctx) => ctx.reply(await kimp()));

bot.launch();
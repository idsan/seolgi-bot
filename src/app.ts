import { Context, Telegraf } from 'telegraf';
import axios from 'axios';
import mongoose from "mongoose";
import bluebird from "bluebird";
import { kimp } from './middleware/Cryptocurrency';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN');

// Connect to MongoDB
const mongoUrl: string = process.env["MONGODB_URI"]!;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
    () => { console.log('DB Connected!') },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
});

bot.hears('설기야', (ctx) => ctx.reply(`멍멍!`));

// Cryptocurrency 관련
bot.command('kimp', async (ctx) => ctx.reply(await kimp()));

bot.launch();
import { Context, Telegraf } from "telegraf";
import axios from "axios";
import "dotenv/config";

const bot = new Telegraf(process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN");

const DVR_HOSTNAME = process.env.DVR_HOSTNAME;
const DVR_PORT = process.env.DVR_PORT;
const BASE_API_URL = `http://${DVR_HOSTNAME}:${DVR_PORT}/api`;

bot.hears("설기야", (ctx) => ctx.reply(`멍멍!!`));

bot.command("recoded", async (ctx) => {
  const LIMIT = 7;
  let currentPage = 1;
  const recorded = await axios.get(
    `${BASE_API_URL}/recorded?isHalfWidth=false&offset=${
      (currentPage - 1) * LIMIT
    }&limit=${LIMIT}`
  );
  const totalPage = Math.floor(recorded.data.total / 10) + 1;
  let recordedList = new Array();

  for (let i: number = 0; i < recorded.data.records.length; i++) {
    const id = recorded.data.records[i].id;
    const name = recorded.data.records[i].name;
    recordedList.push([{ text: name, url: `${BASE_API_URL}/videos/${id}` }]);
  }

  recordedList.push([
    { text: "다음", callback_data: "next" },
    { text: "이전", callback_data: "prev" },
  ]);
  recordedList.push([
    { text: "메시지 지우기", callback_data: "removeMessage" },
  ]);

  console.log(recordedList[0]);
  ctx.reply(`녹화목록 [ ${currentPage} / ${totalPage} ]`, {
    reply_markup: {
      inline_keyboard: recordedList,
    },
  });
});

bot.launch();

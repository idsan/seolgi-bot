import { Context, Telegraf } from "telegraf";
import { DateTime } from "luxon";
import axios from "axios";
import "dotenv/config";

const bot = new Telegraf(process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN");

const DVR_HOSTNAME = process.env.DVR_HOSTNAME;
const DVR_PORT = process.env.DVR_PORT;
const BASE_API_URL = `http://${DVR_HOSTNAME}:${DVR_PORT}/api`;

bot.hears("설기야", (ctx) => ctx.reply(`멍멍!!`));

// TODO: 개별모듈로 만들기
bot.command("recorded", async (ctx) => {
  const MAX_DISPLAY_COUNT = 4;
  let currentPage = 1;
  const recorded = await axios.get(
    `${BASE_API_URL}/recorded?isHalfWidth=true&offset=${
      (currentPage - 1) * MAX_DISPLAY_COUNT
    }&limit=${MAX_DISPLAY_COUNT}`
  );

  const totalPage = Math.floor(recorded.data.total / MAX_DISPLAY_COUNT) + 1;

  let message = "녹화목록\n\n";
  for (let i: number = 0; i < recorded.data.records.length; i++) {
    const { id, name, startAt, endAt, isRecording } = recorded.data.records[i];
    const dtStartAt = DateTime.fromMillis(startAt);
    const dtEndAt = DateTime.fromMillis(endAt);
    const formatedStartAt = dtStartAt
      .setLocale("ja-jp")
      .toFormat("LL/dd(ccccc) HH:mm")!;
    const formatedEndAt = dtEndAt.setLocale("ja-jp").toFormat("HH:mm")!;
    const diffMinutes = dtEndAt.diff(dtStartAt, "minutes").toFormat("mm");

    message = message.concat(`<b>${isRecording ? "[🔴녹화중]" : ""}${name}</b>\n`);
    message = message.concat(
      `${formatedStartAt} ~ ${formatedEndAt} (${diffMinutes} m)\n`
    );
    // TODO: RAW뿐만아니라 스트리밍도 추가하기
    message = message.concat(
      `<a href="${BASE_API_URL}/videos/${id}">RAW</a>\n\n`
    );
  }
  message = message.concat(`${currentPage} / ${totalPage} page`);

  ctx.replyWithHTML(message, {
    reply_markup: {
      inline_keyboard: [
        [
          // TODO: 페이징 처리 추가
          { text: "이전", callback_data: "prev" },
          { text: "다음", callback_data: "next" },
        ],
        // TODO: 메세지 지우기 추가
        [{ text: "메시지 지우기", callback_data: "removeMessage" }],
      ],
    },
  });
});

// TODO: 녹화목록 불러오기 추가
bot.command("reserves", (ctx) => ctx.reply(`으르렁!!`));

// TODO: 방송국 목록 불러오기(epg 목록불러오기) 추가
bot.command("channels", (ctx) => ctx.reply(`왈왈!!`))

bot.launch();

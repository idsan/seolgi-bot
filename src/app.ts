import { Telegraf } from "telegraf";
import SeolgiTV from "./middleware/SeolgiTV";
import fs from "fs/promises";
import "dotenv/config";

(async () => {
  const bot = new Telegraf(process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN");

  const seolgiTv: SeolgiTV = await SeolgiTV.build();

  let whiteList: any;

  try {
    const data = await fs.readFile("./whiteList.json", { encoding: "utf8" });
    whiteList = JSON.parse(data).data;
  } catch (err) {
    console.error(err);
  }

  bot.hears("설기야", (ctx) => ctx.reply(`멍멍!!`));

  // 녹화목록 불러오기
  bot.command("recorded", async (ctx) => {
    // TODO: 화이트리스트 미들웨어화
    if (whiteList.find((item: any) => item.id === ctx.from.id || item.id === ctx.chat.id)) {
      await seolgiTv.recorded(ctx, 1);
    } else {
      await ctx.reply("권한이 없습니다.");
    }
  });

  // 녹화목록 불러오기(페이지 지정)
  bot.action(/^\/recorded page \d*$/, async (ctx) => {
    const page = ctx.match.input.split(" ")[2];
    // TODO: 화이트리스트 미들웨어화
    if (whiteList.find((item: any) => item.id === ctx.from!.id || item.id === ctx.chat!.id)) {
      await seolgiTv.recorded(ctx, parseInt(page));
    } else {
      await ctx.reply("권한이 없습니다.");
    }
  });

  // 예약목록 불러오기
  bot.command("reserves", async (ctx) => {
    // TODO: 화이트리스트 미들웨어화
    if (whiteList.find((item: any) => item.id === ctx.from.id || item.id === ctx.chat.id)) {
      await seolgiTv.reserves(ctx, 1);
    } else {
      await ctx.reply("권한이 없습니다.");
    }
  });

  // 예약목록 불러오기(페이지 지정)
  bot.action(/^\/recorded page \d*$/, async (ctx) => {
    const page = ctx.match.input.split(" ")[2];
    // TODO: 화이트리스트 미들웨어화
    if (whiteList.find((item: any) => item.id === ctx.from!.id || item.id === ctx.chat!.id)) {
      await seolgiTv.reserves(ctx, parseInt(page));
    } else {
      await ctx.reply("권한이 없습니다.");
    }
  });

  // TODO: 방송국 목록 불러오기(epg 목록불러오기) 추가
  bot.command("channels", (ctx) => ctx.reply(`왈왈!!`));

  // 메시지 지우기
  bot.action("delmsg", async (ctx) => {
    try {
      await ctx.deleteMessage();
    } catch (e: any) {
      console.error(e.response.description);
    }
  });

  bot.launch();
})();

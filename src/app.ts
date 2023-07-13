import { Telegraf } from "telegraf";
import SeolgiTV from "./middleware/SeolgiTV";
import "dotenv/config";

(async () => {
  const bot = new Telegraf(process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN");

  const seolgiTv: SeolgiTV = await SeolgiTV.build();

  bot.hears("설기야", (ctx) => ctx.reply(`멍멍!!`));

  // 녹화목록 불러오기
  bot.command("recorded", async (ctx) => {
    await seolgiTv.recorded(ctx, 1);
  });

  // 녹화목록 불러오기(페이지 지정)
  bot.action(/^\/recorded page \d*$/, async (ctx) => {
    const page = ctx.match.input.split(" ")[2];
    await seolgiTv.recorded(ctx, parseInt(page));
  });

  // TODO: 예약목록 불러오기 추가
  bot.command("reserves", (ctx) => ctx.reply(`으르렁!!`));

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

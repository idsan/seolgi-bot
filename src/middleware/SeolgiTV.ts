import axios from "axios";
import { SeolgiTVConstants } from "../constants";
import "dotenv/config";
import { Context } from "telegraf";
import { DateTime } from "luxon";

const BASE_API_URL = process.env.BASE_API_URL;

export default class SeolgiTV {
  /** 채널정보 저장용 */
  private channels: Map<number, string> = new Map();

  public static async build(): Promise<SeolgiTV> {
    const seolgiTv = new SeolgiTV();
    await seolgiTv.fetchChannelInfo();
    return seolgiTv;
  }

  /**
   * API로 부터 채널정보를 불러오는 메소드
   */
  private async fetchChannelInfo() {
    console.log("채널정보를 불러오는 중...");

    try {
      const channels: [] = (await axios.get(`${BASE_API_URL}/channels`)).data;
      channels.forEach((e) => {
        const { id, halfWidthName } = e;
        this.channels.set(id, halfWidthName);
      });
      console.log("채널정보 불러오기 성공");
    } catch (e) {
      console.error("채널정보 불러오기 실패");
    }
  }

  /**
   * 채널명을 반환함
   *
   * @param channelId - 채널ID
   * @returns 채널명
   */
  public getChannelName(channelId: number): string {
    return this.channels.get(channelId) || "불명";
  }

  /**
   * 녹화목록을 출력함
   *
   * @param ctx - Context
   * @param currentPage - 대상 페이지
   */
  public async recorded(ctx: Context, currentPage: number) {
    if (currentPage < 1) {
      return;
    }

    const { MAX_DISPLAY_COUNT, DEFAULT_LOCALE } = SeolgiTVConstants;

    // 해당 페이지의 녹화 목록 불러오기
    const recorded = await axios.get(
      `${process.env.BASE_API_URL}/recorded?isHalfWidth=true&offset=${
        (currentPage - 1) * MAX_DISPLAY_COUNT
      }&limit=${MAX_DISPLAY_COUNT}`
    );
    const totalPage = Math.floor(recorded.data.total / MAX_DISPLAY_COUNT) + 1;
    if (currentPage > totalPage) {
      return;
    }

    let message = "";
    for (const el of recorded.data.records) {
      const { id, name, startAt, endAt } = el;
      // 방송시작일시
      const dtStartAt = DateTime.fromMillis(startAt);
      // 방송종료일시
      const dtEndAt = DateTime.fromMillis(endAt);
      const formatedStartAt = dtStartAt
        .setLocale(DEFAULT_LOCALE)
        .toFormat("LL/dd(ccccc) HH:mm")!;
      const formatedEndAt = dtEndAt.setLocale(DEFAULT_LOCALE).toFormat("HH:mm")!;
      const diffMinutes = dtEndAt.diff(dtStartAt, "minutes").toFormat("mm");

      message = message.concat(
        `<b>${name}</b>\n`
      );
      message = message.concat(
        `${formatedStartAt} ~ ${formatedEndAt} (${diffMinutes} m)\n`
      );
      message = message.concat(
        `<a href="${BASE_API_URL}/videos/${id}">RAW</a>\n\n`
      );
    }
    message = message.concat(`${currentPage} / ${totalPage} page`);

    if (!ctx.callbackQuery) {
      await ctx.reply(message || "메세지없음", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "이전",
                callback_data: `/recorded page ${currentPage - 1}`,
              },
              {
                text: "다음",
                callback_data: `/recorded page ${currentPage + 1}`,
              },
            ],
            [{ text: "메시지 지우기", callback_data: "delmsg" }],
          ],
        },
        parse_mode: "HTML",
      });
    } else {
      await ctx.editMessageText(message || "메세지없음", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "이전",
                callback_data: `/recorded page ${currentPage - 1}`,
              },
              {
                text: "다음",
                callback_data: `/recorded page ${currentPage + 1}`,
              },
            ],
            [{ text: "메시지 지우기", callback_data: "delmsg" }],
          ],
        },
        parse_mode: "HTML",
      });
    }
  }
}

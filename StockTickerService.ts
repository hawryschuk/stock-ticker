import { Util } from "@hawryschuk-common/util";
import { BaseService, Prompt, ServiceCenterClient, Terminal } from "@hawryschuk-terminal-restapi";
import { StockTicker, GamePlay, Trade } from "./StockTicker";

/** Stock-Ticker : spot prices, player assets */
export class StockTickerService<T = any> extends BaseService {
    static override USERS = '*' as '*';
    static override NAME = 'Stock Ticker';
    static override ALL_SERVICE_MESSAGES_BROADCASTED = true;
    static override CAN_RECONSTRUCT_STATE_FROM_SERVICE_MESSAGES = true;

    async start() {
        while (true) {
            const instance = Util.findWhere(ServiceCenterClient.getInstance<GamePlay>(this.terminals[0]).ServiceInstances, { id: this.id });
            const { game, trades } = (await Util.waitUntil(async () => Util.safelyAsync(async () => {
                const game = new StockTicker(this.table.sitting.map(t => t.input.Name), instance!.messages);
                const trades = game.trades = JSON.parse(await this.prompt({
                    terminal: this.terminals[game.turn - 1],
                    name: 'trades',
                    type: 'text',
                    clobber: true,
                }));
                return { game, trades };
            }))!);
            const { roll } = game; game.roll = roll;
            const { turn, winners } = game;
            await this.broadcast<GamePlay>({ trades, roll });
            await this.broadcast<GamePlay>({ turn });
            if (winners)
                return {
                    winners: this.terminals.filter((t, index) => winners.includes(index)),
                    losers: this.terminals.filter((t, index) => !winners.includes(index)),
                };
        }
    }

}

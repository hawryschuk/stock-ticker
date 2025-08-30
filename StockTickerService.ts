import { Util } from "@hawryschuk-common/util";
import { BaseService, Prompt, ServiceCenterClient, Terminal } from "@hawryschuk-terminal-restapi";
import { StockTicker, GamePlay, Trade } from "./StockTicker";

/** Stock-Ticker : spot prices, player assets */
export class StockTickerService extends BaseService {
    static override USERS = '*' as '*';
    static override NAME = 'Stock Ticker';
    static override ALL_SERVICE_MESSAGES_BROADCASTED = true;
    static override CAN_RECONSTRUCT_STATE_FROM_SERVICE_MESSAGES = true;

    async start() {
        while (true) {
            const { trades, roll, turn, winners } = (await Util.waitUntil(async () => {
                const { ServiceMessages } = ServiceCenterClient.getInstance<GamePlay>(this.terminals[0]);               // all information for this service is public , zero private information
                const game = new StockTicker(this.table.sitting.map(t => t.input.Name), ServiceMessages);
                const { roll } = game;
                const trades = await (async () => {
                    try {
                        return game.trades = JSON.parse(await this.prompt({
                            terminal: this.terminals[game.turn - 1],
                            name: 'trades',
                            type: 'text',
                            clobber: true,
                        })) as Trade[];
                    } catch (e) { return undefined; }
                })();
                game.roll = roll;
                const { turn, winners } = game;
                return { trades, roll, turn, winners }
            }))!;

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

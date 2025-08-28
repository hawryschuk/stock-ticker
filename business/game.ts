// https://magisterrex.files.wordpress.com/2014/07/stocktickerrules.pdf

import { Util } from "@hawryschuk-common/util";
import { BaseService, Table, ServiceCenterClient, Messaging } from "@hawryschuk-terminal-restapi";

// export const MOVEMENTS = [10, 20, 30, -10, -20, -30] as const;
export type Movement = typeof StockTicker['MOVEMENTS'][number];

// export const COMMODITIES = ['oil', 'bonds', 'gold', 'silver', 'grain', 'industrial'] as const;
export type Stock = typeof StockTicker['STOCKS'][number];

// export const DIVIDENDS = [0, 10, 20, 30, 40, 50] as const;
export type Dividend = typeof StockTicker['DIVIDENDS'][number];

export type TradeType = typeof StockTicker['TRADE_TYPES'][number];

export type Roll = {
    stock: Stock;
    movement: Movement;
    dividend: Dividend;
};

export type Trade = {
    type: TradeType;
    stock: Stock;
    shares: number;
};

export type GamePlay = {
    turn: number;
    trades: StockTicker['trades'];
    roll: Roll;
}

export class Player {
    cash = 5000;
    stocks: Record<string, number> = StockTicker.STOCKS.reduce((stocks, stock) => ({ ...stocks, [stock]: 0 }), {});
    turns = 0;
    constructor(public prices: StockTicker['prices']) { }
    get worth() { return Object.entries(this.stocks).reduce((worth, [stock, shares]) => worth + shares * this.prices[stock], this.cash); }
}

/** The criteria to finish is theres been X number of turns , or Y number of rolls , or concensus to end the game */
export class StockTicker {
    static MOVEMENTS = [10, 20, 30, -10, -20, -30] as const;
    static STOCKS = ['oil', 'bonds', 'gold', 'silver', 'grain', 'industrial'] as const;
    static TRADE_TYPES = ['buy', 'sell'] as const;
    static DIVIDENDS = [0, 10, 20, 30, 40, 50] as const;

    turn = 0;
    players!: Player[];
    prices: Record<string, number> = StockTicker.STOCKS.reduce((prices, name) => ({ ...prices, [name]: 1 }), {});

    constructor(seats: number, actions: GamePlay[]) {
        this.players = new Array(seats).fill(undefined).map(() => new Player(this.prices));
        for (const { turn, trades, roll } of actions) {
            if (turn) this.turn = turn;
            if (trades) this.trades = trades;
            if (roll) this.roll = roll;
        }
    }

    get player() { return this.players[this.turn - 1] }

    set trades(trades: Trade[]) {
        for (const { type, stock, shares } of trades!) {
            if (!StockTicker.STOCKS.includes(stock)) throw new Error('invalid-stock');
            if (!StockTicker.TRADE_TYPES.includes(type)) throw new Error('invalid-trade-type');
            if (typeof shares !== 'number') throw new Error('invalid-shares');

            this.player.stocks[stock] += (type == 'buy' ? 1 : -1) * shares;
            this.player.cash += (type === 'sell' ? 1 : -1) * shares * this.prices[stock];

            if (this.player.cash < 0) throw new Error('insufficient-cash');
            if (this.player.stocks[stock] < 0) throw new Error('insufficient-stock');
        }
    }

    set roll(roll: Roll) {
        this.player.turns++;

        /** Price movement */
        this.prices[roll.stock] += roll.movement;

        /** Stock Split */
        if (this.prices[roll.stock] >= 2) {
            this.prices[roll.stock] = 1;
            for (const player of this.players)
                player.stocks[roll.stock] *= 2;
        }

        /** Stock Bankrupt */
        if (this.prices[roll.stock] <= 0) {
            this.prices[roll.stock] = 1;
            for (const player of this.players)
                player.stocks[roll.stock] = 0;
        }

        /** Dividend */
        if (this.prices[roll.stock] >= 1)
            for (const player of this.players)
                player.cash += roll.dividend * Math.floor(player.stocks[roll.stock] / 1000);
    }

    get roll() {
        return {
            stock: Util.randomElement(StockTicker.STOCKS as any),
            movement: Util.randomElement(StockTicker.MOVEMENTS as any),
            dividend: Util.randomElement(StockTicker.DIVIDENDS as any),
        }
    }

    get winners(): number[] | undefined {
        return this.players.every(p => p.turns >= 2)
            ? (() => {
                const players = this
                    .players
                    .sort((a, b) => b.worth - a.worth);
                const [{ worth }] = players;    // highest net worth
                return Util.where(players, { worth })
                    .map(p => this.players.indexOf(p))
            })()
            : undefined;
    }
}

/** Stock-Ticker : spot prices, player assets */
export class StockTickerService extends BaseService {
    static USERS = '*' as '*';
    static NAME = 'Stock Ticker';

    constructor(table: Table<BaseService>, id = Util.UUID) { super(table, id); }

    get State() {
        return new StockTicker(
            this.table.seats,
            new ServiceCenterClient<GamePlay>(this.terminals[0]).ServiceMessages
        );
    }

    /** We allow the game to continue where it left off */
    async start() {
        while (true) {
            const { winners } = await Util.waitUntil(async () => {
                const { State } = this;
                const { roll } = State;
                const turn = State.turn = State.turn < this.terminals.length ? State.turn + 1 : 1;
                const trades = JSON.parse(await this.terminals[turn - 1].prompt({ name: 'trades', type: 'text', clobber: true }));
                Object.assign(State, { trades, roll, turn });
                await this.broadcast<GamePlay>({ trades, roll, turn });
                return State;
            });

            if (winners)
                return {
                    winners: this.terminals.filter((t, index) => winners.includes(index)),
                    losers: this.terminals.filter((t, index) => !winners.includes(index)),
                }
        }
    }

}


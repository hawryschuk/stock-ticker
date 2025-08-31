// https://magisterrex.files.wordpress.com/2014/07/stocktickerrules.pdf

import { Util } from "@hawryschuk-common/util";

export type Movement = typeof StockTicker['MOVEMENTS'][number];
export type Stock = typeof StockTicker['STOCKS'][number];
export type Dividend = typeof StockTicker['DIVIDENDS'][number];
export type TradeType = typeof StockTicker['TRADE_TYPES'][number];

export type Roll = { stock: Stock; movement: Movement; dividend: Dividend; };
export type Trade = { type: TradeType; stock: Stock; shares: number; };
export type GamePlay = { trades?: StockTicker['trades']; roll?: Roll; turn?: number; };

export class Player {
    cash = 5000;
    stocks: Record<string, number> = StockTicker.STOCKS.reduce((stocks, stock) => ({ ...stocks, [stock]: 0 }), {});
    turns = 0;
    constructor(public name: string, public prices: StockTicker['prices']) { }
    get worth() { return Object.entries(this.stocks).reduce((worth, [stock, shares]) => worth + shares * this.prices[stock], this.cash); }
}

/** The criteria to finish is theres been X number of turns , or Y number of rolls , or concensus to end the game */
export class StockTicker {
    static MOVEMENTS = [10, 20, 30, -10, -20, -30] as const;
    static STOCKS = ['oil', 'bonds', 'gold', 'silver', 'grain', 'industrial'] as const;
    static TRADE_TYPES = ['buy', 'sell'] as const;
    static DIVIDENDS = [0, 10, 20, 30, 40, 50] as const;

    turn = 1;
    players!: Player[];
    prices: Record<string, number> = StockTicker.STOCKS.reduce((prices, name) => ({ ...prices, [name]: 1 }), {});

    constructor(players: string[], actions: GamePlay[] = []) {
        if (players.length === 0) debugger;
        this.players = players.map(name => new Player(name, this.prices));
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

    rolls: Roll[] = [];
    set roll(roll: Roll) {
        /** Price movement */
        this.prices[roll.stock] += roll.movement / 100;

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

        /** Track #turns, #rolls, and move to the next player */
        this.player.turns++;
        this.rolls.push(roll);
        this.turn = 1 + this.turn % this.players.length;
    }

    get roll() {
        return {
            stock: Util.randomElement(StockTicker.STOCKS as any),
            movement: Util.randomElement(StockTicker.MOVEMENTS as any),
            dividend: Util.randomElement(StockTicker.DIVIDENDS as any),
        }
    }

    get winners(): number[] | undefined {
        return this.players.every(p => p.turns >= 5)
            ? (() => {
                const players = [...this.players].sort((a, b) => b.worth - a.worth);
                const [{ worth }] = players;    // highest net worth
                const indexes = Util
                    .where(players, { worth })
                    .map(p => this.players.indexOf(p));
                return indexes;
            })()
            : undefined;
    }
}



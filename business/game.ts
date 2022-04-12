import { Player } from "./player";
import { Commodity } from "./commodity";
import { Util } from "./util";
// import { table } from 'table';
import { Table } from 'c:/Users/owner/Documents/@hawryschuk-terminal-restapi/Table';
import { Terminal } from 'c:/Users/owner/Documents/@hawryschuk-terminal-restapi/Terminal';


/** In the game, all a player can do is  */
export class Game {
    table: Table;
    players: Player[];
    turn: Player;
    commodities: { [name: string]: Commodity } = ['oil', 'bonds', 'gold', 'silver', 'grain', 'industrial'].reduce((commodities, name) => ({ ...commodities, [name]: new Commodity(name) }), {});
    canTrade = true;    // Once the user rolls the dice, they cannot trade
    constructor({ table } = {} as { table: Table }) {
        this.table = table;
        this.players = table.terminals.map(terminal => new Player(terminal, this));
        this.turn = this.players[0];
    }

    /** FEAT: Trade something */
    trade(action: 'buy' | 'sell', commodity: Commodity, units: number) {
        if (this.canTrade) {
            this.turn.trade(action, commodity, units);
        } else {
            throw new Error('TradeNowAllowed');
        }
    }

    history: {
        amount: number;
        direction: 'up' | 'down' | 'dividend';
        commodity: Commodity
    }[] = [];

    rolled = {
        amount: 0,
        direction: undefined as 'up' | 'down' | 'dividend',
        commodity: undefined as Commodity
    };

    /** FEAT: RollDice */
    roll({
        amount = Util.random([5, 10, 20]),
        direction = Util.random(['up', 'down', 'dividend']),
        commodity = Util.random(Object.values(this.commodities)),
    } = {}) {
        /** RULE: Once you start rolling you cannot trade */
        this.canTrade = false;

        Object.assign(this.rolled, { amount, direction, commodity });
        this.history.push({ ...this.rolled });

        console.log({ amount, direction, commodity });

        if (/up|down/.test(direction)) {
            commodity.price += amount / 100 * (direction === 'up' ? 1 : -1);

            /** FEAT: Bankpruptcy */
            if (commodity.price <= 0) {
                for (const p of this.players) {
                    p.assets[commodity.name] = 0;
                }
                commodity.price = 1;
            }

            /** FEAT: StockSplit */
            if (commodity.price >= 2) {
                for (const p of this.players) {
                    p.assets[commodity.name] *= 2;
                }
                commodity.price = 1;
            }
        } else if (commodity.price >= 1) {
            /** FEAT: Dividend */
            for (const { assets } of this.players) {
                const dividend = assets[commodity.name] * amount / 100;
                assets[commodity.name] += dividend;
            }
        }

        /** FEAT: Next Player */
        if (direction === 'down') {
            this.turn = this.players[this.players.indexOf(this.turn) + 1] || this.players[0];
            this.canTrade = true;
        }
    }

    /** ASCII Table */
    toString() {
        const data = [
            ['Last Roll', '-Commodity-', '-What-', '-Amount-'],
            this.rolled.commodity ? ['', this.rolled.commodity.name, this.rolled.direction, this.rolled.amount] : [],
            ['Turn', this.turn.name],
            ['Commodities', 'Name', 'Price'],
            ...Object.values(this.commodities).map(c => ['', c.name, c.price]),
            ['Players', 'Name', 'Net Worth', 'Cash', ...Object.keys(this.commodities)],
            ...this.players.map(player => {
                const { name, worth, cash, assets } = player;
                return [this.turn === player ? '*' : '', name, worth, cash, ...Object.keys(this.commodities).map(name => assets[name])];
            })
        ];
        const maxColumns = Math.max(...data.map(row => row.length));
        for (const row of data) {
            while (row.length < maxColumns) {
                row.push('');
            }
        }
        if (0) {/** Put history in column maxColumn */
            for (let i = data.length; i < this.history.length; i++) { data[i] = new Array(maxColumns).fill(''); }
            for (const row of data) { for (let index = maxColumns; index < maxColumns + 3; index++) { row[index] = '_'; } }
            for (let i = 0; i < this.history.length; i++) {
                const { commodity, direction, amount } = this.history.reverse()[i];
                data[i].splice(maxColumns, 3, commodity.name, direction, amount);
            }
        }
        return table(data);
    }

    JSON() {
        return JSON.stringify({
            'Turn': this.turn.name,
            'Spot Prices': this.commodities,
            'Net Worths': this.players.map(player => ({
                name: player.name,
                cash: player.cash,
                commodities: player.assets,
                worth: player.worth
            }))
        }, null, 2);
    }

    /** Play the game through prompts and stdout */
    static async play({
        numPlayers = undefined as number,
        stdout = console.log as Function,
        prompt = undefined as (options: Prompt | Prompt[]) => any,
    }) {
        numPlayers = numPlayers || parseInt((await prompt({
            type: 'number',
            name: 'numPlayers',
            message: 'How many players?',
            min: 2,
            initial: 2,
        })).numPlayers);
        const players: string[] = await prompt(new Array(numPlayers).fill(0).map((_, index) => {
            return {
                type: 'text',
                name: `${index}`,
                message: `What is Player #${index + 1}'s name?`
            };
        }))
            .then((players: any) => new Array(numPlayers).fill(0).map((_, index) => {
                return players[index]
            }));

        const game = new Game(players);
        while (1) {
            stdout(game.toString());
            let amount = 1, makeTrade = true;
            while (makeTrade && amount && game.canTrade) {/** Make a trade */
                stdout(game.toString());
                makeTrade = (await prompt({
                    type: 'confirm',
                    name: 'makeTrade',
                    message: `${game.turn.name}, it is your turn. Would you like to buy/sell any commodities?`,
                    initial: true
                })).makeTrade;
                if (makeTrade) {
                    let sell = false;
                    let { commodity } = await prompt({
                        type: 'select',
                        name: 'commodity',
                        message: 'Which commodity would you like to buy/sell',
                        choices: Object.values(game.commodities).map(commodity => {
                            const { name, price } = commodity;
                            const shares = game.turn.assets[name];
                            return {
                                value: commodity,
                                title: name,
                                description: `Market Price: ${price}.
                                                You own @ ${shares} shares
                                                -- a market value of (${price * shares}$).
                                        `,
                            };
                        })
                    });
                    const owns = game.turn.assets[commodity.name];
                    if (owns) {
                        let { sell } = await prompt({
                            type: 'confirm',
                            name: 'sell',
                            message: `Would you like to sell any of your ${owns} shares?`,
                        });
                        if (sell) {
                            amount = await prompt({
                                type: 'number',
                                name: 'amount',
                                initial: 0,
                                max: owns,
                                min: 0,
                                message: `How many of your ${owns} shares would you like to sell?`,
                            }).then(_ => _.amount);
                            if (amount) {
                                game.turn.trade('sell', commodity, amount);
                            }
                        }
                    }

                    if (!sell) {
                        amount = await prompt({
                            type: 'number',
                            name: 'amount',
                            initial: 0,
                            max: Math.floor(game.turn.cash / commodity.price),
                            min: 0,
                            message: `How many shares would you like to buy?`,
                        }).then(_ => _.amount);
                        if (amount) {
                            game.turn.trade('buy', commodity, amount);
                        }
                    }
                }
            }
            {/** Roll the dice */
                await prompt({
                    type: 'text',
                    name: 'any',
                    message: `Press any key to roll the dice`,
                });
                game.roll();
            }
        }
    }
}

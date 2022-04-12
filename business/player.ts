import { Game } from "./game";
import { Commodity } from "./commodity";
import { Terminal } from 'c:/Users/owner/Documents/@hawryschuk-terminal-restapi/Terminal';

export class Player {
    cash = 5000;
    get name() { return this.terminal.input.name }
    constructor(public terminal: Terminal, public game: Game) { }
    assets: { [name: string]: number; } = Object.values(this.game.commodities).reduce((assets, commodity) => ({ ...assets, [commodity.name]: 0 }), {});
    units(commodity: Commodity) { return this.assets[commodity.name] || 0; }
    trade(action: 'buy' | 'sell', commodity: Commodity, units: number) {
        const { price } = commodity;
        const cost = (action === 'buy' ? 1 : -1) * units * price;
        if (cost > this.cash) throw new Error('InsufficientFunds: ' + JSON.stringify({ cost, price }));
        this.cash -= cost;
        this.assets[commodity.name] += units * (action === 'buy' ? 1 : -1);
    }
    get worth() {
        return Object.keys(this.assets).reduce(
            (cash, asset) => {
                return cash + this.assets[asset] * this.game.commodities[asset].price;
            },
            this.cash
        );
    }
}

import { StockTickerService } from "./game";
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Util } from './util';
import { Seat, Terminal } from "@hawryschuk-terminal-restapi";
describe('Stock Ticker: The Game', () => {
    let game: StockTickerService;
    it('is constructed with the names of the players', () => {
        game = new StockTickerService(
            ['alex', 'liujing']
                .map(name => new Seat(new Terminal({
                    history: [{
                        time: Date.now(),
                        type: 'prompt',
                        options: {
                            name: 'name',
                            type: 'text',
                            resolved: name
                        }
                    }]
                }))));
    });
    it('indicates whose turn it is', () => {
        expect(game.turn).to.equal(game.players[0]);
    });
    it('allows players to buy/sell commodities', () => {
        game.turn.trade('buy', game.commodities.oil, 1000);
        expect(game.turn.assets.oil).to.equal(1000);
    });
    it('the turn changes when the player rolls a down die', () => {
        game.roll({ amount: 5, direction: 'down', commodity: game.commodities.oil });
        expect(game.turn).to.equal(game.players[1]);
    });
    it('allows the player to roll the dice', () => {

    });

    // it.skip('x', () => {
    //     /** Lets make a whole bunch of random trades */
    //     for (let i of new Array(5)) {
    //         const amount = Util.random([100, 250, 500, 750, 1000]);
    //         const action = 'buy';
    //         const direction = Util.random(['up', 'down', 'dividend']);
    //         const commodity = Util.random(Object.values(game.commodities));
    //         try {
    //             game.turn.trade(action, commodity, amount);
    //             console.log({ turn: game.turn.name, action, commodity, amount });
    //             console.log(game.toString());
    //             process.exit();
    //         } catch (e) {
    //             console.log(e.message);
    //         }
    //     }
    // });

    it.skip('allows the user to roll the dice', () => {
        for (const i of new Array(100)) {
            game.roll();
        };

        /** Displa */
        console.log(game.toString())
    });
});

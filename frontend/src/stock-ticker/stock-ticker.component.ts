// https://magisterrex.files.wordpress.com/2014/07/stocktickerrules.pdf

import { Component, Input, OnInit } from '@angular/core';
import { Terminal } from '@hawryschuk-terminal-restapi';
import { StockTickerService } from '../../../business/game';

@Component({
  selector: 'app-stock-ticker',
  templateUrl: './stock-ticker.component.html',
  styleUrls: ['./stock-ticker.component.scss'],
  standalone: true
})
export class StockTickerComponent implements OnInit {

  ngOnInit(): void { }

  @Input({ required: true }) terminal!: Terminal;

  parseInt = parseInt;

  canBuy(commodity: string, units: any) { return units > 0 && this.game.turn.terminal.promptedFor({ name: 'stock-ticker-action', value: 'buy-' + commodity }) }
  canSell(commodity: string, units: any) { return units < 0 && this.game.turn.terminal.promptedFor({ name: 'stock-ticker-action', value: 'sell-' + commodity }) }

  buy(commodity: string, units: any) { this.game.turn.terminal.answer({ 'stock-ticker-action': `buy-${commodity}`, units: Math.abs(parseInt(units)) }) }
  sell(commodity: string, units: any) { this.game.turn.terminal.answer({ 'stock-ticker-action': `sell-${commodity}`, units: Math.abs(parseInt(units)) }) }

  async rollDice() {
    this.api.load({
      title: 'roll-dice',
      block: async () => await this.game.turn.terminal.answer({
        'stock-ticker-action': `roll-dice`
      })
    });
  }
}
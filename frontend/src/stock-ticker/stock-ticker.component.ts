// https://magisterrex.files.wordpress.com/2014/07/stocktickerrules.pdf

import { Component, computed, effect, input, Input, model, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { Util } from '@hawryschuk-common/util';
import { ServiceCenterClient, Terminal } from '@hawryschuk-terminal-restapi';
import { StockTicker, Trade, GamePlay } from '../../../StockTicker';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { onTerminalUpdated } from '@hawryschuk-terminal-restapi/frontend/src/app/terminal/onTerminalUpdated';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-stock-ticker',
  templateUrl: './stock-ticker.component.html',
  styleUrls: ['./stock-ticker.component.scss'],
  standalone: true,
})
export class StockTickerComponent {
  StockTicker = StockTicker;
  terminal = input.required<Terminal>();
  trades: Trade[] = StockTicker.STOCKS.map(stock => <Trade>{ type: 'buy', stock, shares: 0 });
  private updated$ = signal(new Date);

  get client() { return ServiceCenterClient.getInstance<GamePlay>(this.terminal()); }
  get game() { return this.game$() }; private game$ = computed(() => {
    const { users, messages } = this.updated$() && this.client.Service?.Instance || {};
    return users && messages ? new StockTicker(users, messages) : undefined;
  });

  constructor() {
    Object.assign(window, { stockticker: this });
    onTerminalUpdated({ component: this, handler: () => this.updated$.set(new Date), terminal: this.terminal });
  }

  async SubmitTrade() {
    await this.terminal().respond(JSON.stringify(this.trades.filter(t => t.shares)), 'trades');
    for (const trade of this.trades)
      Object.assign(trade, { shares: 0, type: 'buy' });
  }

  async testTrade(trade: Trade) {
    await Util.pause(100);
    try { this.game!.trades = this.trades; }
    catch (e) {
      alert(e);
      trade.shares = 0;
      this.trades = [...this.trades];
    }
  }

}
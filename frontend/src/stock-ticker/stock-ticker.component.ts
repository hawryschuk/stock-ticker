// https://magisterrex.files.wordpress.com/2014/07/stocktickerrules.pdf

import { Component, computed, effect, input, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Util } from '@hawryschuk-common/util';
import { ServiceCenterClient, Terminal } from '@hawryschuk-terminal-restapi';
import { StockTicker, Trade, GamePlay } from '../../../StockTicker';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-stock-ticker',
  templateUrl: './stock-ticker.component.html',
  styleUrls: ['./stock-ticker.component.scss'],
  standalone: true,
})
export class StockTickerComponent implements OnDestroy {
  private updated$ = signal<Date | undefined>(undefined);

  constructor() {
    Object.assign(window, { stockticker: this });
    effect(() => {
      this.updated$.set(new Date);
      this.ngOnDestroy = this.terminal()
        .subscribe({ handler: () => this.updated$.set(new Date) })
        .unsubscribe;
    }, { allowSignalWrites: true });
  }

  StockTicker = StockTicker;

  terminal = input.required<Terminal>();

  trades: Trade[] = StockTicker.STOCKS.map(stock => <Trade>{ type: 'buy', stock, shares: 0 });

  get client() { return this.client$(); }
  private client$ = computed(() => ServiceCenterClient.getInstance<GamePlay>(this.terminal()));

  get game() { return this.game$() }
  private game$ = computed(() => {
    const players = this.client.Service?.Instance?.users;
    return this.updated$() && players ? new StockTicker(players, this.client.ServiceMessages) : undefined;
  });

  // get Game() { return new StockTicker(this.client.Service?.Instance?.users!, this.client.ServiceMessages) }

  ngOnDestroy(): void { };

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
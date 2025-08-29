// https://magisterrex.files.wordpress.com/2014/07/stocktickerrules.pdf

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
export class StockTickerComponent implements OnInit, OnDestroy {

  @Input({ required: true }) terminal!: Terminal;

  StockTicker = StockTicker;
  game?: StockTicker;
  trades: Trade[] = StockTicker.STOCKS.map(stock => <Trade>{ type: 'buy', stock, shares: 0 });
  get client() { return ServiceCenterClient.getInstance<GamePlay>(this.terminal); }
  private get Game() { return this.client.Table ? new StockTicker(this.client.Table!.sitting, this.client.ServiceMessages) : undefined }

  ngOnDestroy(): void { };

  ngOnInit() {
    Object.assign(window, { app: this });
    this.ngOnDestroy = this.terminal
      .subscribe({ handler: () => this.game = this.Game })
      .unsubscribe;
  }

  async SubmitTrade() {
    await this.terminal.respond(JSON.stringify(this.trades.filter(t => t.shares)), 'trades');
    for (const trade of this.trades)
      Object.assign(trade, { shares: 0, type: 'buy' });
  }

  async testTrade(trade: Trade) {
    await Util.pause(100);
    try { this.Game!.trades = this.trades; }
    catch (e) {
      alert(e);
      trade.shares = 0;
      this.trades = [...this.trades];
    }
  }

}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Terminal, ServiceCenterClient, ServiceCenter, TestingServices } from '@hawryschuk-terminal-restapi';
import { TerminalComponent } from '@hawryschuk-terminal-restapi/frontend/src/terminal/terminal.component';
import { TableServiceComponent } from '@hawryschuk-terminal-restapi/frontend/src/table-service/table-service.component';
import { Util } from '@hawryschuk-common/util';
import { FormsModule, NgForm } from '@angular/forms';
import { StockTickerService, StockTicker, Trade, GamePlay } from '../../../business/game';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TerminalComponent, TableServiceComponent, FormsModule],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  terminal = new Terminal;
  client = new ServiceCenterClient(this.terminal);
  serviceCenter = new ServiceCenter().register(StockTickerService);
  ngOnInit() {
    Object.assign(window, this);
    // this.terminal.answer({ name: 'alex', service: 'Stock Ticker', menu: ['Create Table', 'Sit', 'Ready'], seats: 1 });
    this.terminal.subscribe({ handler: () => { } });
  }

  StockTicker = StockTicker;
  trades: Trade[] = [];
  trade: Trade = { stock: 'gold', shares: 1, type: 'buy' };
  defaultTrade = Util.deepClone(this.trade);

  get game() {
    const game = new StockTicker(1, new ServiceCenterClient(this.terminal).ServiceMessages as GamePlay[]);
    game.turn ||= 1;
    return game;
  }
  AddTrade(form: NgForm) {
    const trade: Trade = form.value;
    const { game } = this;
    try { game.trades = this.trades.concat(trade); }
    catch (e) { return alert(e); }
    this.trades.push(trade);
    form.reset(this.defaultTrade);
  }

  SubmitTrade() {
    this.terminal.respond(JSON.stringify(this.trades), 'trades');
    this.trades = [];
  }
}

import { Component, OnInit } from '@angular/core';
import { Terminal, ServiceCenterClient, ServiceCenter } from '@hawryschuk-terminal-restapi';
import { TerminalComponent } from '@hawryschuk-terminal-restapi/frontend/src/terminal/terminal.component';
import { ServiceCenterComponent } from '@hawryschuk-terminal-restapi/frontend/src/app/service-center/service-center.component';
import { StockTickerService } from "../../../StockTickerService";
import { StockTickerComponent } from 'src/stock-ticker/stock-ticker.component';
import { CommonModule } from '@angular/common';
import { Util } from '@hawryschuk-common/util';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TerminalComponent, ServiceCenterComponent, StockTickerComponent],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  terminal = new Terminal;
  terminals = [this.terminal];
  serviceCenter = new ServiceCenter().register(StockTickerService);
  get client() { return ServiceCenterClient.getInstance(this.terminal); }

  addTerminal() { this.terminals.push(this.terminal = new Terminal); }

  async ngOnInit() {
    Object.assign(window, { app: this });
    await this.serviceCenter.join(this.terminal);
    await this.terminal.answer({
      name: 'alex',
      service: 'Stock Ticker',
      menu: [
        'Create Table',
        'Sit',
        'Ready'
      ],
      seats: 1
    });
    await Util.waitUntil(() => this.client.Service?.Instance);

    await Util.pause(1000);
    this.addTerminal();
    await this.serviceCenter.join(this.terminal);
    const table = await Util.waitUntil(() => this.client.Tables[0]);
    await this.terminal.answer({
      name: 'liujing',
      service: 'Stock Ticker',
      menu: 'Join Table',
      table: table.id
    });
  }
}

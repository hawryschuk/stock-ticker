import { Component, OnInit } from '@angular/core';
import { Terminal, ServiceCenterClient, ServiceCenter } from '@hawryschuk-terminal-restapi';
import { TerminalComponent } from '@hawryschuk-terminal-restapi/frontend/src/terminal/terminal.component';
import { TableServiceComponent } from '@hawryschuk-terminal-restapi/frontend/src/table-service/table-service.component';
import { StockTickerService } from "../../../StockTickerService";
import { StockTickerComponent } from 'src/stock-ticker/stock-ticker.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TerminalComponent, TableServiceComponent, StockTickerComponent],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  terminal = new Terminal;
  client = new ServiceCenterClient(this.terminal);
  serviceCenter = new ServiceCenter().register(StockTickerService);

  ngOnInit() {
    Object.assign(window, { app: this });
    this.terminal.answer({ name: 'alex', service: 'Stock Ticker', menu: ['Create Table', 'Sit', 'Ready'], seats: 1 });
  }
}

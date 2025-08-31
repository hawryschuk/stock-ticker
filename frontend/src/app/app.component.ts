import { Component, OnInit } from '@angular/core';
import { Terminal, ServiceCenterClient, ServiceCenter } from '@hawryschuk-terminal-restapi';
import { ServiceCenterComponent } from '@hawryschuk-terminal-restapi/frontend/src/app/service-center/service-center.component';
import { StockTickerService } from "../../../StockTickerService";
import { StockTickerComponent } from 'src/stock-ticker/stock-ticker.component';
import { CommonModule } from '@angular/common';
import { Util } from '@hawryschuk-common/util';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ServiceCenterComponent, StockTickerComponent],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  terminal = new Terminal;
  terminals = [this.terminal];

  serviceCenter = new ServiceCenter().register(StockTickerService);
  get client() { return ServiceCenterClient.getInstance(this.terminal); }

  async ngOnInit() {
    Object.assign(window, { app: this });


    /** User: Alex : Startsd a 1 person game of stock ticker */
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

    // return;
    /** Player: Liujing : Joins Alex's table mid-way through his game */
    // await Util.pause(1000);
    this.terminals.push(this.terminal = new Terminal);
    await this.serviceCenter.join(this.terminal);
    const table = await Util.waitUntil(() => this.client.Tables[0]);
    await this.terminal.answer({
      name: 'michael',
      service: 'Stock Ticker',
      menu: 'Join Table',
      table: table.id
    });

    // return;

    /** New Player : Starts a 2 person game of stock ticker with the robot 
     * - and sends a message to alex
    */
    this.terminals.push(this.terminal = new Terminal);
    await this.serviceCenter.join(this.terminal);
    await this.terminal.answer({
      name: 'paula',
      service: 'Stock Ticker',
      menu: [
        'Create Table',
        'Sit',
        'Invite Robot',
        // 'Ready',
        // 'Direct Message',
        // 'Direct Message'
      ],
      seats: 2,
      // to: ['alex', 'michael'],
      // message: ['hi alex', 'hi michael']
      // trades: new Array(10).fill(JSON.stringify([{ type: 'buy', stock: 'silver', shares: 2 }]))
    });

  }
}

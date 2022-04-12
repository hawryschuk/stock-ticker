import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { Game, Prompt } from '@hawryschuk/games-stock.ticker/business/game';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'client';
  stdout: string;               // stdout         (Game UI as text)
  prompt: Prompt;               // stdin request  (ie; number, text, choices, confirm, etc.)
  resolve: (res: any) => void;  // stdin resolver
  set confirm(confirm: boolean) { this.resolve({ [this.prompt.name]: confirm }); }
  constructor() {
    Game.play({
      stdout: (data: any) => this.stdout = data,
      prompt: (options: any) => {
        const setPrompt = (o: any) => {
          this.prompt = o;
          return new Promise(resolve => Object.assign(this, { resolve }));
        };
        if (options instanceof Array) {
          return new Promise(async resolve => {
            const results: any = {};
            while (options.length) {
              const result = await setPrompt(options.shift());
              Object.assign(results, result);
            }
            resolve(results);
          });
        } else {
          return setPrompt(options);
        }
      },
    });
  }
}

export class Util {
    static random = (choices: any[]) => choices[Math.floor(Math.random() * choices.length)];
    static log = (data: any) => console.log(JSON.stringify(data, null, 2));
    
    static async waitUntil(pred: Function, { retries = Infinity, pause = 250, timeElapsed = Infinity } = {}) {
        const startTime = new Date().getTime();
        while (1) {
            const result = await pred();
            if (result) {
                return result;
            } else {
                retries--;
                if (retries <= 0) { throw new Error(`Util.waitUntil: timeout-retries`); }
                if ((new Date().getTime() - startTime) > timeElapsed) throw new Error('Util.waitUntil: timeout-timeElapsed')
                await this.pause(pause);
            }
        }
    }
    
    static async pause(ms: number) { await new Promise(resolve => setTimeout(resolve, ms)); }


}

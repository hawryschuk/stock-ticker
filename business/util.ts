export class Util {
    static random = (choices: any[]) => choices[Math.floor(Math.random() * choices.length)];
    static log = (data: any) => console.log(JSON.stringify(data, null, 2));
}

# Stock Ticker
> A board game about the real-time changes and activities of the market system.
> Resources: Cash
> Commodities: Industrial, Bonds, Oil, Gold, Silver

- <a href=stocktickerrules.pdf> Rules </a>
- <a href=sample> GUI Sample </a>

## Class Diagram
```plantuml
@startuml

class Game {
  +timeLimit: Duration
  +roundsPerTradeWindow: int
  +start()
  +end()
  +currentPlayer(): Player
}

class Player {
  +name: String
  +cash: Money
  +portfolio: Map<Stock,int>
  +buy(stock: Stock, shares: int)
  +sell(stock: Stock, shares: int)
  +netWorth(market: Market): Money
}

class Broker {
  +bank: Money
  +execute(trade: Trade, market: Market)
  +payDividend(stock: Stock, amountPer1000: Money, players: List<Player>)
}

class Trade {
  +player: Player
  +stock: Stock
  +shares: int
  +type: TradeType  <<BUY|SELL>>
  +priceAtExecution: Money
}

enum TradeType {
  BUY
  SELL
}

class Market {
  +board: Board
  +stocks: List<Stock>
  +applyRoll(result: Roll)
  +currentPrice(stock: Stock): Money
}

class Board {
  +indicators: Map<Stock,Indicator>
}

class Indicator {
  +price: Money    <<increments of $0.10>>
}

class Stock {
  +name: String    <<Gold, Silver, Oil, Industrial, Bonds, Grain>>
  +par: Money = $1.00
  +splitThreshold: Money = $2.00
}

class Dice {
  +roll(): Roll
}

class Roll {
  +targetStock: Stock
  +movement: int  <<+10,+20,+30,-10,-20,-30>>
  +dividend?: int <<0,10,20,30,40,50>>
}

Game "1" o-- "1" Broker
Game "1" o-- "1" Market
Game "1" o-- "1" Dice
Game "1" o-- "1" Board
Game "1" o-- "2..*" Player
Market "1" o-- "6" Stock
Board "1" o-- "6" Indicator
Trade "*" --> "1" Player
Trade "*" --> "1" Stock
Broker "1" --> "*" Trade : executes
Market "1" --> "1" Roll : applyRoll()

note right of Market
- If price >= $2.00 → split:
  * double shares held
  * reset price to par ($1.00)
- If price hits $0.00 → delist:
  * return to par on re-entry
end note
@enduml

```

## Sequence Diagram
```plantuml
@startuml

actor Player
participant "Trading Window" as TW
participant Broker
participant Market
participant Dice
participant Board

== Pre-roll Trading Window ==
Player -> TW: decide buy/sell orders
TW -> Broker: submit Trade(s)
loop for each Trade
  Broker -> Market: price = currentPrice(stock)
  Broker -> Broker: validate funds/holdings
  Broker -> Player: exchange cash ⟷ certificates @ price
end

== Broker Roll ==
Broker -> Dice: roll()
Dice --> Broker: Roll{stock, movement, dividend?}
Broker -> Market: applyRoll(Roll)

== Board Update ==
Market -> Board: move indicator(stock, movement)
Board --> Market: updated price

== Splits / Zero ==
alt price >= $2.00
  Market -> Broker: trigger split
  Broker -> Player: double shares for holders
  Market -> Board: reset price to $1.00
else price == $0.00
  Market -> Broker: remove stock, clear holdings
  Market -> Board: re-enter at $1.00 when allowed
end

== Dividends ==
opt Roll includes dividend AND price >= $1.00
  Market -> Broker: dividend per 1000 shares
  Broker -> Player: pay dividend to each holder
end

== Next Player ==
Broker -> Player: pass dice to next player
@enduml


```

## Activity Diagram
```plantuml
@startuml
[*] --> GameStart

state GameStart {
  [*] --> Setup
  Setup --> Ready : Players given cash & prices set
}

GameStart --> PlayerTurn : Start first turn

state PlayerTurn {
  [*] --> RollDice
  RollDice --> DetermineOutcome
  DetermineOutcome --> ApplyPriceChange
  ApplyPriceChange --> BuyOrSell
  BuyOrSell --> EndTurn
}

PlayerTurn --> NextPlayer : EndTurn
NextPlayer --> PlayerTurn : Pass turn

PlayerTurn --> GameEnd : Bankrupt / No moves left
GameStart --> GameEnd : Forced stop
GameEnd --> [*]
@enduml
```

## Physical Board Game
<img src=Stock_Ticker.jpg>
# Stock Ticker
> A board game about the real-time changes and activities of the market system.
> Resources: Cash
> Commodities: Industrial, Bonds, Oil, Gold, Silver

## Class Diagram
```mermaid
    classDiagram
        Commodity <|-- Oil
        Commodity <|-- Bonds
        Commodity <|-- Gold
        Commodity <|-- Industrial
        Commodity <|-- Silver
        Game o-- Player
        Game o-- Commodity
        Player -- Commodity
        class Commodity {
                +String name
                +Number price
            }
            class Player {
            +Game game
            +String name
            +Number cash
            +tupple assets
            +trade()
            +get_worth()
        }
            class Game {
            +Player[] players
            +Commodity[] commodities
            +Player turn
            +Boolean canTrade
            +trade(action,commodity,amount)
            +<amount,commodity,action> rolled
            +roll()
            +toString()
            +toJSON()
            ~play(stdin,stdout)
        }
```

## Game Play Flowchart
```mermaid
    graph TD
        NumPlayers[/# Players/] --> StartGame
        PlayerNames[/Player Names/] --> StartGame
        StartGame --> DistributeCash
        DistributeCash --> NextPlayer
        NextPlayer--> MakeTrade1{Make Trade?}
        MakeTrade1 --> |no| RollDice
        MakeTrade1 --> |yes| MakeTrade1
        RollDice --> WasUpDown{Was Down}
        WasUpDown --> |yes| NextPlayer
        WasUpDown --> |no| RollDice
  ```

## Game Play State Diagram
  ```mermaid
    stateDiagram
        [*] --> Waiting
        Waiting --> NumPlayers
        NumPlayers --> PlayerNames
        PlayerNames --> PlayerTurn
        PlayerTurn --> CanTrade
        CanTrade --> Trade
        Trade--> CanTrade
        CanTrade --> CanRoll
        CanRoll --> Roll
        Roll --> CanRoll
        CanRoll --> PlayerTurn
        PlayerTurn --> Quit
        Quit --> [*]
```
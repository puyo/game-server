# Snake
Javascript Snake Game

## 2 Player Snake
* Each player has a turn until dead
* Winner is determined by highest score
* Players can take as many turns as the want. Only the highest score of each player is stored

Goal is to eat food. Hitting the snake body ends players turn. Walls can be 'teleported' through.

Food is randomly generated. Eating food:
* increases length of the snake
* increases points
* increases speed
* new food position relocates

'Special' foods
* give bonus points
* makes walls lava (non teleportable) for 10 seconds
* increases speed of snake for 10 seconds
* causes flashy rainbow seizure effect for 10 seconds
* special foods are optional to eat and dissapear after 10 seconds of not being eaten

Controls:
* keyboard arrow keys are used to change direction


# Plan

Set gameboard canvas
- width and height

Variables for:
- player 1 score
- player 2 score
- cell width

Initialise Game
- render snake in starting position
- create food - random position
- determine if player 1 or 2
- set score at 0

Functions to:

Respond to food
* when snake head matches food postion, and new cell to snake (increase length)
* increase score

If snake hits body
* end game
* store score
* nexts players turn




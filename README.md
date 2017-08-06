# GameServer

P2P JavaScript game services.

* Infrastructure
  * Discovery server for advertising and finding games
  * Socket.io signalling server to coordinate rooms and help establish P2P connections with SimpleRTC
    * (Replace with Phoenix channel)
  * STUN server
  * TURN server (maybe ? if I can get it compiled?)
  * Client JS lib for games to include and use

* Game logic
  * Init
    * If number of players == 0, this.server = true
    * Emit events to actual game code
    * Chat room? Later?

## Phoenix

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.create && mix ecto.migrate`
  * Install Node.js dependencies with `cd assets && npm install`
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](http://www.phoenixframework.org/docs/deployment).

## Learn more

  * Official website: http://www.phoenixframework.org/
  * Guides: http://phoenixframework.org/docs/overview
  * Docs: https://hexdocs.pm/phoenix
  * Mailing list: http://groups.google.com/group/phoenix-talk
  * Source: https://github.com/phoenixframework/phoenix

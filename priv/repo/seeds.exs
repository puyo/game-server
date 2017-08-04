# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     GameServer.Repo.insert!(%GameServer.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias GameServer.Repo
alias GameServer.Discovery.Game

Repo.insert!(
  %Game{
    name: "my game",
    geometry: %Geo.Point{coordinates: {-33.8014194, 151.1119523}, srid: 4326}
  }
)

Repo.insert!(
  %Game{
    name: "my other game",
    geometry: %Geo.Point{coordinates: {-33.9122809, 151.1384613}, srid: 4326}
  }
)

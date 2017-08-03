defmodule GameServerWeb.API.GameView do
  use GameServerWeb, :view
  alias GameServerWeb.API.GameView

  def render("index.json", %{games: games}) do
    %{data: render_many(games, GameView, "game.json")}
  end

  def render("show.json", %{game: game}) do
    %{data: render_one(game, GameView, "game.json")}
  end

  def render("game.json", %{game: game}) do
    %{id: game.id,
      uuid: game.uuid,
      name: game.name,
      type: game.type,
      coordinates: game.geometry.coordinates |> Tuple.to_list }
  end
end

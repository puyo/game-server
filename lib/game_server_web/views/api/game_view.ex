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
    %{
      id: game.id,
      uuid: game.uuid,
      name: game.name,
      type: game.type,
      distance: if(Map.has_key?(game, :distance), do: game.distance),
      in_range: if(Map.has_key?(game, :in_range), do: game.in_range),
      coordinates: Tuple.to_list(game.geometry.coordinates)
    }
  end
end

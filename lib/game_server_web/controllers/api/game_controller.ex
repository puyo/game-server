defmodule GameServerWeb.API.GameController do
  use GameServerWeb, :controller

  alias GameServer.Discovery
  alias GameServer.Discovery.Game

  action_fallback GameServerWeb.FallbackController

  def index(conn, %{"lat" => lat, "lng" => lng, "m" => m}) do
    games = Discovery.list_games_near(
      %{
        lat: lat,
        lng: lng,
        m: String.to_integer(m)
      }
    )
    render(conn, "index.json", games: games)
  end

  def index(conn, %{}) do
    games = Discovery.list_games()
    render(conn, "index.json", games: games)
  end

  def create(conn, %{"game" => game_params}) do
    with {:ok, %Game{} = game} <- Discovery.create_game(game_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", game_path(conn, :show, game))
      |> render("show.json", game: game)
    end
  end

  def show(conn, %{"id" => id}) do
    game = Discovery.get_game!(id)
    render(conn, "show.json", game: game)
  end

  def update(conn, %{"id" => id, "game" => game_params}) do
    game = Discovery.get_game!(id)

    with {:ok, %Game{} = game} <- Discovery.update_game(game, game_params) do
      render(conn, "show.json", game: game)
    end
  end

  def delete(conn, %{"id" => id}) do
    game = Discovery.get_game!(id)
    with {:ok, %Game{}} <- Discovery.delete_game(game) do
      send_resp(conn, :no_content, "")
    end
  end
end

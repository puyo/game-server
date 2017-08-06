defmodule GameServerWeb.GameController do
  use GameServerWeb, :controller

  alias GameServer.Discovery
  alias GameServer.Discovery.Game

  def index(conn, %{}) do
    games = Discovery.list_games()
    render(conn, "index.html", games: games)
  end

  def new(conn, _params) do
    changeset = Discovery.change_game(%Game{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"game" => game_params}) do
    case Discovery.create_game(game_params) do
      {:ok, game} ->
        conn
        |> put_flash(:info, "Game created successfully.")
        |> redirect(to: game_path(conn, :show, game))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    game = Discovery.get_game!(id)
    render(conn, "show.html", game: game, page_title: game.name)
  end

  def edit(conn, %{"id" => id}) do
    game = Discovery.get_game!(id)
    changeset = Discovery.change_game(game)
    render(conn, "edit.html", game: game, changeset: changeset)
  end

  def update(conn, %{"id" => id, "game" => game_params}) do
    game = Discovery.get_game!(id)

    case Discovery.update_game(game, game_params) do
      {:ok, game} ->
        conn
        |> put_flash(:info, "Game updated successfully.")
        |> redirect(to: game_path(conn, :show, game))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", game: game, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    game = Discovery.get_game!(id)
    {:ok, _game} = Discovery.delete_game(game)

    conn
    |> put_flash(:info, "Game deleted successfully.")
    |> redirect(to: game_path(conn, :index))
  end
end

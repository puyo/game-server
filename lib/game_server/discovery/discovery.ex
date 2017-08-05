defmodule GameServer.Discovery do
  @moduledoc """
  The boundary for the discovery system.
  """

  import Ecto.Query, warn: false
  alias GameServer.Repo

  alias GameServer.Discovery.Game

  @doc """
  Returns the list of games.

  ## Examples

      iex> list_games()
      [%Game{}, ...]

  """
  def list_games do
    Repo.all(Game)
  end

  def list_games_near(%{lat: lat, lng: lng, m: m}) do
    search_point = %Geo.Point{coordinates: {lat, lng}, srid: 4326}

    from(g in Game,
      select: %{
        id: g.id,
        name: g.name,
        uuid: g.uuid,
        type: g.type,
        geometry: g.geometry,
        in_range: fragment("ST_Distance_Sphere(?, ?) <= ?",
          g.geometry, ^search_point, ^m),
        distance: fragment("ST_Distance_Sphere(?, ?)::int",
          g.geometry, ^search_point),
      },
      order_by: fragment("ST_Distance_Sphere(?, ?)",
        g.geometry, ^search_point)
    )
    |> Repo.all
  end

  @doc """
  Gets a single game.

  Raises `Ecto.NoResultsError` if the Game does not exist.

  ## Examples

      iex> get_game!(123)
      %Game{}

      iex> get_game!(456)
      ** (Ecto.NoResultsError)

  """
  def get_game!(id), do: Repo.get_by!(Game, uuid: id)

  @doc """
  Creates a game.

  ## Examples

      iex> create_game(%{field: value})
      {:ok, %Game{}}

      iex> create_game(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_game(attrs \\ %{}) do
    %Game{}
    |> Game.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a game.

  ## Examples

      iex> update_game(game, %{field: new_value})
      {:ok, %Game{}}

      iex> update_game(game, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_game(%Game{} = game, attrs) do
    game
    |> Game.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Game.

  ## Examples

      iex> delete_game(game)
      {:ok, %Game{}}

      iex> delete_game(game)
      {:error, %Ecto.Changeset{}}

  """
  def delete_game(%Game{} = game) do
    Repo.delete(game)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking game changes.

  ## Examples

      iex> change_game(game)
      %Ecto.Changeset{source: %Game{}}

  """
  def change_game(%Game{} = game) do
    Game.changeset(game, %{})
  end
end

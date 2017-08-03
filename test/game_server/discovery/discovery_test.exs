defmodule GameServer.DiscoveryTest do
  use GameServer.DataCase

  alias GameServer.Discovery

  describe "games" do
    alias GameServer.Discovery.Game

    @valid_attrs %{name: "some name", type: "some type", uuid: "7488a646-e31f-11e4-aace-600308960662"}
    @update_attrs %{name: "some updated name", type: "some updated type", uuid: "7488a646-e31f-11e4-aace-600308960668"}
    @invalid_attrs %{name: nil, type: nil, uuid: nil}

    def game_fixture(attrs \\ %{}) do
      {:ok, game} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Discovery.create_game()

      game
    end

    test "list_games/0 returns all games" do
      game = game_fixture()
      assert Discovery.list_games() == [game]
    end

    test "get_game!/1 returns the game with given id" do
      game = game_fixture()
      assert Discovery.get_game!(game.id) == game
    end

    test "create_game/1 with valid data creates a game" do
      assert {:ok, %Game{} = game} = Discovery.create_game(@valid_attrs)
      assert game.name == "some name"
      assert game.type == "some type"
      assert game.uuid == "7488a646-e31f-11e4-aace-600308960662"
    end

    test "create_game/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Discovery.create_game(@invalid_attrs)
    end

    test "update_game/2 with valid data updates the game" do
      game = game_fixture()
      assert {:ok, game} = Discovery.update_game(game, @update_attrs)
      assert %Game{} = game
      assert game.name == "some updated name"
      assert game.type == "some updated type"
      assert game.uuid == "7488a646-e31f-11e4-aace-600308960668"
    end

    test "update_game/2 with invalid data returns error changeset" do
      game = game_fixture()
      assert {:error, %Ecto.Changeset{}} = Discovery.update_game(game, @invalid_attrs)
      assert game == Discovery.get_game!(game.id)
    end

    test "delete_game/1 deletes the game" do
      game = game_fixture()
      assert {:ok, %Game{}} = Discovery.delete_game(game)
      assert_raise Ecto.NoResultsError, fn -> Discovery.get_game!(game.id) end
    end

    test "change_game/1 returns a game changeset" do
      game = game_fixture()
      assert %Ecto.Changeset{} = Discovery.change_game(game)
    end
  end
end

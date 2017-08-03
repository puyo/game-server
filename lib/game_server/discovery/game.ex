defmodule GameServer.Discovery.Game do
  use Ecto.Schema
  import Ecto.Changeset
  alias GameServer.Discovery.Game

  @derive {Phoenix.Param, key: :uuid}

  schema "games" do
    field :name, :string
    field :type, :string
    field :geometry, Geo.Geometry
    field :uuid, Ecto.UUID
    field :created_at, :utc_datetime
    field :updated_at, :utc_datetime
  end

  @doc false
  def changeset(%Game{} = game, attrs) do
    game
    |> cast(attrs, [:name, :type, :uuid, :geometry])
    |> validate_required([:name, :type, :uuid, :geometry])
  end
end

defmodule GameServer.Repo.Migrations.CreateGame do
  use Ecto.Migration

  def up do
    create_if_not_exists table(:games) do
      add :name, :string, null: false
      add :type, :string, null: false, default: "poetry"
      add :uuid, :uuid, null: false, default: fragment("uuid_generate_v1()")
      add :created_at, :timestamp, null: false, default: fragment("CURRENT_TIMESTAMP")
      add :updated_at, :timestamp, null: false, default: fragment("CURRENT_TIMESTAMP")
    end
    execute """
    SELECT AddGeometryColumn('games', 'geometry', 4326, 'POINT', 2);
    """

    create_if_not_exists unique_index(:games, [:name])
    create_if_not_exists unique_index(:games, [:uuid])
  end

  def down do
    drop_if_exists unique_index(:games, [:uuid])
    drop_if_exists unique_index(:games, [:name])
    drop table(:games)
  end
end

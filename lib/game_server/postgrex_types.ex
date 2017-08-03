#If using with Ecto, you may want something like thing instead
Postgrex.Types.define(GameServer.PostgresTypes,
  [Geo.PostGIS.Extension] ++ Ecto.Adapters.Postgres.extensions(),
  json: Poison)

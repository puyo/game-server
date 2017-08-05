defmodule GameServer.Stuntman do
  use GenServer

  @cmd_path Application.get_env(:game_server, :stuntman_cmd)
  @cmd_args Application.get_env(:game_server, :stuntman_args, ["--verbosity", "3"])

  def start_link do
    GenServer.start(__MODULE__, nil)
  end

  def init(_params) do
    send(self(), :kill_server)
    {:ok, nil}
  end

  def handle_info(:kill_server, state) do
    path = Path.basename(@cmd_path)
    IO.puts "Killing existing server #{path}..."
    killall = System.find_executable("killall")
    {"", killed} = System.cmd(
      killall,
      [path]
    )
    if killed == 0 do
      IO.puts "FOUND AND KILLED"
      Process.send_after(self(), :run_server, 1000)
    else
      send(self(), :run_server)
    end
    {:noreply, state}
  end

  def handle_info(:run_server, state) do
    IO.puts "Running server..."
    Process.flag(:trap_exit, true)
    port = Port.open(
      {:spawn_executable, executable_path()},
      [:binary, :stderr_to_stdout, {:parallelism, true}, {:args, @cmd_args}]
    )
    {:noreply, %{port: port}}
  end

  def handle_info({port, {:data, data}}, state) do
    IO.puts data
    {:noreply, state}
  end

  def handle_info({:EXIT, port, :normal}, %{port: server_port}) do
    if port == server_port do
      IO.puts "SERVER EXITED"
      Process.send_after(self(), :run_server, 1000)
    end
    {:noreply, %{}}
  end

  def handle_info(args, state) do
    IO.inspect handle_info: args
    {:noreply, state}
  end

  def terminate(:shutdown, state) do
    IO.inspect TERMINATING: state
  end

  def terminate(reason, state) do
    IO.inspect reason: reason, state: state
  end

  defp executable_path do
    Path.absname(File.cwd! <> "/" <> @cmd_path)
  end
end

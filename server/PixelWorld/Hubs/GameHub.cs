using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using PixelWorld.Games;

namespace PixelWorld.Hubs
{
    public interface IGameHub
    {
        Task GetMapAsync();
        Task SetColorAtPositionAsync(int x, int y, int color);
    }

    public class GameHub : Hub, IGameHub
    {
        private readonly IGameState _gameState;

        public GameHub(IGameState gameState)
        {
            _gameState = gameState ?? throw new ArgumentNullException(nameof(gameState));
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();

            await Groups.AddToGroupAsync(Context.ConnectionId, "Players");

        }

        public async Task GetMapAsync()
        {
            await Clients.Client(Context.ConnectionId).SendAsync("MapReceived", _gameState.GetMapColor());
        }

        public Task SetColorAtPositionAsync(int x, int y, int color)
        {
            _gameState.SetColorAtPosition(x, y, color);

            return Task.CompletedTask;
        }
    }
}
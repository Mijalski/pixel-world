using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using PixelWorld.Games;

namespace PixelWorld.Hubs
{
    public interface IGameHub
    {
        Task GetMapAsync();
        Task SetColorAtPositionAsync(int x, int y, int color);
        Task SetMultipleColorsAtPositionsAsync(List<MapPoint> mapPoints);
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

            await Clients.Client(Context.ConnectionId).SendAsync("MapSize", _gameState.GetMapSize());
        }

        public async Task GetMapAsync()
        {
            await Clients.Client(Context.ConnectionId).SendAsync("Map", _gameState.GetMap());
        }

        public Task SetColorAtPositionAsync(int x, int y, int color)
        {
            _gameState.SetColorAtPosition(x, y, color);

            return Task.CompletedTask;
        }

        public Task SetMultipleColorsAtPositionsAsync(List<MapPoint> mapPoints)
        {
            foreach (var mapPoint in mapPoints)
            {
                _gameState.SetColorAtPosition(mapPoint.X, mapPoint.Y, mapPoint.Color);
            }

            return Task.CompletedTask;
        }
    }
}
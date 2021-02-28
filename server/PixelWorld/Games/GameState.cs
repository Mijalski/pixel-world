using System.Collections.Generic;

namespace PixelWorld.Games
{
    public interface IGameState
    {
        Dictionary<(int x, int y), int> GetMapColor();
        void SetColorAtPosition(int x, int y, int color);
    }

    public class GameState : IGameState
    {
        public int ColorsToPickLength = 8;
        public Dictionary<(int x, int y), int> ColorsOnMap = new Dictionary<(int x, int y), int>();

        public Dictionary<(int x, int y), int> GetMapColor() => ColorsOnMap;

        public void SetColorAtPosition(int x, int y, int color)
        {
            if(ColorsOnMap.TryGetValue((x,y), out _))
            {
                ColorsOnMap[(x, y)] = color;
            }
            else
            {
                ColorsOnMap.Add((x,y), color);
            }
        }
    }
}
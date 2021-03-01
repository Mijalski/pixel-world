using System;
using System.Collections.Generic;

namespace PixelWorld.Games
{
    public interface IGameState
    {
        int GetMapSize();
        int[,] GetMap();
        void SetColorAtPosition(int x, int y, int color);
    }

    public class GameState : IGameState
    {
        public static int ColorsToPickLength = 8;
        public static int MapSize = 256;
        public int [,] Map = new int[MapSize, MapSize];

        public int GetMapSize() => MapSize;

        public int[,] GetMap() => Map;

        public void SetColorAtPosition(int x, int y, int color)
        {
            if (x > MapSize)
            {
                throw new ArgumentOutOfRangeException(nameof(x), "X coordinate cannot be grater than map size");
            }
            
            if (y > MapSize)
            {
                throw new ArgumentOutOfRangeException(nameof(y), "Y coordinate cannot be grater than map size");
            }

            Map[x, y] = color;
        }
    }
}
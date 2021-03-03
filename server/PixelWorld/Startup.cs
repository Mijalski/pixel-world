using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using PixelWorld.Games;
using PixelWorld.Hubs;

namespace PixelWorld
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR(e => {
                    e.MaximumReceiveMessageSize = 102400000;
                })
                .AddNewtonsoftJsonProtocol();

            services.AddTransient<IGameState, GameState>();

            services.AddCors(options =>
            {
                options.AddPolicy("DefaultCorsPolicy",
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:8080", "https://pixels.hashash.app", "https://www.pixels.hashash.app")
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                    });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseCors("DefaultCorsPolicy");

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/", async context =>
                {
                    await context.Response.WriteAsync("Hello World!");
                });
                endpoints.MapHub<GameHub>("/game");
            });
        }
    }
}

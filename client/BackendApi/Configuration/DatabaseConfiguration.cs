using Microsoft.EntityFrameworkCore;
using BackendApi.Data;

namespace BackendApi.Configuration;

public static class DatabaseConfiguration
{
    public static IServiceCollection AddDatabaseConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        return services;
    }

    public static async Task<IApplicationBuilder> ApplyMigrationsAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Apply migrations
        await dbContext.Database.MigrateAsync();

        return app;
    }
}
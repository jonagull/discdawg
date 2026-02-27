namespace BackendApi.Configuration;

public static class CorsConfiguration
{
    public static IServiceCollection AddCorsConfiguration(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.WithOrigins(
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:3002",
                        "http://localhost:3003",
                        "http://localhost:3004",
                        "http://localhost:3005",
                        "http://localhost:3006"
                      )
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });

        return services;
    }

    public static IApplicationBuilder UseCorsConfiguration(this IApplicationBuilder app)
    {
        app.UseCors("AllowAll");
        return app;
    }
}
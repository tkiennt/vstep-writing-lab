# ── Build Stage ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies (layer cache optimization)
COPY ["VstepWritingLab.API/VstepWritingLab.API.csproj", "VstepWritingLab.API/"]
COPY ["VstepWritingLab.Business/VstepWritingLab.Business.csproj", "VstepWritingLab.Business/"]
COPY ["VstepWritingLab.Data/VstepWritingLab.Data.csproj", "VstepWritingLab.Data/"]
COPY ["VstepWritingLab.Domain/VstepWritingLab.Domain.csproj", "VstepWritingLab.Domain/"]
COPY ["VstepWritingLab.Shared/VstepWritingLab.Shared.csproj", "VstepWritingLab.Shared/"]

RUN dotnet restore "VstepWritingLab.API/VstepWritingLab.API.csproj"

# Copy remaining source and build
COPY . .
WORKDIR "/src/VstepWritingLab.API"
RUN dotnet build "VstepWritingLab.API.csproj" -c Release -o /app/build

# ── Publish Stage ─────────────────────────────────────────────────────────
FROM build AS publish
RUN dotnet publish "VstepWritingLab.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ── Final Runtime Stage ───────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Cloud Run standard port
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "VstepWritingLab.API.dll"]

import Head from "../components/head";
import Homee from "../icons/home";

const Home = function () {
  const isMac = navigator.userAgent.includes("Mac");
  this.actionKey = isMac ? "Control" : "Alt";
  this.theme = localStorage.getItem("@nano/theme") || "moss";
  this.search = null;

  this.cloakTitle = localStorage.getItem("@nano/cloak/title") || "";
  this.cloakIcon = localStorage.getItem("@nano/cloak/icon") || "";

  // ✅ You can now use `newTab` and `goldBorder`
  this.games = [
    {
      name: "Suggest a game",
      icon: "suggest.png",
      link: "https://docs.google.com/forms/d/e/1FAIpQLSd2a27uFXugwR1rd5BwelI5fhukPDCXISv1taGOG616zxYnIw/viewform?usp=dialog",
      newTab: true,
      goldBorder: false,
    },
    {
      name: "Tag Online",
      icon: "tag-online/tagonline.png",
      link: "/tag-online",
      newTab: false,
      goldBorder: true,
    },
  ];

  // Load favourites
  let favsCookie = document.cookie
    .split("; ")
    .find((r) => r.startsWith("favs="));
  this.favs = favsCookie
    ? JSON.parse(decodeURIComponent(favsCookie.split("=")[1]))
    : [];

  // Sort by favourites first
  this.games.sort((a, b) => {
    const aFav = this.favs.includes(a.name);
    const bFav = this.favs.includes(b.name);
    if (aFav === bFav) return 0;
    return aFav ? -1 : 1;
  });

  // Filter by search
  const filteredGames = this.searchQuery
    ? this.games.filter((g) =>
        g.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    : this.games;

  return (
    <div>
      <Head
        bind:theme={use(this.theme)}
        bind:cloakTitle={use(this.cloakTitle)}
        bind:cloakIcon={use(this.cloakIcon)}
      />

      {/* 🔍 Search Bar */}
      <div class="flex justify-center fixed top-0 right-0 left-0 z-50">
        <div class="flex items-center flex-1 gap-2 bg-Base rounded-[26px] p-1.5 my-2 mx-5 max-w-3xl shadow">
          <button
            on:click={() => (window.location.href = "/")}
            aria-label="Home"
            title={use`Home (${this.actionKey}+G)`}
            class="sidebar-animation h-8 w-8 rounded-full flex justify-center items-center ml-1 p-2"
          >
            <Homee class="sidebar-animated" />
          </button>
          <div class="bg-Surface0 w-[2px] h-[calc(100%_-_1.25rem)] mr-1"></div>
          <input
            autofocus
            bind:this={use(this.search)}
            value={this.searchQuery}
            onChange={(e) => {
              this.searchQuery = e.target.value;
              this.forceUpdate?.();
            }}
            placeholder="Search for a game"
            class="flex-1 border-0 bg-transparent outline-none h-10 w-full placeholder:select-none placeholder:text-Subtext0"
          />
        </div>
      </div>

      {/* 🎮 Game Cards */}
      <div class="mt-32 flex flex-wrap justify-center gap-9 px-5">
        {filteredGames.map((game) => (
          <div
            class={`game-card-wrapper w-64 ${
              game.goldBorder ? "gold-border pulse" : ""
            }`}
          >
            <div
              class={`game-card bg-Surface0 rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer ${
                game.goldBorder ? "border-4 border-yellow-400" : ""
              }`}
            >
              <img
                src={game.icon}
                alt={`${game.name} icon`}
                class="game-icon w-full aspect-square object-cover rounded-lg mb-1"
              />

              <div class="flex items-center mb-2 w-full">
                <h3 class="game-title text-[1.04rem] font-semibold truncate flex-5">
                  {game.name}
                </h3>
              </div>

              <div class="action-row flex">
                <button
                  class="play-btn flex-1 py-2 mr-2 rounded-lg bg-Blue text-Crust font-semibold"
                  on:click={() => {
                    if (game.newTab) {
                      window.open(game.link, "_blank");
                    } else {
                      window.top.location.href = game.link;
                    }
                  }}
                >
                  {game.newTab ? "Open" : "Play"}
                </button>

                <button
                  class={`fav-btn flex justify-center items-center w-10 h-10 bg-Base rounded-full ${
                    this.favs.includes(game.name) ? "favourited" : ""
                  }`}
                  on:click={() => {
                    let updated;
                    if (this.favs.includes(game.name)) {
                      updated = this.favs.filter((f) => f !== game.name);
                    } else {
                      updated = [...this.favs, game.name];
                    }

                    this.favs = updated;
                    document.cookie = `favs=${encodeURIComponent(
                      JSON.stringify(this.favs)
                    )}; path=/; max-age=31536000`;

                    location.reload();
                  }}
                >
                  ⭐
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 💫 Gold Border Pulse Animation */}
      <style jsx>{`
  /* 💫 Pulsing gold aura with movement sync */
  @keyframes pulse-glow {
    0% {
      box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3),
        0 0 8px 2px rgba(255, 215, 0, 0.4);
      transform: translateY(0) scale(1);
    }
    50% {
      box-shadow: 0 8px 16px rgba(255, 215, 0, 0.8),
        0 0 18px 5px rgba(255, 215, 0, 0.9);
      transform: translateY(-2px) scale(1.01);
    }
    100% {
      box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3),
        0 0 8px 2px rgba(255, 215, 0, 0.4);
      transform: translateY(0) scale(1);
    }
  }

  .gold-border .game-card {
    position: relative;
    border: 3px solid gold;
    border-radius: 0.75rem;
    animation: pulse-glow 2.5s infinite ease-in-out;
  }

`}</style>

    </div>
  );
};

export default Home;

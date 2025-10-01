import Head from "../components/head";
import Homee from "../icons/home";

const Home = function () {
    const isMac = navigator.userAgent.includes("Mac");
    this.actionKey = isMac ? "Control" : "Alt";
    this.theme = localStorage.getItem("@nano/theme") || "moss";
    this.search = null;

    this.cloakTitle = localStorage.getItem("@nano/cloak/title") || "";
    this.cloakIcon = localStorage.getItem("@nano/cloak/icon") || "";

    // Example games
    this.games = [
        "Space Adventure",
        "Monster Battle",
        "Puzzle Quest",
        "Speed Racer",
        "Castle Defense",
        "Mystery Island",
        "Zombie Survival",
        "Treasure Hunt",
    ];

    // Search handler

    

    return (
        <div>
            <Head
                bind:theme={use(this.theme)}
                bind:cloakTitle={use(this.cloakTitle)}
                bind:cloakIcon={use(this.cloakIcon)}
            />
            {/* Top search bar */}
            <div class="flex justify-center fixed top-0 right-0 left-0 z-50">
                <div class="flex items-center flex-1 gap-2 bg-Base rounded-[26px] p-1.5 my-2 mx-5 max-w-3xl shadow">
                    <button
                        on:click={() => window.location.href = "/"}
                        aria-label="Home"
                        title={use`Home (${this.actionKey}+G))`}
                        class="sidebar-animation h-8 w-8 rounded-full flex justify-center items-center ml-1 p-2"
                    >
                        <Homee class="sidebar-animated" />
                    </button>
                    <div class="bg-Surface0 w-[2px] h-[calc(100%_-_1.25rem)] mr-1"></div>
                    <input
                        autofocus
                        bind:this={use(this.search)}
                        value={this.searchQuery}
                        onChange={(e) => { this.searchQuery = e.target.value; this.forceUpdate?.() }}
                        placeholder="Search for a game"
                        class="flex-1 border-0 bg-transparent outline-none h-10 w-full placeholder:select-none placeholder:text-Subtext0"
                    />

                </div>
            </div>
    
            <div
  class="mt-32 flex flex-wrap justify-center gap-9 px-5"

>
{this.games
 .filter((game) =>
       this.searchQuery
         ? game.toLowerCase().includes(this.searchQuery.toLowerCase())
         : true
     )
  .map((game) => (
    <div class="game-card-wrapper w-64">
      <div class="game-card bg-Surface0 rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer">
        <div class="game-icon w-full aspect-square bg-Base rounded-lg mb-1"></div>

        <div class="flex items-center mb-2 w-full">
          <h3 class="game-title text-[1.04rem] font-semibold truncate flex-5">
            {game}
          </h3>
          <span class="game-like text-sm text-Subtext0 text-right min-w-[3rem]">
            87%
          </span>
        </div>

        <div class="action-row">
          <button class="play-btn flex-1 py-2 mr-2 rounded-lg bg-Blue text-Crust font-semibold">
            Play
          </button>
          <button class="fav-btn flex justify-center items-center w-10 h-10 bg-Base rounded-full">
            ⭐
          </button>
        </div>
      </div>
    </div>
  ))}

</div>

        </div>
    );    
};

export default Home;

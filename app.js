const playlist = document.querySelector(".playlist");
const cd = document.querySelector(".cd");
const heading = document.querySelector("h2");
const cdThumb = document.querySelector(".cd-thumb");
const audio = document.querySelector("#audio");
const playBtn = document.querySelector(".btn-toggle-play");
const player = document.querySelector(".player");
const progress = document.querySelector(".progress");
const nextBtn = document.querySelector(".btn-next");
const prevBtn = document.querySelector(".btn-prev");
const randomBtn = document.querySelector(".btn-random");
const repeatBtn = document.querySelector(".btn-repeat");

const PLAYER_STORAGE_KEY = "Kvi_player";
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
     {
       name: "Lalisa",
       singer: "Lalisa",
       path: "assets/music/Lalisa.mp3",
       image: "assets/img/Lalisa.png",
     },
    {
      name: "Money",
      singer: "Lalisa",
      path: "assets/music/money.mp3",
      image: "assets/img/money.png",
    },
    {
      name: "Counting Stars",
      singer: "Beo",
      path: "assets/music/Counting Stars.mp3",
      image: "assets/img/Counting Stars.png",
    },
    {
      name: "Gone",
      singer: "Rose",
      path: "assets/music/Gone.mp3",
      image: "assets/img/Gone.png",
    },
    {
      name: "Instagram",
      singer: "Dean",
      path: "assets/music/Instagram.mp3",
      image: "assets/img/Instagram.png",
    },
    {
      name: "How You Like That",
      singer: "BlackPink",
      path: "assets/music/How You Like That.mp3",
      image: "assets/img/How You Like That.png",
    },
    {
      name: "Du Du Du",
      singer: "BlackPink",
      path: "assets/music/du du du.mp3",
      image: "assets/img/du du du.png",
    },
    {
      name: "Nervers",
      singer: "DPR IAN",
      path: "assets/music/Nervers.mp3",
      image: "assets/img/Nervers.png",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `<div class="song ${
        index === this.currentIndex ? "active" : ""
      }" data-index= "${index}">
      <div class="thumb" style="background-image: url('${song.image}')">
      </div>
      <div class="body">
        <h3 class="title">${song.name}</h3>
        <p class="author">${song.singer}</p>
      </div>
      <div class="option">
        <i class="fas fa-ellipsis-h"></i>
      </div>
    </div>`;
    });
    playlist.innerHTML = htmls.join("\n");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const cdWidth = cd.offsetWidth;
    //handle cd rotate
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();
    document.addEventListener("scroll", function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    });
    playBtn.addEventListener("click", function () {
      if (app.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    });
    //while song is playing
    audio.onplay = function () {
      app.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    //while song pausing
    audio.onpause = function () {
      app.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    //handle audio progress
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };
    //handle seektime
    progress.addEventListener("change", function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    });
    //handle next song
    nextBtn.addEventListener("click", function () {
      if (app.isRandom) {
        app.playRandomeSong();
      } else {
        app.nextSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    });

    prevBtn.addEventListener("click", function () {
      if (app.isRandom) {
        app.playRandomeSong();
      } else {
        app.prevSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    });

    randomBtn.addEventListener("click", function (e) {
      app.isRandom = !app.isRandom;
      app.setConfig("isRandom", app.isRandom);
      randomBtn.classList.toggle("active", app.isRandom);
    });

    //handle repeat song
    repeatBtn.addEventListener("click", function (e) {
      app.isRepeat = !app.isRepeat;
      app.setConfig("isRepeat", app.isRepeat);
      repeatBtn.classList.toggle("active", app.isRepeat);
    });

    audio.addEventListener("ended", function () {
      if (app.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    });

    //listen for click on song
    playlist.addEventListener("click", function (e) {
      const songEle = e.target.closest(".song:not(.active)");
      if (songEle || e.target.closest(".song.active")) {
        //handle click on song
        if (e.target.closest(".song:not(.active)")) {
          app.currentIndex = Number(songEle.dataset.index);
          app.loadCurrentSong();
          audio.play();
          app.render();
        }
      }
    });
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      document.querySelector(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 500);
  },

  playRandomeSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex == this.currentIndex);
    {
      this.currentIndex = newIndex;
      this.loadCurrentSong();
    }
  },

  start: function () {
    this.loadConfig();
    this.defineProperties(); //define properties
    this.handleEvents();
    this.loadCurrentSong(); // load first song
    this.render();
    //display first status of repeat btn and random btn
    randomBtn.classList.toggle("active", app.isRandom);
    repeatBtn.classList.toggle("active", app.isRepeat);
  },
};
app.start();

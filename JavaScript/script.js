console.log("lets write js");

// to make songs play one at a time insted of many one after other if we play them
let currSong = new Audio();

let songs;
let currFolder;

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5501/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      ` <li>
                <img class="invert" src="img/music-svgrepo-com.svg" alt="music-icon">
                <div class="info">
                  <div> ${song.replaceAll("%20", " ")}</div>
                  <div></div>
                </div>
                  <div class="playnow">
                    <!-- <span>Play Now</span> -->
                    <img class="invert" src="img/play.svg" alt="playnow">
               </div></li>`;
  }

  //attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
     playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

function playMusic(track, pause = false) {
  // let audio = new Audio("/songs/"+ track);
  currSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums(){
  let a = await fetch(`http://127.0.0.1:5501/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array =  Array.from(anchors); 
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      
    if(e.href.includes("/songs/")){
      let folder = e.href.split("/").slice(-1)[0];
      //Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);
      let response = await a.json(); 
      let cardContainer = document.querySelector(".card-container")
      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
              <div class="play">
                <?xml version="1.0" encoding="UTF-8" standalone="no"?>
                <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                >
                  <title>play</title>
                  <desc>Solid black play button</desc>
                  <g fill="black">
                    <path d="M3 22V2l18 10-18 10z"></path>
                  </g>
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.png"
                alt="Sanam tere kasam"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
    }
    //Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e =>{
    e.addEventListener("click", async item =>{
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])
    })
  })

  }
  
}

async function main() {
  //get the list of all song
  await getSongs("songs/Ambient");
  playMusic(songs[0], true);

  //Display all the albumson the page
  displayAlbums();

  //attach an event listener to previous, play & next buttons
  play.addEventListener("click", (e) => {
    if (currSong.paused) {
      currSong.play();
      play.src = "img/pause.svg";
    } else {
      currSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currSong.addEventListener("timeupdate", () => { 
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currSong.currentTime
    )} / ${formatTime(currSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%";
  });

  function formatTime(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "00:00"
    }
    seconds = Math.floor(seconds); // Convert decimal seconds to integer
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    secs = secs < 10 ? "0" + secs : secs; // Add leading zero if needed
    return minutes + ":" + secs;
  }

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currSong.currentTime = (currSong.duration * percent) / 100;
  });

  // add event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add event listener for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-130%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    if ((index - 1 ) >= 0) {
        playMusic(songs[index - 1]);
    }
   
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e) =>{
    currSong.volume = parseInt(e.target.value)/100;
    if (currSong.volume > 0){
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace( "img/mute.svg","img/volume.svg")
    }
  })

  //Mute on volume
  document.querySelector(".volume>img").addEventListener("click", e =>{
      if(e.target.src.includes("img/volume.svg")){
        e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
        currSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      }
      else{ 
        e.target.src = e.target.src.replace( "img/mute.svg","img/volume.svg")
        currSong.volume = 0.1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
      }

  })

  


}

main();

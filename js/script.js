 let currentSong = new Audio();
  let songs;
  let currFolder;

 function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    if (hrs > 0) {
        return `${hrs}:${formattedMins}:${formattedSecs}`;
    } else {
        return `${formattedMins}:${formattedSecs}`;
    }
}

async function getSongs(folder) {
    currFolder = folder;

    // Fetch info.json
    let res = await fetch(`songs/${folder}/info.json`);
    let json = await res.json();
    songs = json.songs;

    // Populate song list
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
            <li data-file="${song}">
                <img class="invert" src="images/music.svg" alt="music">
                <div class="info">
                    <div>${song.replace(".mp3", "")}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="images/play.svg" alt="play">
                </div>
            </li>`;
    }

    // Add event listeners to each <li>
    document.querySelectorAll(".songList li").forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.getAttribute("data-file"));
        });
    });
}


function playMusic(track, pause = false) {
    if (!track) return;

    currentSong.src = `songs/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        document.querySelector("#play").src = "images/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ").replace(".mp3", "");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


async function displayAlbums() {
    const res = await fetch("songs/index.json");
    const albums = await res.json();
    const cardContainer = document.querySelector(".cardContainer");

    albums.forEach(album => {
        cardContainer.innerHTML += `
            <div data-folder="${album.folder}" class="card">
                <div class="play">
                    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="24" cy="24" r="24" fill="#1ED760"/>
                        <path d="M19 16L33 24L19 32V16Z" fill="black"/>
                    </svg>
                </div>
                <img src="songs/${album.folder}/cover.jpg" alt="">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            </div>`;
    });

    // Add click listeners to load that album's songs
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(card.dataset.folder);
            playMusic(songs[0], true);
        });
    });
}


async function main() {
     await getSongs("karanAujla");
    playMusic(songs[0] , true);

    // display the album in page
    displayAlbums()
    

    // Attach an event listener to play, previous and next
     document.querySelector("#play").addEventListener("click", ()=>{
         if(currentSong.paused){
            currentSong.play()
            console.log( document.querySelector("#play").src)
            document.querySelector("#play").src = "images/pause.svg"
         }else{
            currentSong.pause()
            document.querySelector("#play").src = "images/play.svg"
         }
     })

    // listen for timeupdate in currentsong
    currentSong.addEventListener("timeupdate", ()=>{
        console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/
            ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100  + "%";    
    })

    // event listener to seekbar to scroll the circle
    document.querySelector(".seekbar").addEventListener("click" , (e)=>{
        let percent =  (e.offsetX/e.target.getBoundingClientRect().width)*100 
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent/100)*currentSong.duration ;
    })

    // event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    // event listener to close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })
   
    // event listener to previous and next
previous.addEventListener("click", () => {
    currentSong.pause();

    let currentPath = currentSong.src;
    let currentFile = currentPath.substring(currentPath.lastIndexOf("songs/")); // Extract from "songs/..."

    let index = songs.findIndex(song => song === currentFile);
    console.log("Prev button index:", index, currentFile);

    if (index > 0) {
        playMusic(songs[index - 1]);
    }
});

next.addEventListener("click", () => {
    currentSong.pause();

    let currentPath = currentSong.src;
    let currentFile = currentPath.substring(currentPath.lastIndexOf("songs/")); // Extract from "songs/..."

    let index = songs.findIndex(song => song === currentFile);
    console.log("Next button index:", index, currentFile);

    if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
});



    // event listen to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
          currentSong.volume = parseInt(e.target.value)/100
    })

    // event listener to mute the volume button
    document.querySelector(".volume img").addEventListener("click", e => {
          console.log(e.target.src)
         if(e.target.src.includes("volume.svg")){
           e.target.src =  e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
         }else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
         }
    })

  

}
main();

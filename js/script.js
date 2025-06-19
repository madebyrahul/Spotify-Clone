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

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for(let i = 0; i<as.length; i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all song in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
         songUL.innerHTML += `<li data-file ="${song}"> 
                              
                                <img class="invert" src="images/music.svg" alt="music">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ").replace(".mp3", "")}</div>
                                </div>
                              
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="images/play.svg" alt="play">
                            </div>
                         </li>` ;
    }
    
    // Attach an event listener to each songs
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element =>{
             console.log(e.querySelector(".info").firstElementChild.innerHTML)
            //  playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3");
             playMusic(e.getAttribute("data-file"));
        })
        
    })

    
}

const playMusic = (track , pause = false)=>{
//   let audio = new Audio("/Spotify/songs/" + track);
   currentSong.src = `/${currFolder}/` + track ; 
   if(!pause){
      currentSong.play();
      console.log(  document.querySelector("#play").src)
      document.querySelector("#play").src = "img/pause.svg";
   }
   document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ").replace(".mp3", "");
   document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for(let index = 0; index<array.length; index++){
        const e= array[index];
        
          if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0]
            // get meta data of folder
            let a = await fetch(`/songs/${folder}/info.json`);
             let response = await a.json();
             cardContainer.innerHTML += ` <div data-folder="${folder}" class="card ">
                         <div class="play">
                                   <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Play Button">
                                   <circle cx="24" cy="24" r="24" fill="#1ED760"/>
                                   <path d="M19 16L33 24L19 32V16Z" fill="black"/>
                                   </svg>
                         </div>
                         <img src="/songs/${folder}/cover.jpg" alt="">
                         <h2>${response.title}</h2>
                         <p>${response.description}</p>
                    </div> `
        }
      

    }


    // load the playlist from thr card which is clicked
            Array.from(document.getElementsByClassName("card")).forEach(e =>{
                e.addEventListener("click" , async (item)=>{
                console.log(item , item.target.dataset.folder)
                songs =  await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
        })
    })


}

async function main() {
     await getSongs("songs/karanAujla");
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
    previous.addEventListener("click", () =>{
          currentSong.pause()
          let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
          console.log(songs , index)
          if((index-1) >= 0){
              playMusic(songs[index-1])
          }
    })

    next.addEventListener("click", () =>{
          currentSong.pause()
          let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
          console.log(next)
          console.log(songs , index)
          if((index+1) < songs.length){
              playMusic(songs[index+1])
          }
         
    })

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

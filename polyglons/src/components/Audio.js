import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import '../css/style.css'

const AudioPlayer = () => {
  const songs = ['Flower Garden', 'Overworld', 'Athletic', 'Map'];
  const [songIndex, setSongIndex] = useState(0);
  const [volumeOn, setVolumeOn] = useState(true);
  const audioRef = useRef();

  useEffect(() => {
    if (!audioRef.current) {
      const listener = new THREE.AudioListener();
      const audio = new THREE.Audio(listener);
      audio.onEnded = () => {
        changeSong();
      };
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    const audioLoader = new THREE.AudioLoader();

    if (!audio.isPlaying) {
      audioLoader.load(
        `./audio/Yoshi's Island OST - ${songs[songIndex]}.mp3`,
        (buffer) => {
          audio.setBuffer(buffer);
          audio.setLoop(false);
          audio.setVolume(0.15);
          audio.play();
        }
      );
    }
  }, [songIndex]);

  const changeSong = () => {
    setSongIndex((songIndex + 1) % songs.length);
    audioRef.current.stop(0);
    audioRef.current = null;
  };

  const toggleVolume = () => {
    if (volumeOn) {
      audioRef.current.setVolume(0);
      setVolumeOn(false);
    } else {
      audioRef.current.setVolume(0.15);
      setVolumeOn(true);
    }
  }

  return (
    <>
    <button className="control-button" onClick={changeSong}>
      <img
        src="icons/next-song.svg"
        alt="Change song"
        className="icon"
      />
    </button>
    <button className="control-button" onClick={toggleVolume}>
      <img 
        src={volumeOn ? "icons/sound-on.svg" : "icons/sound-off.svg"}
        alt="Toggle volume"
        className="icon"
      />
    </button>
    </>
  )
};

export default AudioPlayer;

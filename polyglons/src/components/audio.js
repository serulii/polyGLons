import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const AudioPlayer = () => {
  const songs = ['Flower Garden', 'Overworld', 'Athletic', 'Map', 'Big Boss'];
  const [songIndex, setSongIndex] = useState(0);
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

  return <button onClick={changeSong}> change song </button>
};

export default AudioPlayer;

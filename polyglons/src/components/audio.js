import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AudioPlayer = () => {
  const audioRef = useRef();

  useEffect(() => {

    //prevents rerendering from restarting the audio
    if (audioRef.current) return;

    const listener = new THREE.AudioListener();
    const audio = new THREE.Audio(listener);

    audioRef.current = audio;

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
      './audio/Yoshi\'s Island OST - Athletic.mp3',
      function (buffer) {
        audio.setBuffer(buffer);
        audio.setLoop(true);
        audio.setVolume(0.15);
        audio.play();
      }
    );
  });
};

export default AudioPlayer;

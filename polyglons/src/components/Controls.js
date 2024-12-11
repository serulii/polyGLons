import AudioPlayer from "./Audio";
import { useState, useEffect } from "react";

export default function Controls() {
    const [showTutorial, setShowTutorial] = useState(true);

    useEffect(() => {
        if (showTutorial) {
            const timer = setTimeout(() => {
                setShowTutorial(false);
            }, 10000); // 10s
            return () => clearTimeout(timer);
        }
    }, [showTutorial]);

    const handleShowTutorial = () => {
        setShowTutorial(true);
    };

    return (
        <>
        <div className={`tutorial ${showTutorial ? "visible" : "hidden"}`}>
            <p>
                Use 
                <span className="key">W</span>
                <span className="key">A</span>
                <span className="key">S</span>
                <span className="key">D</span>
                 or arrow keys to move the boat around
            </p>
            <p>
                Press <span className="key">E</span> to get on/off an island
            </p>
            <p>
                Use 
                <span className="key">W</span>
                <span className="key">A</span>
                <span className="key">S</span>
                <span className="key">D</span>
                 or arrow keys to move on the islands
            </p>
            <p>
                Press <span className="key">SPACE</span> to regenerate islands
            </p>
        </div>
        <div className='controls'>
            <AudioPlayer />
            <button onClick={handleShowTutorial} className="control-button">
                <img
                    src="/icons/question-mark.svg"
                    alt="Change song"
                    className="icon"
                />
            </button>
        </div>
        </>
    );
}
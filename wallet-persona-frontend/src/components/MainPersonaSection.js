import React, { useState, useRef } from 'react';
import './MainPersonaSection.css'; // We'll create this CSS file next

const MainPersonaSection = ({ persona }) => {
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);
    const audioRef = useRef(null);

    if (!persona) {
        return (
            <div className="main-persona-section">
                <div className="avatar-placeholder">Loading Persona...</div>
            </div>
        );
    }

    const {
        avatarName,
        avatarBio, // This is the short one for under the avatar name
        bio, // This is the main, longer bio, we should use this one primarily
        avatarImageUrl,
        avatarIntroScript,
        avatarVoiceUrl,
    } = persona;

    const handlePlayVoice = () => {
        if (avatarVoiceUrl && audioRef.current) {
            if (isPlayingVoice) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlayingVoice(false);
            } else {
                audioRef.current.play()
                    .then(() => setIsPlayingVoice(true))
                    .catch(err => console.error("Error playing audio:", err));
            }
        } else if (window.speechSynthesis && avatarIntroScript) { // Fallback to browser speech synthesis
            if (isPlayingVoice) {
                window.speechSynthesis.cancel();
                setIsPlayingVoice(false);
            } else {
                const utterance = new SpeechSynthesisUtterance(avatarIntroScript);
                // Optional: Configure voice, rate, pitch if needed
                window.speechSynthesis.cancel(); // Cancel any previous speech
                utterance.onend = () => setIsPlayingVoice(false);
                window.speechSynthesis.speak(utterance);
                setIsPlayingVoice(true);
            }
        }
    };

    if (audioRef.current) {
        audioRef.current.onended = () => {
            setIsPlayingVoice(false);
        };
    }

    return (
        <div className="main-persona-section">
            <div className="persona-avatar-wrapper">
                {avatarImageUrl ? (
                    <img src={avatarImageUrl} className="persona-avatar-image" alt={`${avatarName} avatar`} />
                ) : (
                    <div className="avatar-placeholder-main">No Avatar</div>
                )}
            </div>
            <div className="persona-info-wrapper">
                <h1 className="persona-title">{avatarName || 'Wallet Persona'}</h1>
                <p className="persona-description">{bio || avatarBio || 'A unique on-chain identity.'}</p>

                {(avatarVoiceUrl || avatarIntroScript) && (
                    <button
                        onClick={handlePlayVoice}
                        className={`btn ${isPlayingVoice ? 'btn-danger' : 'btn-primary'} introduce-button mt-3`}
                        disabled={!(avatarVoiceUrl || avatarIntroScript)}
                    >
                        {isPlayingVoice ? (
                            <><i className="fas fa-stop-circle me-2"></i>Stop Intro</>
                        ) : (
                            <><i className="fas fa-play-circle me-2"></i>Meet {avatarName || 'Persona'}</>
                        )}
                    </button>
                )}
                {avatarVoiceUrl && <audio ref={audioRef} src={avatarVoiceUrl} preload="auto" />}
            </div>
        </div>
    );
};

export default MainPersonaSection; 
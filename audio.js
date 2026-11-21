const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playCyberSound(type = 'click') {
    try {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        if (type === 'danger') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1100, now);
            osc.frequency.linearRampToValueAtTime(1850, now + 0.15);
            osc.frequency.linearRampToValueAtTime(1100, now + 0.30);
            osc.frequency.linearRampToValueAtTime(1850, now + 0.45);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
            osc.start(now);
            osc.stop(now + 0.55);
        } else if (type === 'warning') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(1000, now);
            osc.frequency.setValueAtTime(800, now + 0.12);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'clear' || type === 'lock') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.setValueAtTime(1500, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1350, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        }
    } catch (e) {}
}

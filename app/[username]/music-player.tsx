'use client';
import {useEffect,useRef,useState} from 'react';

function fmt(n:number){if(!Number.isFinite(n))return '0:00';const m=Math.floor(n/60),s=Math.floor(n%60);return `${m}:${String(s).padStart(2,'0')}`}
export default function MusicPlayer({title,artist,url,cover}:{title:string;artist:string;url:string;cover?:string|null}){
 const audio=useRef<HTMLAudioElement>(null);const [playing,setPlaying]=useState(false);const [time,setTime]=useState(0);const [duration,setDuration]=useState(0);const [volume,setVolume]=useState(.8);
 useEffect(()=>{if(audio.current)audio.current.volume=volume},[volume]);
 const toggle=async()=>{const a=audio.current;if(!a)return;if(a.paused){try{await a.play();setPlaying(true)}catch{}}else{a.pause();setPlaying(false)}};
 return <div className="m4xPlayer">
  <audio ref={audio} src={url} preload="metadata" onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onLoadedMetadata={e=>setDuration(e.currentTarget.duration)} onEnded={()=>{setPlaying(false);setTime(0)}}/>
  <div className="m4xPlayerTop">{cover?<img className="m4xCover" src={cover} alt="cover"/>:<div className="m4xCover m4xCoverFallback">♫</div>}<div className="m4xTrack"><b>{title||'Music'}</b><small>{artist||'M4X'}</small><span>{playing?'NOW PLAYING':'M4X AUDIO'}</span></div><button className="m4xPlay" onClick={toggle} aria-label={playing?'Tạm dừng':'Phát'}>{playing?'Ⅱ':'▶'}</button></div>
  <div className="m4xProgress"><span>{fmt(time)}</span><input aria-label="Tiến trình" type="range" min="0" max={duration||0} step="0.1" value={Math.min(time,duration||0)} onChange={e=>{const v=Number(e.target.value);if(audio.current)audio.current.currentTime=v;setTime(v)}}/><span>{fmt(duration)}</span></div>
  <div className="m4xVolume"><span>VOL</span><input aria-label="Âm lượng" type="range" min="0" max="1" step="0.05" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></div>
 </div>
}

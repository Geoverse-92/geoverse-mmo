import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [socialSubTab, setSocialSubTab] = useState('soulmates');
  const [position, setPosition] = useState([52.2297, 21.0122]);
  const [gpsActive, setGpsActive] = useState(false);
  const [toast, setToast] = useState(null);
  const mapRef = useRef(null);

  // Profil Gracza
  const [player, setPlayer] = useState({
    name: "PixelHero",
    sprite: "🧙‍♂️",
    classType: "Cyber Mag",
    level: 15,
    gold: 2450,
    gems: 35,
    bio: "Szukam ekipy na rajd po promocje w centrum!",
    hobbies: ["Retro Gaming", "Kawa", "Programowanie"],
    relationshipStatus: "Wolny"
  });

  // Punkty Sklepów / Marek
  const [brandLocations, setBrandLocations] = useState([
    { id: 1, name: "Żabka Quest", pos: [52.2310, 21.0150], icon: "🏪", offer: "-20% na Hot-Dog za 50 Golda", reward: 100, claimed: false },
    { id: 2, name: "Cyber Cafe", pos: [52.2280, 21.0100], icon: "☕", offer: "Darmowy napój przy wejściu", reward: 200, claimed: false },
    { id: 3, name: "Nike Sneaker Spot", pos: [52.2325, 21.0080], icon: "👟", offer: "Unikalny Skin do awatara", reward: 300, claimed: false }
  ]);

  // Bratnie dusze
  const soulmates = [
    { id: 1, name: "NeonQueen", sprite: "🧝‍♀️", level: 18, hobbies: ["Kawa", "Anime", "Muzyka Synth"], match: "94%" },
    { id: 2, name: "RetroGamer99", sprite: "🥷", level: 12, hobbies: ["Retro Gaming", "Programowanie"], match: "88%" },
    { id: 3, name: "CyberSamurai", sprite: "🤖", level: 22, hobbies: ["Krypto", "Kawa", "Vite"], match: "79%" }
  ];

  // Grupy
  const groups = [
    { id: 1, title: "Lokalni Łowcy Okazji", members: 142, desc: "Dzielimy się kodami rabatowymi z okolicy." },
    { id: 2, title: "Pixel Art & Devs", members: 89, desc: "Sztuka pikselowa i tworzenie gier 2D." }
  ];

  // Forum / Blogi
  const [posts, setPosts] = useState([
    { id: 1, author: "System", title: "Witaj w GeoVerse MMORPG!", content: "Projekt skompilowany z Vite + React + Tailwind! Eksploruj mapę, wykonuj questy sklepów i szukaj znajomych w okolicy.", likes: 45 },
    { id: 2, author: "NeonQueen", title: "Najlepsze kawiarnie w sektorze centralnym", content: "Oto lista miejsc, gdzie dostaniecie darmowy boost do energii za zrealizowanie bonu.", likes: 12 }
  ]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // GPS Tracking
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setGpsActive(true);
        },
        () => setGpsActive(false),
        { enableHighAccuracy: true, timeout: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Map Initialization
  useEffect(() => {
    if (activeTab === 'map') {
      const timer = setTimeout(() => {
        const mapContainer = document.getElementById('leaflet-map');
        if (mapContainer && !mapRef.current) {
          const map = L.map('leaflet-map', { zoomControl: false }).setView(position, 15);
          
          // Darmowa mapa OpenStreetMap (bez wymagania klucza API)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
          }).addTo(map);

          // Player Marker
          const playerIcon = L.divIcon({ className: 'pixel-avatar-marker', html: player.sprite });
          const playerMarker = L.marker(position, { icon: playerIcon }).addTo(map);
          playerMarker.bindPopup(`<b>${player.name} (Ty)</b><br/>${player.bio}`);

          // Brand Markers
          brandLocations.forEach(b => {
            const brandIcon = L.divIcon({ className: 'pixel-brand-marker', html: b.icon });
            const m = L.marker(b.pos, { icon: brandIcon }).addTo(map);
            m.bindPopup(`<b>${b.name}</b><br/>${b.offer}<br/><span style="color:#00ffcc">+${b.reward} Gold</span>`);
          });

          mapRef.current = map;
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    }
  }, [activeTab, position]);

  const claimReward = (brand) => {
    if (brand.claimed) {
      showToast("Nagroda już odebrana!");
      return;
    }
    setPlayer(p => ({ ...p, gold: p.gold + brand.reward }));
    setBrandLocations(prev => prev.map(b => b.id === brand.id ? { ...b, claimed: true } : b));
    showToast(`Odebrano +${brand.reward} Golda z ${brand.name}!`);
  };

  const handleAddPost = (e) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;
    setPosts([
      { id: Date.now(), author: player.name, title: newPostTitle, content: newPostContent, likes: 0 },
      ...posts
    ]);
    setNewPostTitle("");
    setNewPostContent("");
    showToast("Wpis został opublikowany!");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black p-0 md:p-2">
      <div className="w-full max-w-md h-full md:h-[880px] bg-[#0d0d1a] border-4 border-[#3a1a5a] flex flex-col justify-between relative overflow-hidden shadow-2xl">
        
        {/* TOAST NOTIFICATION */}
        {toast && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-[#ff00ff] text-white text-[8px] px-3 py-2 border-2 border-white z-50 animate-bounce shadow-lg text-center">
            {toast}
          </div>
        )}

        {/* HEADER / STATS BAR */}
        <header className="bg-[#121224] border-b-2 border-[#3a1a5a] p-2 flex justify-between items-center text-[8px] z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl bg-[#222244] p-1 border border-[#ff00ff]">{player.sprite}</span>
            <div>
              <div className="text-yellow-400 font-bold">{player.name}</div>
              <div className="text-gray-400">LVL {player.level} [{player.classType}]</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[#00ffcc]">💰 {player.gold} Gold</span>
            <span className="text-[#ff00ff]">💎 {player.gems} Gems</span>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          
          {/* MAP TAB */}
          {activeTab === 'map' && (
            <div className="flex flex-col h-full gap-2">
              <div className="flex justify-between items-center text-[8px]">
                <span className="text-[#ff00ff] font-bold">[MAPA ŚWIATA REALNEGO]</span>
                <span className={gpsActive ? "text-emerald-400 font-bold" : "text-amber-400 animate-pulse font-bold"}>
                  {gpsActive ? "● GPS ONLINE" : "○ GPS SYMULACJA"}
                </span>
              </div>

              <div id="leaflet-map" className="h-[280px] w-full border-2 border-[#00ffcc] rounded relative"></div>

              <div className="bg-[#121224] border-2 border-[#3a1a5a] p-2 flex flex-col gap-2">
                <div className="text-[8px] text-yellow-400">🏷️ SPONSOROWANE QUESTY MAREK</div>
                {brandLocations.map(b => (
                  <div key={b.id} className="bg-[#1a1a3a] p-2 border border-[#3a1a5a] flex justify-between items-center text-[7px]">
                    <div>
                      <div className="text-white font-bold">{b.icon} {b.name}</div>
                      <div className="text-gray-400">{b.offer}</div>
                    </div>
                    <button 
                      onClick={() => claimReward(b)}
                      className={`px-2 py-1 font-bold cursor-pointer transition ${b.claimed ? 'bg-gray-600 text-gray-300' : 'bg-[#00ffcc] text-black hover:bg-emerald-400'}`}
                    >
                      {b.claimed ? 'ODEBRANO' : 'ODBIERZ'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AVATAR / PROFILE TAB */}
          {activeTab === 'avatar' && (
            <div className="flex flex-col gap-3 text-[8px]">
              <div className="text-[#ff00ff] font-bold">[KREATOR POSTACI & SIMS PROFILE]</div>
              <div className="bg-[#121224] border-2 border-[#3a1a5a] p-3 flex flex-col items-center gap-2">
                <div className="text-4xl bg-black p-3 border-2 border-[#00ffcc] shadow-[0_0_10px_#00ffcc]">{player.sprite}</div>
                <div className="flex gap-2">
                  {["🧙‍♂️", "🧝‍♀️", "🥷", "🤖", "🧛‍♂️", "👨‍🎤"].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setPlayer({...player, sprite: s})}
                      className="text-lg bg-[#222244] p-1 border border-gray-600 hover:border-[#00ffcc]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#121224] border-2 border-[#3a1a5a] p-3 flex flex-col gap-2">
                <label className="text-gray-400">Nazwa Awatara:</label>
                <input 
                  type="text" 
                  value={player.name} 
                  onChange={(e) => setPlayer({...player, name: e.target.value})}
                  className="bg-black border border-[#3a1a5a] p-1.5 text-[#00ffcc] outline-none"
                />

                <label className="text-gray-400 mt-1">Klasa Postaci:</label>
                <select 
                  value={player.classType} 
                  onChange={(e) => setPlayer({...player, classType: e.target.value})}
                  className="bg-black border border-[#3a1a5a] p-1.5 text-[#00ffcc] outline-none"
                >
                  <option value="Cyber Mag">Cyber Mag</option>
                  <option value="Łowca Okazji">Łowca Okazji</option>
                  <option value="Street Trader">Street Trader</option>
                  <option value="Kolekcjoner">Kolekcjoner</option>
                </select>

                <label className="text-gray-400 mt-1">Status Związku (Bratnia Dusza):</label>
                <input 
                  type="text" 
                  value={player.relationshipStatus} 
                  onChange={(e) => setPlayer({...player, relationshipStatus: e.target.value})}
                  className="bg-black border border-[#3a1a5a] p-1.5 text-[#00ffcc] outline-none"
                />

                <label className="text-gray-400 mt-1">Opis Postaci (Bio):</label>
                <textarea 
                  value={player.bio} 
                  onChange={(e) => setPlayer({...player, bio: e.target.value})}
                  className="bg-black border border-[#3a1a5a] p-1.5 text-[#00ffcc] outline-none h-16"
                />
              </div>
            </div>
          )}

          {/* SOCIAL TAB */}
          {activeTab === 'social' && (
            <div className="flex flex-col gap-3 text-[8px]">
              <div className="flex justify-between border-b border-[#3a1a5a] pb-2 gap-1">
                <button 
                  onClick={() => setSocialSubTab('soulmates')}
                  className={`flex-1 py-1 text-center border ${socialSubTab === 'soulmates' ? 'bg-[#ff00ff] text-white' : 'bg-[#121224] text-gray-400'}`}
                >
                  ❤️ DUSZE
                </button>
                <button 
                  onClick={() => setSocialSubTab('groups')}
                  className={`flex-1 py-1 text-center border ${socialSubTab === 'groups' ? 'bg-[#ff00ff] text-white' : 'bg-[#121224] text-gray-400'}`}
                >
                  👥 GRUPY
                </button>
                <button 
                  onClick={() => setSocialSubTab('forum')}
                  className={`flex-1 py-1 text-center border ${socialSubTab === 'forum' ? 'bg-[#ff00ff] text-white' : 'bg-[#121224] text-gray-400'}`}
                >
                  📝 FORUM
                </button>
              </div>

              {socialSubTab === 'soulmates' && (
                <div className="flex flex-col gap-2">
                  <div className="text-gray-400">Dopasowani gracze w okolicy:</div>
                  {soulmates.map(sm => (
                    <div key={sm.id} className="bg-[#121224] border-2 border-[#ff00ff] p-2 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl bg-black p-1 border border-[#ff00ff]">{sm.sprite}</span>
                        <div>
                          <div className="text-yellow-400 font-bold">{sm.name} (LVL {sm.level})</div>
                          <div className="text-[#00ffcc] text-[6px]">Dopasowanie: {sm.match}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => showToast(`Wysłano wiadomość do ${sm.name}!`)}
                        className="bg-[#ff00ff] text-white px-2 py-1 font-bold hover:bg-pink-600 cursor-pointer"
                      >
                        Czat
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {socialSubTab === 'groups' && (
                <div className="flex flex-col gap-2">
                  {groups.map(g => (
                    <div key={g.id} className="bg-[#121224] border-2 border-[#3a1a5a] p-2">
                      <div className="text-yellow-400 font-bold">{g.title} ({g.members} osób)</div>
                      <div className="text-gray-300 text-[6px] my-1">{g.desc}</div>
                      <button onClick={() => showToast(`Dołączono do grupy: ${g.title}`)} className="bg-[#3a1a5a] text-white px-2 py-1 border border-[#00ffcc] hover:bg-[#4a2a6a] cursor-pointer">Dołącz</button>
                    </div>
                  ))}
                </div>
              )}

              {socialSubTab === 'forum' && (
                <div className="flex flex-col gap-2">
                  <form onSubmit={handleAddPost} className="bg-[#121224] border-2 border-[#3a1a5a] p-2 flex flex-col gap-1.5">
                    <input 
                      type="text" 
                      placeholder="Tytuł..." 
                      value={newPostTitle} 
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="bg-black border border-[#3a1a5a] p-1 text-[#00ffcc] outline-none"
                    />
                    <textarea 
                      placeholder="Treść wpisu..." 
                      value={newPostContent} 
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="bg-black border border-[#3a1a5a] p-1 text-[#00ffcc] outline-none h-10"
                    />
                    <button type="submit" className="bg-[#00ffcc] text-black p-1 font-bold hover:bg-emerald-400 cursor-pointer">Dodaj Wpis</button>
                  </form>

                  {posts.map(p => (
                    <div key={p.id} className="bg-[#121224] border border-[#3a1a5a] p-2">
                      <div className="text-[#ff00ff] font-bold">{p.title}</div>
                      <div className="text-[6px] text-gray-500">Autor: {p.author}</div>
                      <p className="text-gray-300 text-[6px] my-1">{p.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MARKET TAB */}
          {activeTab === 'market' && (
            <div className="flex flex-col gap-2 text-[8px]">
              <div className="text-[#ff00ff] font-bold">[RYNEK & HANDEL PHYGITAL]</div>
              <div className="bg-[#121224] border-2 border-[#3a1a5a] p-2 flex justify-between items-center">
                <div>
                  <div className="text-white font-bold">Voucher Castorama -10%</div>
                  <div className="text-gray-400">Sprzedający: Agent_47</div>
                </div>
                <button onClick={() => showToast("Kupiono Voucher za 150 Gold!")} className="bg-[#00ffcc] text-black px-2 py-1 font-bold hover:bg-emerald-400 cursor-pointer">150 G</button>
              </div>
              <div className="bg-[#121224] border-2 border-[#3a1a5a] p-2 flex justify-between items-center">
                <div>
                  <div className="text-white font-bold">Limitowany Skin: Cyber Sword</div>
                  <div className="text-gray-400">Sprzedający: NeonQueen</div>
                </div>
                <button onClick={() => showToast("Kupiono Przedmiot za 500 Gold!")} className="bg-[#00ffcc] text-black px-2 py-1 font-bold hover:bg-emerald-400 cursor-pointer">500 G</button>
              </div>
            </div>
          )}

        </main>

        {/* BOTTOM NAVBAR */}
        <nav className="bg-[#121224] border-t-2 border-[#3a1a5a] flex justify-around z-10 text-[7px]">
          <button 
            onClick={() => setActiveTab('map')} 
            className={`flex-1 py-3 text-center ${activeTab === 'map' ? 'bg-[#3a1a5a] text-[#00ffcc]' : 'text-gray-400'}`}
          >
            🧭 MAPA
          </button>
          <button 
            onClick={() => setActiveTab('avatar')} 
            className={`flex-1 py-3 text-center ${activeTab === 'avatar' ? 'bg-[#3a1a5a] text-[#00ffcc]' : 'text-gray-400'}`}
          >
            👤 POSTAĆ
          </button>
          <button 
            onClick={() => setActiveTab('social')} 
            className={`flex-1 py-3 text-center ${activeTab === 'social' ? 'bg-[#3a1a5a] text-[#00ffcc]' : 'text-gray-400'}`}
          >
            👥 SOCJAL
          </button>
          <button 
            onClick={() => setActiveTab('market')} 
            className={`flex-1 py-3 text-center ${activeTab === 'market' ? 'bg-[#3a1a5a] text-[#00ffcc]' : 'text-gray-400'}`}
          >
            🎒 RYNEK
          </button>
        </nav>

      </div>
    </div>
  );
}

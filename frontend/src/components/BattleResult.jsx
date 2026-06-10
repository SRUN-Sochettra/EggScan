import React from 'react';

export default function BattleResult({ data }) {
    const isU1Winner = data.winnerUsername === data.user1.username;

    return (
        <div className="space-y-5 mt-10 animate-[pop_0.4s_ease-out]">
            <div className="card p-6 bg-gradient-to-br from-[#FFFDF7] to-[#FCE9B8] border-4 border-brown-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">🥊</div>
                <h2 className="font-display font-black text-3xl text-center text-brown-700 mb-6 uppercase tracking-wider">Battle Report</h2>

                <p className="text-brown-700 text-lg leading-relaxed mb-8 italic text-center font-medium bg-white/50 p-4 rounded-xl shadow-inner">
                    "{data.battleReport}"
                </p>

                <div className="flex flex-col sm:flex-row gap-6 items-stretch justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden sm:flex">
                         <span className="bg-brown-700 text-white font-black font-display p-2 rounded-full z-10 shadow-lg border-2 border-white">VS</span>
                    </div>

                    <PlayerCard user={data.user1} isWinner={isU1Winner} />
                    <PlayerCard user={data.user2} isWinner={!isU1Winner} />
                </div>
            </div>
        </div>
    );
}

function PlayerCard({ user, isWinner }) {
    return (
        <div className={`flex-1 rounded-2xl p-4 flex flex-col items-center text-center transition-transform ${isWinner ? 'bg-yolk shadow-lg scale-105 z-10 border-4 border-brown-700' : 'bg-white/60 opacity-80 border-2 border-brown-300'}`}>
            {isWinner && <div className="text-3xl mb-2 animate-bounce">👑</div>}
            <img src={user.avatarUrl} alt="" className={`w-20 h-20 rounded-full mb-3 shadow-md ${isWinner ? 'border-4 border-white' : 'border-2 border-brown-400 grayscale'}`} />
            <h3 className="font-display font-bold text-xl text-brown-700 truncate w-full">{user.username}</h3>
            <div className="text-brown-600 font-medium my-2 bg-white/50 px-3 py-1 rounded-full">Score: {user.eggScore}</div>
            <div className="mt-auto pt-3 flex gap-2">
                 <span className="text-xl">{user.eggEmoji}</span>
                 <span className="text-xs font-bold text-brown-500 uppercase tracking-wider self-center">{user.eggVerdict}</span>
            </div>
        </div>
    );
}

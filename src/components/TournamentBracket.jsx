import React, { useState } from 'react';
import { Trophy, Check, Eye, ArrowLeft, Users, Play } from 'lucide-react';
import SpectatorView from './SpectatorView';
import MatchHistoryModal from './MatchHistoryModal';

export default function TournamentBracket({ 
  tournament, 
  myPeerId, 
  onReadyForMatch, 
  onLeaveTournament 
}) {
  const [selectedSpectateMatch, setSelectedSpectateMatch] = useState(null);
  const [selectedHistoryMatch, setSelectedHistoryMatch] = useState(null);

  const { matches = [], currentRound = 1, totalRounds = 2 } = tournament;

  // Find user's current upcoming match
  const myMatch = matches.find(m => 
    !m.completed && (m.p1?.id === myPeerId || m.p2?.id === myPeerId)
  );

  const isMyReady = myMatch?.readyIds?.includes(myPeerId);
  const readyCount = myMatch?.readyIds?.length || 0;

  const handleMatchCardClick = (m) => {
    if (m.completed) {
      setSelectedHistoryMatch(m);
    } else if (m.p1 && m.p2 && !m.completed) {
      setSelectedSpectateMatch(m);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '14px 24px',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy color="#eab308" size={24} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffffff' }}>
            Турнирная Сетка (Single Elimination)
          </h2>
        </div>

        <button
          className="btn-marvel btn-marvel-danger"
          onClick={onLeaveTournament}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Покинуть Турнир
        </button>
      </div>

      {/* Ready Banner / Status Bar */}
      {myMatch ? (
        <div className="pop-in" style={{
          marginBottom: '24px',
          padding: '16px 24px',
          borderRadius: '16px',
          background: 'rgba(234, 179, 8, 0.15)',
          border: '1.5px solid #eab308',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fef08a' }}>
              ⚔️ Твой следующий матч: {myMatch.p1?.nickname} vs {myMatch.p2?.nickname || 'Ожидание соперника...'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
              Готовность к матчу: <strong style={{ color: '#fff' }}>({readyCount} / 2)</strong>
            </div>
          </div>

          <button
            className={`btn-marvel ${isMyReady ? 'btn-marvel-secondary' : 'btn-marvel-gold'}`}
            disabled={!myMatch.p1 || !myMatch.p2}
            onClick={() => onReadyForMatch(myMatch.id)}
            style={{ padding: '12px 24px', fontSize: '1rem' }}
          >
            {isMyReady ? '✓ Вы готовы' : '⚔️ Я готов к матчу'}
          </button>
        </div>
      ) : (
        <div style={{
          marginBottom: '24px',
          padding: '14px 20px',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#94a3b8',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          ⏳ Ожидание завершения остальных матчей текущего раунда... Нажмите на любой матч, чтобы смотреть трансляцию!
        </div>
      )}

      {/* Bracket Grid */}
      <div className="glass-panel" style={{
        flex: 1,
        padding: '32px 24px',
        overflowX: 'auto',
        display: 'flex',
        gap: '40px',
        justifyContent: 'center',
        alignItems: 'stretch'
      }}>
        {/* Render Rounds Columns */}
        {Array.from({ length: totalRounds }).map((_, rIdx) => {
          const roundNum = rIdx + 1;
          const roundMatches = matches.filter(m => m.round === roundNum);
          const roundTitle = totalRounds === 2 
            ? (roundNum === 1 ? 'Полуфинал' : 'Финал') 
            : (roundNum === 1 ? '1/4 Финала' : roundNum === 2 ? 'Полуфинал' : 'Финал');

          return (
            <div key={roundNum} style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              minWidth: '220px',
              maxWidth: '260px'
            }}>
              <div style={{
                textAlign: 'center',
                fontWeight: '900',
                fontSize: '1rem',
                color: '#eab308',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                ● {roundTitle}
              </div>

              {roundMatches.map(m => {
                const isFinished = m.completed;
                const isInProgress = m.p1 && m.p2 && !m.completed;

                return (
                  <div
                    key={m.id}
                    onClick={() => handleMatchCardClick(m)}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: isFinished 
                        ? 'rgba(34, 197, 94, 0.1)' 
                        : isInProgress 
                        ? 'rgba(234, 179, 8, 0.1)' 
                        : 'rgba(255, 255, 255, 0.04)',
                      border: `1.5px solid ${isFinished ? '#22c55e' : isInProgress ? '#eab308' : 'rgba(255, 255, 255, 0.12)'}`,
                      cursor: (isFinished || isInProgress) ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                      margin: '10px 0'
                    }}
                  >
                    {/* Player 1 Slot */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontWeight: m.winner === 1 ? '900' : '600',
                        color: m.winner === 1 ? '#4ade80' : m.p1 ? '#ffffff' : '#64748b',
                        fontSize: '0.9rem'
                      }}>
                        {m.p1 ? m.p1.nickname : '...'}
                      </span>
                      <span style={{ fontWeight: '900', fontSize: '0.95rem', color: '#fef08a' }}>
                        {m.completed ? m.p1Score : '-'}
                      </span>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '6px 0' }} />

                    {/* Player 2 Slot */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontWeight: m.winner === 2 ? '900' : '600',
                        color: m.winner === 2 ? '#4ade80' : m.p2 ? '#ffffff' : '#64748b',
                        fontSize: '0.9rem'
                      }}>
                        {m.p2 ? m.p2.nickname : '...'}
                      </span>
                      <span style={{ fontWeight: '900', fontSize: '0.95rem', color: '#fef08a' }}>
                        {m.completed ? m.p2Score : '-'}
                      </span>
                    </div>

                    {/* Badge */}
                    <div style={{
                      marginTop: '8px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      textAlign: 'right',
                      color: isFinished ? '#4ade80' : isInProgress ? '#fef08a' : '#64748b'
                    }}>
                      {isFinished ? '👁️ Смотреть итоги' : isInProgress ? '🔴 Идет матч (Зритель)' : 'Ожидание...'}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Spectator View Modal */}
      {selectedSpectateMatch && (
        <SpectatorView
          matchData={selectedSpectateMatch}
          onBack={() => setSelectedSpectateMatch(null)}
        />
      )}

      {/* History Modal for Finished Match */}
      {selectedHistoryMatch && (
        <MatchHistoryModal
          history={selectedHistoryMatch.history || []}
          player1={selectedHistoryMatch.p1}
          player2={selectedHistoryMatch.p2}
          onClose={() => setSelectedHistoryMatch(null)}
        />
      )}
    </div>
  );
}

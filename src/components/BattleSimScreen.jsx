import React, { useState, useEffect } from 'react';
import { Play, FastForward, SkipForward, Trophy, ArrowLeft, ListFilter } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getRoleById } from '../data/roles';
import MatchHistoryModal from './MatchHistoryModal';

export default function BattleSimScreen({ 
  player1, 
  player2, 
  p1Draft, 
  p2Draft, 
  roles, 
  roomCode,
  onMatchComplete, 
  onLeaveMatch 
}) {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  
  const [p1CurrentStat, setP1CurrentStat] = useState(0);
  const [p2CurrentStat, setP2CurrentStat] = useState(0);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [matchCompleted, setMatchCompleted] = useState(false);
  
  const [roundHistory, setRoundHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const activeRoleId = roles[currentRoundIdx];
  const activeRole = getRoleById(activeRoleId);

  const p1Char = p1Draft[activeRoleId];
  const p2Char = p2Draft[activeRoleId];

  // Setup current round stats
  useEffect(() => {
    if (p1Char && p2Char && !roundCompleted) {
      setP1CurrentStat(p1Char.stats[activeRoleId] || 0);
      setP2CurrentStat(p2Char.stats[activeRoleId] || 0);
    }
  }, [currentRoundIdx, p1Char, p2Char]);

  // Smooth Tick Down Animation (-10 pts / 10ms = 1000 pts/sec)
  useEffect(() => {
    let interval = null;
    if (isSimulating && !roundCompleted) {
      interval = setInterval(() => {
        setP1CurrentStat((prev1) => {
          const next1 = Math.max(0, prev1 - 10);
          return next1;
        });

        setP2CurrentStat((prev2) => {
          const next2 = Math.max(0, prev2 - 10);
          if (next2 === 0 || p1CurrentStat <= 10) {
            clearInterval(interval);
            setIsSimulating(false);
            setRoundCompleted(true);
            resolveRoundOutcome(Math.max(0, p1CurrentStat - 10), next2);
          }
          return next2;
        });
      }, 15);
    }
    return () => clearInterval(interval);
  }, [isSimulating, roundCompleted, p1CurrentStat]);

  const resolveRoundOutcome = (finalP1, finalP2) => {
    let winner = 0; // 0 tie, 1 P1, 2 P2
    if (finalP1 > finalP2) {
      winner = 1;
      setP1Score(s => s + 1);
    } else if (finalP2 > finalP1) {
      winner = 2;
      setP2Score(s => s + 1);
    }

    const p1Init = p1Char?.stats[activeRoleId] || 0;
    const p2Init = p2Char?.stats[activeRoleId] || 0;

    setRoundHistory(prev => [
      ...prev,
      {
        roundIdx: currentRoundIdx,
        roleId: activeRoleId,
        p1Char,
        p2Char,
        p1InitStat: p1Init,
        p2InitStat: p2Init,
        p1FinalStat: finalP1,
        p2FinalStat: finalP2,
        winner
      }
    ]);
  };

  const handleStartRound = () => {
    if (roundCompleted || isSimulating) return;
    setIsSimulating(true);
  };

  const handleSkipRound = () => {
    if (roundCompleted) return;
    setIsSimulating(false);
    
    const p1Init = p1Char?.stats[activeRoleId] || 0;
    const p2Init = p2Char?.stats[activeRoleId] || 0;

    let finalP1 = 0;
    let finalP2 = 0;

    if (p1Init > p2Init) {
      finalP1 = p1Init - p2Init;
      finalP2 = 0;
    } else if (p2Init > p1Init) {
      finalP1 = 0;
      finalP2 = p2Init - p1Init;
    } else {
      finalP1 = 0;
      finalP2 = 0;
    }

    setP1CurrentStat(finalP1);
    setP2CurrentStat(finalP2);
    setRoundCompleted(true);
    resolveRoundOutcome(finalP1, finalP2);
  };

  const handleNextRound = () => {
    if (currentRoundIdx + 1 < roles.length) {
      setCurrentRoundIdx(prev => prev + 1);
      setRoundCompleted(false);
      setIsSimulating(false);
    } else {
      // Match Finished!
      setMatchCompleted(true);
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch(e){}
    }
  };

  const handleSkipAll = () => {
    setIsSimulating(false);
    let s1 = p1Score;
    let s2 = p2Score;
    const historyAcc = [...roundHistory];

    for (let i = currentRoundIdx; i < roles.length; i++) {
      const rId = roles[i];
      const char1 = p1Draft[rId];
      const char2 = p2Draft[rId];
      const init1 = char1?.stats[rId] || 0;
      const init2 = char2?.stats[rId] || 0;

      let f1 = 0, f2 = 0, win = 0;
      if (init1 > init2) {
        f1 = init1 - init2; f2 = 0; win = 1; s1++;
      } else if (init2 > init1) {
        f1 = 0; f2 = init2 - init1; win = 2; s2++;
      }

      historyAcc.push({
        roundIdx: i,
        roleId: rId,
        p1Char: char1,
        p2Char: char2,
        p1InitStat: init1,
        p2InitStat: init2,
        p1FinalStat: f1,
        p2FinalStat: f2,
        winner: win
      });
    }

    setP1Score(s1);
    setP2Score(s2);
    setRoundHistory(historyAcc);
    setCurrentRoundIdx(roles.length - 1);
    setRoundCompleted(true);
    setMatchCompleted(true);
    try { confetti({ particleCount: 120, spread: 80 }); } catch(e){}
  };

  const winnerPlayer = p1Score > p2Score ? player1 : p2Score > p1Score ? player2 : null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      position: 'relative'
    }}>
      {/* Header with Match Score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '12px 24px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <button
          className="btn-marvel btn-marvel-secondary"
          onClick={onLeaveMatch}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Назад
        </button>

        {/* Score Board */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          fontFamily: 'var(--font-heading)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444' }}>
              {player1.nickname}
            </span>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: '900',
              padding: '2px 14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ffffff',
              border: '1px solid #ef4444'
            }}>
              {p1Score}
            </span>
          </div>

          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#eab308' }}>VS</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: '900',
              padding: '2px 14px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#ffffff',
              border: '1px solid #3b82f6'
            }}>
              {p2Score}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#3b82f6' }}>
              {player2.nickname}
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700' }}>
          Раунд {currentRoundIdx + 1} из {roles.length}
        </div>
      </div>

      {/* Top Player 1 Team Cards Strip */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '16px',
        overflowX: 'auto',
        padding: '4px'
      }}>
        {roles.map((rId, idx) => {
          const char = p1Draft[rId];
          const isActive = idx === currentRoundIdx;
          return (
            <div key={rId} style={{
              padding: '6px 12px',
              borderRadius: '10px',
              background: isActive ? 'rgba(229, 9, 20, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: `1.5px solid ${isActive ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: idx < currentRoundIdx ? 0.6 : 1
            }}>
              <img src={char?.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>
                {char?.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Battle Arena (Center Duel) */}
      <div className="glass-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        position: 'relative'
      }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: '800',
          color: activeRole?.color,
          marginBottom: '24px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          ● Раунд {currentRoundIdx + 1} — {activeRole?.name} ({activeRole?.icon})
        </div>

        <div style={{
          width: '100%',
          maxWidth: '720px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '32px',
          alignItems: 'center'
        }}>
          {/* Player 1 Hero Fighter */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '130px',
              height: '130px',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '3px solid #ef4444',
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
              marginBottom: '16px'
            }}>
              <img src={p1Char?.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: p1CurrentStat === 0 ? '#64748b' : '#ffffff',
              fontFamily: 'var(--font-heading)'
            }}>
              {p1CurrentStat}
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
              {p1Char?.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
              {player1.nickname}
            </div>
          </div>

          {/* VS Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(234, 179, 8, 0.15)',
            border: '2px solid #eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: '900',
            color: '#eab308'
          }}>
            VS
          </div>

          {/* Player 2 Hero Fighter */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '130px',
              height: '130px',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '3px solid #3b82f6',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
              marginBottom: '16px'
            }}>
              <img src={p2Char?.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: p2CurrentStat === 0 ? '#64748b' : '#ffffff',
              fontFamily: 'var(--font-heading)'
            }}>
              {p2CurrentStat}
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
              {p2Char?.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
              {player2.nickname}
            </div>
          </div>
        </div>

        {/* Round Outcome Result Banner */}
        {roundCompleted && (
          <div className="pop-in" style={{
            marginTop: '28px',
            padding: '10px 24px',
            borderRadius: '20px',
            background: 'rgba(9, 12, 25, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '1rem',
            fontWeight: '800',
            color: '#fef08a'
          }}>
            {p1CurrentStat > p2CurrentStat 
              ? `🏆 ${p1Char?.name} (${player1.nickname}) побеждает в раунде (+1)!` 
              : p2CurrentStat > p1CurrentStat 
              ? `🏆 ${p2Char?.name} (${player2.nickname}) побеждает в раунде (+1)!` 
              : '🤝 Ничья в раунде! (0 очков)'}
          </div>
        )}
      </div>

      {/* Bottom Player 2 Team Cards Strip */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginTop: '16px',
        overflowX: 'auto',
        padding: '4px'
      }}>
        {roles.map((rId, idx) => {
          const char = p2Draft[rId];
          const isActive = idx === currentRoundIdx;
          return (
            <div key={rId} style={{
              padding: '6px 12px',
              borderRadius: '10px',
              background: isActive ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: `1.5px solid ${isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: idx < currentRoundIdx ? 0.6 : 1
            }}>
              <img src={char?.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>
                {char?.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Room Code Footer Pill */}
      {roomCode && (
        <div 
          onClick={() => navigator.clipboard.writeText(roomCode)}
          style={{
            marginTop: '12px',
            alignSelf: 'center',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '20px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px dashed rgba(234, 179, 8, 0.5)',
            color: '#fef08a',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🔑 Код комнаты: <strong>{roomCode}</strong> (нажмите, чтобы скопировать)
        </div>
      )}

      {/* Control Buttons Bar */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        {!roundCompleted ? (
          <>
            <button
              className="btn-marvel btn-marvel-gold"
              onClick={handleStartRound}
              disabled={isSimulating}
              style={{ padding: '14px 28px' }}
            >
              <Play size={18} /> {isSimulating ? 'Идет бой...' : 'Старт'}
            </button>

            <button
              className="btn-marvel btn-marvel-secondary"
              onClick={handleSkipRound}
              disabled={isSimulating}
              style={{ padding: '14px 24px' }}
            >
              <FastForward size={18} /> Пропустить раунд
            </button>
          </>
        ) : (
          <button
            className="btn-marvel btn-marvel-gold pop-in"
            onClick={handleNextRound}
            style={{ padding: '14px 32px' }}
          >
            {currentRoundIdx + 1 < roles.length ? 'Следующий раунд ▶' : 'Завершить матч!'}
          </button>
        )}

        <button
          className="btn-marvel btn-marvel-secondary"
          onClick={handleSkipAll}
          style={{ padding: '14px 24px' }}
        >
          <SkipForward size={18} /> Пропустить всё
        </button>
      </div>

      {/* Match Completed Overlay */}
      {matchCompleted && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-modal pop-in" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '36px',
            textAlign: 'center'
          }}>
            <Trophy size={60} color="#eab308" style={{ marginBottom: '16px' }} />

            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>
              Битва Завершена!
            </h2>

            <div style={{
              fontSize: '1.4rem',
              fontWeight: '800',
              color: '#fef08a',
              marginBottom: '16px'
            }}>
              Итоговый счет: {p1Score} — {p2Score}
            </div>

            <div style={{
              padding: '12px 20px',
              borderRadius: '16px',
              background: winnerPlayer ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
              border: `1px solid ${winnerPlayer ? '#22c55e' : '#eab308'}`,
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: '800',
              marginBottom: '28px'
            }}>
              {winnerPlayer ? `🎉 Победитель: ${winnerPlayer.nickname}!` : '🤝 Ничья в матче!'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="btn-marvel btn-marvel-gold"
                onClick={() => setShowHistoryModal(true)}
                style={{ width: '100%', padding: '14px' }}
              >
                <ListFilter size={18} /> Результаты боёв
              </button>

              <button
                className="btn-marvel btn-marvel-primary"
                onClick={() => onMatchComplete(winnerPlayer)}
                style={{ width: '100%', padding: '14px' }}
              >
                Главное меню
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match History Modal */}
      {showHistoryModal && (
        <MatchHistoryModal
          history={roundHistory}
          player1={player1}
          player2={player2}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}

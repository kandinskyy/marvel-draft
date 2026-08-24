import React, { useState, useEffect } from 'react';
import { Clock, Shield, Sparkles, SkipForward, Play, ArrowLeft } from 'lucide-react';
import { MARVEL_CHARACTERS } from '../data/marvelCharacters';
import { getRoleById } from '../data/roles';

export default function DraftScreen({ 
  player1, 
  player2, 
  myPeerId, 
  settings, 
  draftState, 
  onDraftAction, 
  onSimulateBattle, 
  onLeaveMatch 
}) {
  const [drawnChar, setDrawnChar] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);

  const activeRoles = settings?.roles || ['captain', 'strength', 'intelligence', 'magic', 'ranged', 'agility', 'sum'];
  const totalSlots = activeRoles.length;

  const currentTurnPlayer = draftState.turn === 1 ? player1 : player2;
  const isMyTurn = currentTurnPlayer.id === myPeerId;

  const p1Draft = draftState.p1Draft || {}; // { roleId: charObj }
  const p2Draft = draftState.p2Draft || {};

  const p1Completed = Object.keys(p1Draft).length === totalSlots;
  const p2Completed = Object.keys(p2Draft).length === totalSlots;
  const draftFinished = p1Completed && p2Completed;

  // 60s Turn Timer
  useEffect(() => {
    if (draftFinished || !draftState.turn) return;

    setTimeLeft(60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto fallback if timer runs out!
          if (isMyTurn && drawnChar) {
            autoAssignFirstAvailableRole();
          } else if (isMyTurn && !drawnChar) {
            handleDrawClick();
          }
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [draftState.turn, draftState.currentStep, draftFinished]);

  const handleDrawClick = () => {
    if (!isMyTurn || draftFinished) return;

    // Pick random unassigned character from available pool
    const usedCharIds = new Set([
      ...Object.values(p1Draft).map(c => c.id),
      ...Object.values(p2Draft).map(c => c.id)
    ]);
    const availablePool = MARVEL_CHARACTERS.filter(c => !usedCharIds.has(c.id));

    if (availablePool.length === 0) return;

    const randomChar = availablePool[Math.floor(Math.random() * availablePool.length)];
    setDrawnChar(randomChar);
    onDraftAction('DRAW_CHAR', { char: randomChar });
  };

  const autoAssignFirstAvailableRole = () => {
    if (!drawnChar) return;
    const myDraft = draftState.turn === 1 ? p1Draft : p2Draft;
    const freeRole = activeRoles.find(rId => !myDraft[rId]);
    if (freeRole) {
      handleAssignRole(freeRole);
    }
  };

  const handleAssignRole = (roleId) => {
    if (!drawnChar || !isMyTurn) return;

    onDraftAction('ASSIGN_ROLE', {
      playerTurn: draftState.turn,
      roleId,
      char: drawnChar
    });

    setDrawnChar(null);
  };

  const handlePass = () => {
    const myPasses = draftState.turn === 1 ? draftState.p1Passes : draftState.p2Passes;
    if (!isMyTurn || myPasses <= 0) return;

    onDraftAction('PASS_CHAR', { playerTurn: draftState.turn });
    setDrawnChar(null);
  };

  const currentPassesLeft = draftState.turn === 1 ? draftState.p1Passes : draftState.p2Passes;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      position: 'relative'
    }}>
      {/* Top Header & Turn Timer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
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

        {/* Current Turn Indicator & Timer */}
        {!draftFinished ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: draftState.turn === 1 ? 'rgba(229, 9, 20, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${draftState.turn === 1 ? '#ef4444' : '#3b82f6'}`,
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '1rem'
            }}>
              ⚡ Ход: {currentTurnPlayer.nickname} {isMyTurn && '(Вы)'}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: timeLeft <= 10 ? '#ef4444' : '#fef08a',
              fontWeight: '800',
              fontSize: '1.1rem'
            }}>
              <Clock size={18} className={timeLeft <= 10 ? 'pulse-glow' : ''} /> {timeLeft}с
            </div>
          </div>
        ) : (
          <div style={{
            color: '#4ade80',
            fontWeight: '900',
            fontSize: '1.2rem',
            letterSpacing: '1px'
          }}>
            ✓ ДРАФТ ЗАВЕРШЕН! ГОТОВЫ К БОЮ!
          </div>
        )}

        <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
          Пропуски: P1 ({draftState.p1Passes}) | P2 ({draftState.p2Passes})
        </div>
      </div>

      {/* Main Draft Board (Player 1 vs Player 2) */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Player 1 Team Slots Column */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            marginBottom: '14px',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🛡️ {player1.nickname}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeRoles.map(roleId => {
              const role = getRoleById(roleId);
              const char = p1Draft[roleId];
              return (
                <div key={roleId} style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: char ? 'rgba(229, 9, 20, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${char ? 'rgba(229, 9, 20, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {char ? (
                    <img 
                      src={char.avatar} 
                      alt={char.name} 
                      style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>
                      {role.icon}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: role.color, fontWeight: '800', textTransform: 'uppercase' }}>
                      {role.name}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: char ? '#ffffff' : '#64748b' }}>
                      {char ? char.name : 'Не выбрано'}
                    </div>
                  </div>

                  {char && (
                    <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#fef08a' }}>
                      {char.stats[roleId]} pts
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Action (Draw Button or Simulate Battle Button) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '900',
            color: '#eab308',
            fontFamily: 'var(--font-heading)'
          }}>
            VS
          </div>

          {!draftFinished ? (
            <button
              className="btn-marvel btn-marvel-gold pulse-glow"
              disabled={!isMyTurn || !!drawnChar}
              onClick={handleDrawClick}
              style={{
                padding: '20px 32px',
                fontSize: '1.2rem',
                borderRadius: '16px'
              }}
            >
              <Sparkles size={24} /> {isMyTurn ? 'Взять карту' : `Ход ${currentTurnPlayer.nickname}`}
            </button>
          ) : (
            <button
              className="btn-marvel btn-marvel-primary pop-in"
              onClick={onSimulateBattle}
              style={{
                padding: '22px 36px',
                fontSize: '1.3rem',
                borderRadius: '18px',
                boxShadow: '0 0 30px rgba(229, 9, 20, 0.6)'
              }}
            >
              <Play size={26} /> ⚔️ Симулировать сражение
            </button>
          )}
        </div>

        {/* Player 2 Team Slots Column */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            marginBottom: '14px',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🛡️ {player2.nickname}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeRoles.map(roleId => {
              const role = getRoleById(roleId);
              const char = p2Draft[roleId];
              return (
                <div key={roleId} style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: char ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${char ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {char ? (
                    <img 
                      src={char.avatar} 
                      alt={char.name} 
                      style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>
                      {role.icon}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: role.color, fontWeight: '800', textTransform: 'uppercase' }}>
                      {role.name}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: char ? '#ffffff' : '#64748b' }}>
                      {char ? char.name : 'Не выбрано'}
                    </div>
                  </div>

                  {char && (
                    <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#fef08a' }}>
                      {char.stats[roleId]} pts
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drawn Character & Role Assignment Modal */}
      {drawnChar && isMyTurn && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-modal pop-in" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              margin: '0 auto 16px',
              border: '3px solid #eab308',
              overflow: 'hidden',
              boxShadow: '0 0 25px rgba(234, 179, 8, 0.4)'
            }}>
              <img 
                src={drawnChar.avatar} 
                alt={drawnChar.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff', marginBottom: '4px' }}>
              {drawnChar.name}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>
              {drawnChar.origName}
            </p>

            {/* Tags */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {drawnChar.tags.map(tag => (
                <span key={tag} className="marvel-tag">
                  {tag}
                </span>
              ))}
            </div>

            <p style={{ fontSize: '0.9rem', color: '#fef08a', fontWeight: '700', marginBottom: '14px' }}>
              Назначьте роль для {drawnChar.name}:
            </p>

            {/* Role Buttons Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {activeRoles.map(roleId => {
                const role = getRoleById(roleId);
                const myDraft = draftState.turn === 1 ? p1Draft : p2Draft;
                const isTaken = !!myDraft[roleId];

                return (
                  <button
                    key={roleId}
                    disabled={isTaken}
                    className="btn-marvel btn-marvel-secondary"
                    onClick={() => handleAssignRole(roleId)}
                    style={{
                      padding: '12px 8px',
                      flexDirection: 'column',
                      gap: '4px',
                      borderColor: isTaken ? 'rgba(255,255,255,0.05)' : role.color,
                      opacity: isTaken ? 0.3 : 1
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{role.icon}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{role.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#fef08a', fontWeight: '700' }}>
                      {drawnChar.stats[roleId]} pts
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pass Button */}
            <button
              className="btn-marvel btn-marvel-gold"
              disabled={currentPassesLeft <= 0}
              onClick={handlePass}
              style={{ width: '100%', padding: '14px' }}
            >
              <SkipForward size={18} /> Пропустить героя ({currentPassesLeft} осталось)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

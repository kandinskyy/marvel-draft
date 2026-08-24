import React, { useState } from 'react';
import { Copy, Check, Users, Eye, Crown, LogOut, Play } from 'lucide-react';
import { getRoleById } from '../data/roles';

export default function Lobby({ 
  roomCode, 
  isHost, 
  myPeerId, 
  players, 
  spectators, 
  settings, 
  onToggleReady, 
  onSwitchRole, 
  onLeaveRoom, 
  onStartGame 
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const targetPlayerCount = settings?.mode === '1v1' ? 2 : settings?.mode === 'tournament_4' ? 4 : 8;
  const isPlayer = players.some(p => p.id === myPeerId);
  const myPlayerObj = players.find(p => p.id === myPeerId);
  const isReady = myPlayerObj?.ready || false;

  const allPlayersReady = players.length === targetPlayerCount && players.every(p => p.ready);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div className="glass-modal pop-in" style={{
        width: '100%',
        maxWidth: '620px',
        padding: '36px 32px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Top Header Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(234, 179, 8, 0.15)',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          borderRadius: '30px',
          color: '#fef08a',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          ● {settings?.mode === '1v1' ? 'MATCH LOBBY' : 'TOURNAMENT LOBBY'}
        </div>

        {/* Network Status Badge */}
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '800',
          color: '#4ade80',
          marginBottom: '12px',
          letterSpacing: '0.5px'
        }}>
          🌐 Сеть: Подключено к серверу комнат
        </div>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '900',
          marginBottom: '4px',
          color: '#ffffff'
        }}>
          Ожидание участников
        </h2>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
          Присоединилось игроков: <strong style={{ color: '#ffffff' }}>{players.length} / {targetPlayerCount}</strong>
        </p>

        {/* Room Code Display Pill */}
        <div 
          onClick={copyCode}
          style={{
            background: 'rgba(9, 12, 25, 0.9)',
            borderRadius: '20px',
            padding: '20px 24px',
            cursor: 'pointer',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '28px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '2px dashed rgba(234, 179, 8, 0.5)',
            width: '100%',
            maxWidth: '380px',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            letterSpacing: '8px',
            color: '#fef08a',
            fontFamily: 'var(--font-heading)'
          }}>
            {roomCode}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: copied ? '#4ade80' : '#94a3b8',
            fontWeight: '600'
          }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Код скопирован в буфер!' : 'Нажмите, чтобы скопировать код'}
          </div>
        </div>

        {/* Player List */}
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#94a3b8',
            marginBottom: '10px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Users size={16} color="var(--primary)" /> Игроки ({players.length}/{targetPlayerCount})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: targetPlayerCount }).map((_, idx) => {
              const player = players[idx];
              if (!player) {
                return (
                  <div key={idx} style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Слот #{idx + 1}: Ожидание игрока...</span>
                  </div>
                );
              }

              const isMe = player.id === myPeerId;

              return (
                <div key={player.id} style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isMe ? 'rgba(229, 9, 20, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${isMe ? 'rgba(229, 9, 20, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {player.isHost && <Crown size={18} color="#eab308" />}
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff' }}>
                      {player.nickname} {isMe && <span style={{ color: '#f87171', fontSize: '0.8rem' }}>(Вы)</span>}
                    </span>
                  </div>

                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    background: player.ready ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                    color: player.ready ? '#4ade80' : '#fef08a',
                    border: `1px solid ${player.ready ? '#22c55e' : '#eab308'}`
                  }}>
                    {player.ready ? '✓ Готов' : '⏳ Не готов'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spectators List */}
        {spectators && spectators.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#94a3b8',
              marginBottom: '8px',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Eye size={16} color="#06b6d4" /> Зрители ({spectators.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {spectators.map(s => (
                <span key={s.id} className="marvel-tag" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9' }}>
                  👁️ {s.nickname} {s.id === myPeerId && '(Вы)'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Match Settings Summary */}
        <div style={{
          padding: '14px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div><strong>Формат:</strong> {settings?.mode === '1v1' ? '1 на 1' : settings?.mode === 'tournament_4' ? 'Турнир (4 игрока)' : 'Турнир (8 игроков)'}</div>
          <div><strong>Роли:</strong> {settings?.roles?.map(rId => getRoleById(rId)?.name).join(', ')}</div>
          <div><strong>Пропуски:</strong> {settings?.passes} на игрока</div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isPlayer && (
            <button
              className={`btn-marvel ${isReady ? 'btn-marvel-secondary' : 'btn-marvel-gold'}`}
              onClick={onToggleReady}
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
            >
              {isReady ? 'Отменить готовность' : '✓ Маркировать как Готов'}
            </button>
          )}

          {isHost && (
            <button
              className="btn-marvel btn-marvel-primary"
              disabled={!allPlayersReady}
              onClick={onStartGame}
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            >
              <Play size={20} /> {allPlayersReady ? 'Начать Драфт!' : 'Ожидание готовности игроков...'}
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-marvel btn-marvel-secondary"
              onClick={onSwitchRole}
              style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
            >
              {isPlayer ? '👁️ Перейти в зрители' : '⚔️ Перейти в игроки'}
            </button>

            <button
              className="btn-marvel btn-marvel-danger"
              onClick={onLeaveRoom}
              style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
            >
              <LogOut size={16} /> Покинуть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

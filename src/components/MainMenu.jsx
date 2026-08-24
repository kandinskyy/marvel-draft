import React, { useState } from 'react';
import { Shield, Users, Trophy, Play, ArrowLeft, Eye } from 'lucide-react';

export default function MainMenu({ 
  nickname, 
  setNickname, 
  onCreateGame, 
  onJoinGame 
}) {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinNickname, setJoinNickname] = useState(nickname || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateClick = () => {
    if (!nickname.trim()) {
      setErrorMsg('Пожалуйста, введите ваш никнейм!');
      return;
    }
    setErrorMsg('');
    onCreateGame();
  };

  const handleJoinOpen = () => {
    setJoinNickname(nickname);
    setShowJoinModal(true);
    setErrorMsg('');
  };

  const handleJoinSubmit = (asSpectator = false) => {
    const finalNick = joinNickname.trim() || nickname.trim();
    if (!finalNick) {
      setErrorMsg('Никнейм обязателен для заполнения!');
      return;
    }
    if (!joinCode.trim()) {
      setErrorMsg('Введите код комнаты!');
      return;
    }
    setNickname(finalNick);
    setErrorMsg('');
    onJoinGame(joinCode.trim().toUpperCase(), finalNick, asSpectator ? 'spectator' : 'player');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      <div className="glass-modal pop-in" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '40px 32px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Logo / Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(229, 9, 20, 0.15)',
          border: '1px solid rgba(229, 9, 20, 0.4)',
          borderRadius: '30px',
          color: '#f87171',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <Shield size={16} /> Fan-Made Marvel Draft
        </div>

        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: '900',
          lineHeight: '1.1',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #e50914 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          MARVEL DRAFT
        </h1>
        
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          marginBottom: '32px'
        }}>
          Собери команду героев Marvel, распредели роли и сразись в драфт-дуэлях или турнирах!
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Mandatory Nickname Input */}
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#94a3b8',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Ваш никнейм <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            className="marvel-input"
            placeholder="Введите ник (например, SpiderFan3000)..."
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            maxLength={20}
          />
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button
            className="btn-marvel btn-marvel-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            onClick={handleCreateClick}
          >
            <Play size={20} /> Создать игру
          </button>

          <button
            className="btn-marvel btn-marvel-secondary"
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
            onClick={handleJoinOpen}
          >
            <Users size={20} /> Присоединиться к игре
          </button>
        </div>
      </div>

      {/* Join Game Modal */}
      {showJoinModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-modal pop-in" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '32px',
            position: 'relative'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '800',
              marginBottom: '20px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Users color="var(--primary)" /> Присоединиться
            </h2>

            {errorMsg && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '10px',
                color: '#fca5a5',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#94a3b8',
                marginBottom: '6px'
              }}>
                Ваш никнейм <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="marvel-input"
                placeholder="Никнейм..."
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
                maxLength={20}
              />
            </div>

            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#94a3b8',
                marginBottom: '6px'
              }}>
                Код комнаты <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="marvel-input"
                placeholder="Например: M7X82K"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                style={{
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  fontWeight: '800',
                  fontSize: '1.2rem',
                  textAlign: 'center'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-marvel btn-marvel-primary"
                style={{ width: '100%', padding: '14px' }}
                onClick={() => handleJoinSubmit(false)}
              >
                <Play size={18} /> Присоединиться к игре
              </button>

              <button
                className="btn-marvel btn-marvel-gold"
                style={{ width: '100%', padding: '14px' }}
                onClick={() => handleJoinSubmit(true)}
              >
                <Eye size={18} /> Смотреть как Зритель
              </button>

              <button
                className="btn-marvel btn-marvel-secondary"
                style={{ width: '100%', padding: '12px', marginTop: '6px' }}
                onClick={() => setShowJoinModal(false)}
              >
                <ArrowLeft size={18} /> Назад
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { ArrowLeft, Check, Shield, Trophy, Users, SkipForward } from 'lucide-react';
import { ALL_ROLES } from '../data/roles';

export default function MatchSetup({ onStartLobby, onBack }) {
  const [mode, setMode] = useState('1v1'); // '1v1', 'tournament_4', 'tournament_8'
  const [selectedRoles, setSelectedRoles] = useState(ALL_ROLES.map(r => r.id)); // Default all 7
  const [passesCount, setPassesCount] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleRole = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      if (selectedRoles.length <= 1) {
        setErrorMsg('Должна быть выбрана хотя бы 1 роль!');
        return;
      }
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
    setErrorMsg('');
  };

  const handleCreateRoom = () => {
    if (selectedRoles.length === 0) {
      setErrorMsg('Выберите от 1 до 7 ролей для матча!');
      return;
    }
    onStartLobby({
      mode,
      roles: selectedRoles,
      passes: passesCount
    });
  };

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
        maxWidth: '680px',
        padding: '36px 32px',
        position: 'relative'
      }}>
        {/* Header with Back button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '900',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Shield color="var(--primary)" /> Настройка Матча
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Выберите формат, роли и количество пропусков для каждого матча
            </p>
          </div>

          <button
            className="btn-marvel btn-marvel-secondary"
            onClick={onBack}
            style={{ padding: '10px 16px', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={16} /> Назад
          </button>
        </div>

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

        {/* 1. Format Selection */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#94a3b8',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            1. Режим Игры
          </label>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            <button
              className={`btn-marvel ${mode === '1v1' ? 'btn-marvel-primary' : 'btn-marvel-secondary'}`}
              onClick={() => setMode('1v1')}
              style={{ padding: '16px 12px', flexDirection: 'column', gap: '6px' }}
            >
              <Users size={22} />
              <span>Битва 1 на 1</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Прямая дуэль</span>
            </button>

            <button
              className={`btn-marvel ${mode === 'tournament_4' ? 'btn-marvel-primary' : 'btn-marvel-secondary'}`}
              onClick={() => setMode('tournament_4')}
              style={{ padding: '16px 12px', flexDirection: 'column', gap: '6px' }}
            >
              <Trophy size={22} color="#eab308" />
              <span>Турнир 4 игрока</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>2 раунда (Сетка)</span>
            </button>

            <button
              className={`btn-marvel ${mode === 'tournament_8' ? 'btn-marvel-primary' : 'btn-marvel-secondary'}`}
              onClick={() => setMode('tournament_8')}
              style={{ padding: '16px 12px', flexDirection: 'column', gap: '6px' }}
            >
              <Trophy size={22} color="#a855f7" />
              <span>Турнир 8 игроков</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>3 раунда (Сетка)</span>
            </button>
          </div>
        </div>

        {/* 2. Roles Selector (Exact 7 Marvel Roles) */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <label style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              2. Выберите Роли в матче ({selectedRoles.length}/7)
            </label>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedRoles(ALL_ROLES.map(r => r.id))}
            >
              Выбрать все роли
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '10px'
          }}>
            {ALL_ROLES.map(role => {
              const isSelected = selectedRoles.includes(role.id);
              return (
                <div
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: isSelected 
                      ? 'rgba(234, 179, 8, 0.12)' 
                      : 'rgba(255, 255, 255, 0.04)',
                    border: `1.5px solid ${isSelected ? role.color : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{role.icon}</span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      color: isSelected ? '#ffffff' : '#94a3b8'
                    }}>
                      {role.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: role.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000000'
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Passes Selector (1-10) */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#94a3b8',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            3. Количество Пропусков на игрока (1–10)
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(9, 12, 25, 0.8)',
            padding: '10px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <SkipForward size={20} color="#eab308" />
            <select
              value={passesCount}
              onChange={(e) => setPassesCount(Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: '700',
                outline: 'none',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n} style={{ background: '#0f172a', color: '#fff' }}>
                  {n} {n === 1 ? 'пропуск' : n < 5 ? 'пропуска' : 'пропусков'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', gap: '14px' }}>
          <button
            className="btn-marvel btn-marvel-secondary"
            onClick={onBack}
            style={{ flex: 1, padding: '16px' }}
          >
            <ArrowLeft size={18} /> Назад
          </button>

          <button
            className="btn-marvel btn-marvel-gold"
            onClick={handleCreateRoom}
            style={{ flex: 2, padding: '16px', fontSize: '1.1rem' }}
          >
            Создать комнату
          </button>
        </div>
      </div>
    </div>
  );
}

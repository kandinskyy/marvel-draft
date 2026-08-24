import React from 'react';
import { Eye, ArrowLeft } from 'lucide-react';
import { getRoleById } from '../data/roles';

export default function SpectatorView({ matchData, onBack }) {
  const { player1, player2, p1Draft = {}, p2Draft = {}, roles = [], turn = 1 } = matchData;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        background: 'rgba(6, 182, 212, 0.15)',
        backdropFilter: 'blur(12px)',
        padding: '12px 24px',
        borderRadius: '16px',
        border: '1px solid rgba(6, 182, 212, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Eye color="#67e8f9" />
          <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#67e8f9' }}>
            РЕЖИМ ЗРИТЕЛЯ (SPECTATOR)
          </span>
        </div>

        <button
          className="btn-marvel btn-marvel-secondary"
          onClick={onBack}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Назад к Сетке
        </button>
      </div>

      {/* Live Match Board */}
      <div className="glass-panel" style={{
        flex: 1,
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Player 1 Team */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ef4444', marginBottom: '14px' }}>
            🛡️ {player1?.nickname || 'Игрок 1'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roles.map(rId => {
              const role = getRoleById(rId);
              const char = p1Draft[rId];
              return (
                <div key={rId} style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{role?.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: role?.color, fontWeight: '800' }}>{role?.name}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: char ? '#fff' : '#64748b' }}>
                      {char ? char.name : 'Выбирает...'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: '2rem', fontWeight: '900', color: '#eab308' }}>VS</div>

        {/* Player 2 Team */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#3b82f6', marginBottom: '14px' }}>
            🛡️ {player2?.nickname || 'Игрок 2'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roles.map(rId => {
              const role = getRoleById(rId);
              const char = p2Draft[rId];
              return (
                <div key={rId} style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{role?.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: role?.color, fontWeight: '800' }}>{role?.name}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: char ? '#fff' : '#64748b' }}>
                      {char ? char.name : 'Выбирает...'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

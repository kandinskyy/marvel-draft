import React from 'react';
import { Trophy, ArrowLeft, Check, X, Shield } from 'lucide-react';
import { getRoleById } from '../data/roles';

export default function MatchHistoryModal({ history, player1, player2, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div className="glass-modal pop-in" style={{
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '900',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Trophy color="#eab308" /> Результаты боёв
          </h3>

          <button
            className="btn-marvel btn-marvel-secondary"
            onClick={onClose}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Назад
          </button>
        </div>

        {/* Round History List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingRight: '6px'
        }}>
          {history.map((round, idx) => {
            const role = getRoleById(round.roleId);
            const p1Win = round.winner === 1;
            const p2Win = round.winner === 2;
            const isTie = round.winner === 0;

            const p1Percent = Math.min(100, Math.max(0, (round.p1FinalStat / round.p1InitStat) * 100));
            const p2Percent = Math.min(100, Math.max(0, (round.p2FinalStat / round.p2InitStat) * 100));

            return (
              <div key={idx} style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{role?.icon}</span>
                    <span style={{ fontWeight: '800', fontSize: '0.95rem', color: role?.color }}>
                      Раунд {idx + 1}: {role?.name}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    color: p1Win ? '#ef4444' : p2Win ? '#3b82f6' : '#fef08a'
                  }}>
                    {p1Win ? `${player1.nickname} победил (+1)` : p2Win ? `${player2.nickname} победил (+1)` : 'Ничья (0)'}
                  </div>
                </div>

                {/* Player 1 vs Player 2 comparative stat bars */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* P1 Card & Bar */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <img src={round.p1Char.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                        {round.p1Char.name}
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(0,0,0,0.5)',
                      height: '14px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${p1Percent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #ef4444, #b91c1c)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>
                      Старт: {round.p1InitStat} → Остаток: <strong style={{ color: '#fff' }}>{round.p1FinalStat}</strong>
                    </div>
                  </div>

                  {/* P2 Card & Bar */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <img src={round.p2Char.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                        {round.p2Char.name}
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(0,0,0,0.5)',
                      height: '14px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${p2Percent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>
                      Старт: {round.p2InitStat} → Остаток: <strong style={{ color: '#fff' }}>{round.p2FinalStat}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

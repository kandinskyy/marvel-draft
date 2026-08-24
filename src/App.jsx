import React, { useState, useEffect, useRef } from 'react';
import MainMenu from './components/MainMenu';
import MatchSetup from './components/MatchSetup';
import Lobby from './components/Lobby';
import DraftScreen from './components/DraftScreen';
import BattleSimScreen from './components/BattleSimScreen';
import TournamentBracket from './components/TournamentBracket';
import SpectatorView from './components/SpectatorView';
import { peerManager } from './network/peerManager';

export default function App() {
  const [screen, setScreen] = useState('main_menu'); // 'main_menu' | 'match_setup' | 'lobby' | 'draft' | 'battle_sim' | 'tournament' | 'spectator'
  const [nickname, setNickname] = useState(localStorage.getItem('marvel_draft_nick') || '');
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [myPeerId, setMyPeerId] = useState('');
  
  const [players, setPlayers] = useState([]);
  const [spectators, setSpectators] = useState([]);
  const [settings, setSettings] = useState({
    mode: '1v1',
    roles: ['captain', 'strength', 'intelligence', 'magic', 'ranged', 'agility', 'sum'],
    passes: 1
  });

  const [draftState, setDraftState] = useState({
    turn: 1,
    p1Draft: {},
    p2Draft: {},
    p1Passes: 1,
    p2Passes: 1
  });

  const [tournamentState, setTournamentState] = useState(null);

  const hasReceivedRoomState = useRef(false);

  // Save nickname locally
  useEffect(() => {
    if (nickname) {
      localStorage.setItem('marvel_draft_nick', nickname);
    }
  }, [nickname]);

  // Network Message Handler
  useEffect(() => {
    peerManager.setMessageHandler((type, payload, senderId) => {
      // Filter out targeted messages for other peers
      if (payload?.targetPeerId && payload.targetPeerId !== peerManager.myPeerId) {
        return;
      }

      if (type === 'JOIN_ROOM') {
        const { nickname: nick, mode: pMode } = payload;
        if (isHost) {
          const targetCap = settings.mode === '1v1' ? 2 : settings.mode === 'tournament_4' ? 4 : 8;
          let newPlayers = [...players];
          let newSpectators = [...spectators];

          if (pMode === 'spectator' || newPlayers.length >= targetCap) {
            newPlayers = newPlayers.filter(p => p.id !== senderId);
            if (!newSpectators.some(s => s.id === senderId)) {
              newSpectators.push({ id: senderId, nickname: nick });
            }
          } else {
            newSpectators = newSpectators.filter(s => s.id !== senderId);
            const existingIdx = newPlayers.findIndex(p => p.id === senderId);
            if (existingIdx >= 0) {
              // Preserve existing ready state if player already joined!
              newPlayers[existingIdx].nickname = nick;
            } else {
              newPlayers.push({ id: senderId, nickname: nick, ready: false, isHost: false });
            }
          }

          setPlayers(newPlayers);
          setSpectators(newSpectators);

          // Broadcast updated room state immediately to everyone
          peerManager.send('ROOM_STATE_UPDATE', {
            players: newPlayers,
            spectators: newSpectators,
            settings
          });
        }
      } else if (type === 'ROOM_STATE_UPDATE') {
        hasReceivedRoomState.current = true;
        if (payload.players && payload.players.length > 0) {
          setPlayers(payload.players);
        }
        if (payload.spectators) {
          setSpectators(payload.spectators);
        }
        if (payload.settings) {
          setSettings(payload.settings);
        }
        setScreen(prev => (prev === 'main_menu' ? 'lobby' : prev));
      } else if (type === 'TOGGLE_READY') {
        if (isHost) {
          const newPlayers = players.map(p => 
            p.id === senderId ? { ...p, ready: payload.ready } : p
          );
          setPlayers(newPlayers);
          peerManager.send('ROOM_STATE_UPDATE', { players: newPlayers, spectators, settings });
        }
      } else if (type === 'START_GAME') {
        if (payload.settings?.mode.startsWith('tournament')) {
          initTournamentState(payload.players, payload.settings);
          setScreen('tournament');
        } else {
          initDraftState(payload.settings);
          setScreen('draft');
        }
      } else if (type === 'DRAFT_STATE_UPDATE') {
        setDraftState(payload.draftState);
      } else if (type === 'START_BATTLE') {
        setScreen('battle_sim');
      } else if (type === 'TOURNAMENT_STATE_UPDATE') {
        setTournamentState(payload.tournamentState);
      }
    });
  }, [isHost, players, spectators, settings]);

  // Client Join Retry loop: retries JOIN_ROOM every 800ms UNTIL initial ROOM_STATE_UPDATE is received
  useEffect(() => {
    if (screen !== 'lobby' || isHost || hasReceivedRoomState.current) return;

    const interval = setInterval(() => {
      if (!hasReceivedRoomState.current) {
        peerManager.send('JOIN_ROOM', { nickname, mode: 'player' });
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [screen, isHost, nickname]);

  const handleCreateGame = () => {
    setScreen('match_setup');
  };

  const handleStartLobby = (newSettings) => {
    setSettings(newSettings);
    hasReceivedRoomState.current = true;
    peerManager.createRoom(({ success, roomCode: code, peerId }) => {
      if (success) {
        setRoomCode(code);
        setIsHost(true);
        setMyPeerId(peerId);
        setPlayers([{ id: peerId, nickname, ready: true, isHost: true }]);
        setSpectators([]);
        setScreen('lobby');
      }
    });
  };

  const handleJoinGame = (code, joinNick, joinMode) => {
    setRoomCode(code);
    setIsHost(false);
    hasReceivedRoomState.current = false;
    peerManager.joinRoom(code, joinNick, joinMode, ({ success }) => {
      if (success) {
        setMyPeerId(peerManager.myPeerId);
        setScreen('lobby');
      }
    });
  };

  const handleToggleReady = () => {
    const myPlayer = players.find(p => p.id === myPeerId);
    const newReadyState = !myPlayer?.ready;

    const updated = players.map(p => 
      p.id === myPeerId ? { ...p, ready: newReadyState } : p
    );
    setPlayers(updated);

    if (isHost) {
      peerManager.send('ROOM_STATE_UPDATE', { players: updated, spectators, settings });
    } else {
      peerManager.send('TOGGLE_READY', { ready: newReadyState });
    }
  };

  const handleSwitchRole = () => {
    const isCurrentlyPlayer = players.some(p => p.id === myPeerId);
    let newPlayers = [...players];
    let newSpectators = [...spectators];

    if (isCurrentlyPlayer) {
      newPlayers = newPlayers.filter(p => p.id !== myPeerId);
      if (!newSpectators.some(s => s.id === myPeerId)) {
        newSpectators.push({ id: myPeerId, nickname });
      }
    } else {
      const targetCap = settings.mode === '1v1' ? 2 : settings.mode === 'tournament_4' ? 4 : 8;
      if (newPlayers.length < targetCap) {
        newSpectators = newSpectators.filter(s => s.id !== myPeerId);
        newPlayers.push({ id: myPeerId, nickname, ready: false, isHost });
      }
    }

    setPlayers(newPlayers);
    setSpectators(newSpectators);

    if (isHost) {
      peerManager.send('ROOM_STATE_UPDATE', { players: newPlayers, spectators: newSpectators, settings });
    } else {
      peerManager.send('JOIN_ROOM', { nickname, mode: isCurrentlyPlayer ? 'spectator' : 'player' });
    }
  };

  const handleLeaveRoom = () => {
    peerManager.disconnect();
    setScreen('main_menu');
  };

  const handleStartGame = () => {
    peerManager.send('START_GAME', { settings, players });
    if (settings.mode.startsWith('tournament')) {
      initTournamentState(players, settings);
      setScreen('tournament');
    } else {
      initDraftState(settings);
      setScreen('draft');
    }
  };

  const initDraftState = (currentSettings) => {
    const pCount = currentSettings.passes || 1;
    const initialDraft = {
      turn: Math.random() < 0.5 ? 1 : 2,
      p1Draft: {},
      p2Draft: {},
      p1Passes: pCount,
      p2Passes: pCount,
      currentStep: 0
    };
    setDraftState(initialDraft);
  };

  const initTournamentState = (currentPlayers, currentSettings) => {
    const totalCount = currentSettings.mode === 'tournament_4' ? 4 : 8;
    const totalRounds = totalCount === 4 ? 2 : 3;

    const matches = [];
    if (totalCount === 4) {
      matches.push(
        { id: 1, round: 1, p1: currentPlayers[0], p2: currentPlayers[1], completed: false, p1Score: 0, p2Score: 0, readyIds: [] },
        { id: 2, round: 1, p1: currentPlayers[2], p2: currentPlayers[3], completed: false, p1Score: 0, p2Score: 0, readyIds: [] },
        { id: 3, round: 2, p1: null, p2: null, completed: false, p1Score: 0, p2Score: 0, readyIds: [] }
      );
    }

    setTournamentState({ matches, currentRound: 1, totalRounds });
  };

  const handleDraftAction = (actionType, payload) => {
    let nextDraft = { ...draftState };

    if (actionType === 'ASSIGN_ROLE') {
      const { playerTurn, roleId, char } = payload;
      if (playerTurn === 1) {
        nextDraft.p1Draft = { ...nextDraft.p1Draft, [roleId]: char };
      } else {
        nextDraft.p2Draft = { ...nextDraft.p2Draft, [roleId]: char };
      }
      nextDraft.turn = playerTurn === 1 ? 2 : 1;
      nextDraft.currentStep++;
    } else if (actionType === 'PASS_CHAR') {
      const { playerTurn } = payload;
      if (playerTurn === 1) nextDraft.p1Passes--;
      else nextDraft.p2Passes--;
      nextDraft.turn = playerTurn === 1 ? 2 : 1;
    }

    setDraftState(nextDraft);
    peerManager.send('DRAFT_STATE_UPDATE', { draftState: nextDraft });
  };

  const handleSimulateBattleTrigger = () => {
    peerManager.send('START_BATTLE', {});
    setScreen('battle_sim');
  };

  const handleMatchComplete = (winner) => {
    setScreen('main_menu');
  };

  const handleTournamentReady = (matchId) => {
    if (!tournamentState) return;

    const updatedMatches = tournamentState.matches.map(m => {
      if (m.id === matchId) {
        const readyIds = m.readyIds || [];
        const nextReady = readyIds.includes(myPeerId) ? readyIds : [...readyIds, myPeerId];
        return { ...m, readyIds: nextReady };
      }
      return m;
    });

    const currentMatch = updatedMatches.find(m => m.id === matchId);
    setTournamentState({ ...tournamentState, matches: updatedMatches });

    if (currentMatch && currentMatch.readyIds.length >= 2) {
      initDraftState(settings);
      setScreen('draft');
    }
  };

  const p1 = players[0] || { nickname: 'Игрок 1', id: 'p1' };
  const p2 = players[1] || { nickname: 'Игрок 2', id: 'p2' };

  return (
    <>
      {screen === 'main_menu' && (
        <MainMenu
          nickname={nickname}
          setNickname={setNickname}
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
        />
      )}

      {screen === 'match_setup' && (
        <MatchSetup
          onStartLobby={handleStartLobby}
          onBack={() => setScreen('main_menu')}
        />
      )}

      {screen === 'lobby' && (
        <Lobby
          roomCode={roomCode}
          isHost={isHost}
          myPeerId={myPeerId}
          players={players}
          spectators={spectators}
          settings={settings}
          onToggleReady={handleToggleReady}
          onSwitchRole={handleSwitchRole}
          onLeaveRoom={handleLeaveRoom}
          onStartGame={handleStartGame}
        />
      )}

      {screen === 'draft' && (
        <DraftScreen
          player1={p1}
          player2={p2}
          myPeerId={myPeerId}
          settings={settings}
          draftState={draftState}
          onDraftAction={handleDraftAction}
          onSimulateBattle={handleSimulateBattleTrigger}
          onLeaveMatch={handleLeaveRoom}
        />
      )}

      {screen === 'battle_sim' && (
        <BattleSimScreen
          player1={p1}
          player2={p2}
          p1Draft={draftState.p1Draft}
          p2Draft={draftState.p2Draft}
          roles={settings.roles}
          onMatchComplete={handleMatchComplete}
          onLeaveMatch={handleLeaveRoom}
        />
      )}

      {screen === 'tournament' && tournamentState && (
        <TournamentBracket
          tournament={tournamentState}
          myPeerId={myPeerId}
          onReadyForMatch={handleTournamentReady}
          onLeaveTournament={handleLeaveRoom}
        />
      )}
    </>
  );
}

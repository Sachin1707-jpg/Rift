import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);

  // Fetch initial data from the backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAgents = await api.agents();
        setAgents(fetchedAgents);
        const fetchedLogs = await api.logs();
        setLogs(fetchedLogs);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchData();
  }, []);

  const addAgent = (agent) => {
    setAgents(prev => [agent, ...prev]);
  };

  const updateAgentStatus = async (id, newStatus) => {
    // Optimistic UI update
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

    // If revoking, call the backend to instantly revoke access
    if (newStatus === 'Revoked') {
      try {
        await api.revoke(id);
      } catch (err) {
        console.error('Failed to revoke agent:', err);
      }
    }
  };

  const addLog = (logEntry) => {
    // In a real app, logs are usually written by the backend during `/verify`. 
    // Since the frontend logs revokes manually for immediate UI feedback, 
    // we just push it to local state so the Activity Feed updates instantly.
    const entry = {
      ...logEntry,
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [entry, ...prev]);
  };

  const removeAgent = async (id) => {
    // Optimistic UI removal
    setAgents(prev => prev.filter(a => a.id !== id));
    try {
      await api.delete(id);
    } catch (err) {
      console.error('Failed to delete agent:', err);
    }
  };

  const getAgent = (id) => agents.find(a => a.id === id);

  return (
    <AgentContext.Provider value={{ agents, logs, addAgent, updateAgentStatus, removeAgent, addLog, getAgent }}>
      {children}
    </AgentContext.Provider>
  );
};

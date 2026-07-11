const BASE_URL = 'http://localhost:4000';

export const api = {
  issue: async (agentData) => {
    const response = await fetch(`${BASE_URL}/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData)
    });
    if (!response.ok) throw new Error('Failed to issue passport');
    return await response.json();
  },

  verify: async (agentId, action, token) => {
    const response = await fetch(`${BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action })
    });
    if (!response.ok) throw new Error('Failed to verify token');
    return await response.json();
  },

  revoke: async (agentId) => {
    const response = await fetch(`${BASE_URL}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId })
    });
    if (!response.ok) throw new Error('Failed to revoke agent');
    return await response.json();
  },

  delete: async (agentId) => {
    const response = await fetch(`${BASE_URL}/agents/${agentId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete agent');
    return await response.json();
  },

  agents: async () => {
    const response = await fetch(`${BASE_URL}/agents`);
    if (!response.ok) throw new Error('Failed to fetch agents');
    return await response.json();
  },

  logs: async () => {
    const response = await fetch(`${BASE_URL}/logs`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return await response.json();
  }
};

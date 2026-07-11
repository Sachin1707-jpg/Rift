// mockApi.js simulates network requests to an OAuth/Identity layer

const generateToken = () => {
  return 'jwt_' + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
};

export const mockApi = {
  issue: async (agentData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAgent = {
          id: 'agent_' + Date.now(),
          name: agentData.name,
          purpose: agentData.purpose,
          permissions: agentData.permissions,
          token: generateToken(),
          expiryMinutes: agentData.expiryMinutes,
          status: 'Active',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + agentData.expiryMinutes * 60 * 1000).toISOString()
        };
        resolve({ data: newAgent });
      }, 800);
    });
  },

  verify: async (agentId, action, token) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // We will simulate verification.
        // In a real app, this would check the backend.
        // For our demo, the UI might determine approval based on current Agent context,
        // but we can also just return a generic response or let the UI handle the logic.
        // Here we just return a successful verification structure that the UI can use.
        resolve({
          status: 200,
          data: {
            approved: true, // the UI will override this if it wants to simulate denial based on permission
            message: 'Verification complete'
          }
        });
      }, 500);
    });
  },

  revoke: async (agentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true, status: 'Revoked' } });
      }, 600);
    });
  },

  logs: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return some dummy initial logs if needed, or just an empty array
        resolve({ data: [] });
      }, 400);
    });
  }
};

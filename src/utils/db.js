
import { get, set, del, keys } from 'idb-keyval';

const EXPIRY_DAYS = 90;

export async function saveTeamRequest(teamData) {
  const id = Date.now().toString();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
  
  const teamWithMeta = {
    ...teamData,
    id,
    createdAt: new Date().toISOString(),
    expiresAt: expiryDate.toISOString(),
    ownerFingerprint: teamData.ownerFingerprint
  };
  
  await set(`team-${id}`, teamWithMeta);
  notifyListingsUpdate();
  return id;
}

export async function getTeamRequests() {
  const allKeys = await keys();
  const teamKeys = allKeys.filter(key => key.toString().startsWith('team-'));
  
  const teams = [];
  const now = new Date();
  
  for (const key of teamKeys) {
    const team = await get(key);
    if (team) {
      const expiryDate = new Date(team.expiresAt);
      if (expiryDate > now) {
        teams.push(team);
      } else {
        // Auto-delete expired teams
        await del(key);
      }
    }
  }
  
  return teams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function deleteTeamRequest(id) {
  await del(`team-${id}`);
  notifyListingsUpdate();
}

export async function updateTeamRequest(id, updatedData) {
  const existing = await get(`team-${id}`);
  if (existing) {
    const updated = { ...existing, ...updatedData };
    await set(`team-${id}`, updated);
    notifyListingsUpdate();
  }
}

// BroadcastChannel for cross-tab sync
const channel = new BroadcastChannel('team-listings-sync');

function notifyListingsUpdate() {
  channel.postMessage({ type: 'LISTINGS_UPDATED' });
}

export function subscribeToListingsUpdates(callback) {
  channel.addEventListener('message', callback);
  return () => channel.removeEventListener('message', callback);
}

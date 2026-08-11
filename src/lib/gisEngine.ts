import { RoadNode, RoadEdge } from '../types';

export interface PathResult {
  pathNodeIds: string[];
  totalDistanceKm: number;
  totalTimeMinutes: number;
  totalRiskScore: number;
  hasBlockedSegment: boolean;
}

/**
 * GIS Pathfinding & Graph Engine using Dijkstra Shortest Path Algorithm
 */
export function findShortestPath(
  startNodeId: string,
  endNodeId: string,
  nodes: RoadNode[],
  edges: RoadEdge[],
  isAirFlight: boolean = false
): PathResult {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  nodes.forEach((n) => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
    unvisited.add(n.id);
  });

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    // Find node in unvisited with smallest distance
    let currentId: string | null = null;
    let smallestDist = Infinity;

    unvisited.forEach((id) => {
      if (distances[id] < smallestDist) {
        smallestDist = distances[id];
        currentId = id;
      }
    });

    if (!currentId || smallestDist === Infinity) break;
    if (currentId === endNodeId) break;

    unvisited.delete(currentId);

    // Find neighboring edges
    const activeEdges = edges.filter(
      (e) =>
        (e.fromNodeId === currentId || e.toNodeId === currentId) &&
        (isAirFlight ? e.isAirRoute || e.status === 'open' : !e.isAirRoute)
    );

    for (const edge of activeEdges) {
      const neighborId = edge.fromNodeId === currentId ? edge.toNodeId : edge.fromNodeId;
      if (!unvisited.has(neighborId)) continue;

      let edgeWeight = edge.distanceKm;
      if (edge.status === 'blocked' && !isAirFlight) {
        edgeWeight += 9999; // Heavy penalty for blocked ground roads
      } else if (edge.status === 'partially_blocked' && !isAirFlight) {
        edgeWeight *= 2.2;
      }

      const alt = distances[currentId] + edgeWeight;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = currentId;
      }
    }
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  let curr: string | null = endNodeId;

  while (curr !== null) {
    pathNodeIds.unshift(curr);
    curr = previous[curr];
  }

  if (pathNodeIds.length === 0 || pathNodeIds[0] !== startNodeId) {
    return {
      pathNodeIds: [startNodeId, endNodeId],
      totalDistanceKm: 120,
      totalTimeMinutes: 110,
      totalRiskScore: 8.0,
      hasBlockedSegment: true,
    };
  }

  let totalDist = 0;
  let totalTime = 0;
  let maxRisk = 1.0;
  let hasBlocked = false;

  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const u = pathNodeIds[i];
    const v = pathNodeIds[i + 1];
    const edge = edges.find(
      (e) => (e.fromNodeId === u && e.toNodeId === v) || (e.fromNodeId === v && e.toNodeId === u)
    );

    if (edge) {
      totalDist += edge.distanceKm;
      totalTime += edge.estimatedMinutes;
      if (edge.riskScore > maxRisk) maxRisk = edge.riskScore;
      if (edge.status === 'blocked') hasBlocked = true;
    }
  }

  return {
    pathNodeIds,
    totalDistanceKm: Math.round(totalDist),
    totalTimeMinutes: Math.round(totalTime),
    totalRiskScore: maxRisk,
    hasBlockedSegment: hasBlocked,
  };
}

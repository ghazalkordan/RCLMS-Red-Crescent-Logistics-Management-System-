import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import {
  INITIAL_WAREHOUSES,
  INITIAL_AFFECTED_AREAS,
  INITIAL_RELIEF_ITEMS,
  INITIAL_ROAD_EDGES,
  INITIAL_ROAD_NODES,
  INITIAL_SHELTERS,
  INITIAL_VEHICLES,
  INITIAL_HELICOPTERS,
  INITIAL_DISASTER,
  INITIAL_EMERGENCY_REQUESTS,
  INITIAL_SCENARIOS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_LP_PARAMS,
  DEFAULT_GA_PARAMS,
} from './src/data/mockData.js';

import { solveLpAllocation } from './src/lib/lpSolver.js';
import { solveGaLocationRouting } from './src/lib/gaEngine.js';
import { generateGroundedChatResponse } from './src/lib/geminiChatbot.js';
import { EmergencyRequest } from './src/types.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory state storage
  let warehouses = [...INITIAL_WAREHOUSES];
  let areas = [...INITIAL_AFFECTED_AREAS];
  let items = [...INITIAL_RELIEF_ITEMS];
  let edges = [...INITIAL_ROAD_EDGES];
  let nodes = [...INITIAL_ROAD_NODES];
  let shelters = [...INITIAL_SHELTERS];
  let trucks = [...INITIAL_VEHICLES];
  let helicopters = [...INITIAL_HELICOPTERS];
  let disaster = { ...INITIAL_DISASTER };
  let emergencyRequests = [...INITIAL_EMERGENCY_REQUESTS];
  let scenarios = [...INITIAL_SCENARIOS];
  let auditLogs = [...INITIAL_AUDIT_LOGS];
  let lpParams = { ...DEFAULT_LP_PARAMS };
  let gaParams = { ...DEFAULT_GA_PARAMS };

  // Initial optimization solutions
  let latestLpResult = solveLpAllocation(warehouses, areas, items, edges, nodes, lpParams);
  let latestGaResult = solveGaLocationRouting(
    shelters,
    areas,
    trucks,
    helicopters,
    nodes,
    edges,
    gaParams
  );

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Route: Get State
  app.get('/api/state', (req, res) => {
    res.json({
      warehouses,
      areas,
      items,
      edges,
      nodes,
      shelters,
      trucks,
      helicopters,
      disaster,
      emergencyRequests,
      scenarios,
      auditLogs,
      emergencyMode: disaster.emergencyMode,
      lpParams,
      gaParams,
      lpResult: latestLpResult,
      gaResult: latestGaResult,
      latestLpResult,
      latestGaResult,
    });
  });

  // API Route: Combined Optimization Solver
  app.post('/api/optimize', (req, res) => {
    try {
      if (req.body.lpParams) {
        lpParams = { ...lpParams, ...req.body.lpParams };
      }
      if (req.body.gaParams) {
        gaParams = { ...gaParams, ...req.body.gaParams };
      }
      latestLpResult = solveLpAllocation(warehouses, areas, items, edges, nodes, lpParams);
      latestGaResult = solveGaLocationRouting(
        shelters,
        areas,
        trucks,
        helicopters,
        nodes,
        edges,
        gaParams
      );

      auditLogs.unshift({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: req.body.actorRole || 'manager',
        userName: req.body.actorRole === 'admin' ? 'مدیر سیستم' : 'اپراتور بهینه‌سازی',
        userRole: req.body.actorRole || 'manager',
        actionFa: 'اجرای مجدد الگوریتم‌های بهینه‌سازی LP و GA',
        actionEn: 'Re-executed LP and GA Optimization Solvers',
        details: `LP Model Mode: ${lpParams.modelMode}, GA Pop: ${gaParams.populationSize}`,
      });

      res.json({
        success: true,
        lpResult: latestLpResult,
        gaResult: latestGaResult,
        lpParams,
        gaParams,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Optimization failed' });
    }
  });

  // API Route: Update Inventory Stock
  app.post('/api/inventory/update', (req, res) => {
    try {
      const { warehouseId, itemId, quantity, actorRole } = req.body;
      const wh = warehouses.find((w) => w.id === warehouseId);
      if (wh) {
        if (!wh.inventory) wh.inventory = {};
        wh.inventory[itemId] = Math.max(0, Number(quantity) || 0);
        latestLpResult = solveLpAllocation(warehouses, areas, items, edges, nodes, lpParams);

        auditLogs.unshift({
          id: `audit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: actorRole || 'rescuer',
          userName: 'مسئول انبار',
          userRole: actorRole || 'rescuer',
          actionFa: `تغییر موجودی انبار ${wh.nameFa} برای قلم ${itemId}`,
          actionEn: `Updated inventory for ${wh.nameEn} item ${itemId}`,
          details: `New quantity: ${quantity}`,
        });
      }
      res.json({ success: true, warehouses, lpResult: latestLpResult });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Inventory update failed' });
    }
  });

  // API Route: Toggle Warehouse Availability
  app.post('/api/warehouse/toggle', (req, res) => {
    try {
      const { warehouseId, actorRole } = req.body;
      const wh = warehouses.find((w) => w.id === warehouseId);
      if (wh) {
        wh.isAvailable = !wh.isAvailable;
        lpParams.warehouseAvailability[warehouseId] = wh.isAvailable;
        latestLpResult = solveLpAllocation(warehouses, areas, items, edges, nodes, lpParams);

        auditLogs.unshift({
          id: `audit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: actorRole || 'manager',
          userName: 'مدیر لجستیک',
          userRole: actorRole || 'manager',
          actionFa: `تغییر وضعیت انبار ${wh.nameFa} به ${wh.isAvailable ? 'فعال' : 'غیرفعال'}`,
          actionEn: `Toggled warehouse ${wh.nameEn} to ${wh.isAvailable ? 'Active' : 'Disabled'}`,
          details: `Available: ${wh.isAvailable}`,
        });
      }
      res.json({ success: true, warehouses, lpResult: latestLpResult });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Warehouse toggle failed' });
    }
  });

  // API Route: Toggle Road Edge Blockage Status
  app.post('/api/gis/edge/toggle', (req, res) => {
    try {
      const { edgeId, actorRole } = req.body;
      const edge = edges.find((e) => e.id === edgeId);
      if (edge) {
        edge.status = edge.status === 'open' ? 'blocked' : 'open';
        edge.riskScore = edge.status === 'blocked' ? 9.9 : 1.0;
        latestGaResult = solveGaLocationRouting(shelters, areas, trucks, helicopters, nodes, edges, gaParams);

        auditLogs.unshift({
          id: `audit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: actorRole || 'admin',
          userName: 'کارشناس GIS',
          userRole: actorRole || 'admin',
          actionFa: `تغییر وضعیت مسیر معبر ${edge.id} به ${edge.status}`,
          actionEn: `Toggled road edge ${edge.id} to ${edge.status}`,
          details: `Status: ${edge.status}`,
        });
      }
      res.json({ success: true, edges, gaResult: latestGaResult });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Edge toggle failed' });
    }
  });

  // API Route: Toggle Weather Gating for Helicopters
  app.post('/api/fleet/weather-toggle', (req, res) => {
    try {
      const { helicopterId, actorRole } = req.body;
      const heli = helicopters.find((h) => h.id === helicopterId);
      if (heli) {
        heli.weatherGated = !heli.weatherGated;
        heli.status = heli.weatherGated ? 'grounded_weather' : 'ready';
        latestGaResult = solveGaLocationRouting(shelters, areas, trucks, helicopters, nodes, edges, gaParams);

        auditLogs.unshift({
          id: `audit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: actorRole || 'manager',
          userName: 'فرمانده یگان پروازی',
          userRole: actorRole || 'manager',
          actionFa: `تغییر وضعیت جوی و پروازی بالگرد ${heli.callsign}`,
          actionEn: `Toggled weather gating for helicopter ${heli.callsign}`,
          details: `Weather gated: ${heli.weatherGated}`,
        });
      }
      res.json({ success: true, helicopters, gaResult: latestGaResult });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Weather toggle failed' });
    }
  });

  // API Route: Toggle Shelter Activation
  app.post('/api/shelter/toggle', (req, res) => {
    try {
      const { shelterId, actorRole } = req.body;
      const shelter = shelters.find((s) => s.id === shelterId);
      if (shelter) {
        shelter.isActivated = !shelter.isActivated;
        latestGaResult = solveGaLocationRouting(shelters, areas, trucks, helicopters, nodes, edges, gaParams);

        auditLogs.unshift({
          id: `audit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: actorRole || 'manager',
          userName: 'مسئول اسکان اضطراری',
          userRole: actorRole || 'manager',
          actionFa: `تغییر وضعیت فعال‌سازی پناهگاه ${shelter.nameFa}`,
          actionEn: `Toggled shelter activation for ${shelter.nameEn}`,
          details: `Activated: ${shelter.isActivated}`,
        });
      }
      res.json({ success: true, shelters, gaResult: latestGaResult });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Shelter toggle failed' });
    }
  });

  // API Route: Legacy LP Endpoint
  app.post('/api/optimization/lp', (req, res) => {
    try {
      const customParams = req.body.params ? { ...lpParams, ...req.body.params } : lpParams;
      lpParams = customParams;
      latestLpResult = solveLpAllocation(warehouses, areas, items, edges, nodes, lpParams);
      res.json({ success: true, result: latestLpResult });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'LP Optimization failed' });
    }
  });

  // API Route: Legacy GA Endpoint
  app.post('/api/optimization/ga', (req, res) => {
    try {
      const customParams = req.body.params ? { ...gaParams, ...req.body.params } : gaParams;
      gaParams = customParams;
      latestGaResult = solveGaLocationRouting(
        shelters,
        areas,
        trucks,
        helicopters,
        nodes,
        edges,
        gaParams
      );
      res.json({ success: true, result: latestGaResult });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'GA Optimization failed' });
    }
  });

  // API Route: Public Emergency Request Intake
  app.post('/api/emergency-requests', (req, res) => {
    try {
      const {
        incidentType,
        reporterName,
        phone,
        lat,
        lng,
        address,
        affectedCount,
        hasInjuries,
        medicalNeeds,
        immediateDanger,
      } = req.body;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const trackingId = `RC-REQ-${Math.floor(10000 + Math.random() * 90000)}`;

      let priority: EmergencyRequest['priority'] = 'standard';
      if (immediateDanger || incidentType?.includes('آوار') || incidentType?.includes('گرفتاری')) {
        priority = 'critical';
      } else if (hasInjuries || (affectedCount && affectedCount > 10)) {
        priority = 'high';
      }

      const newRequest: EmergencyRequest = {
        id: `req_${Date.now()}`,
        trackingId,
        incidentType: incidentType || 'حادثه عمومی',
        reporterName,
        phone,
        lat: parseFloat(lat) || 34.46,
        lng: parseFloat(lng) || 45.86,
        address: address || 'موقعیت ثبت شده با ثبت مکان GPS',
        affectedCount: parseInt(affectedCount) || 1,
        hasInjuries: Boolean(hasInjuries),
        medicalNeeds: medicalNeeds || '',
        immediateDanger: Boolean(immediateDanger),
        priority,
        status: 'received',
        createdAt: new Date().toISOString(),
      };

      emergencyRequests.unshift(newRequest);

      // Aggregate demand into nearest area
      if (areas[0]) {
        areas[0].demands['item_tent'] = (areas[0].demands['item_tent'] || 0) + (hasInjuries ? 5 : 2);
        areas[0].demands['item_food_pack'] =
          (areas[0].demands['item_food_pack'] || 0) + (parseInt(affectedCount) || 1);
        latestLpResult.isStale = true;
        latestGaResult.isStale = true;
      }

      res.json({ success: true, request: newRequest, emergencyRequests });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Request intake failed' });
    }
  });

  // API Route: AI Grounded Chatbot
  app.post('/api/chat', async (req, res) => {
    try {
      const query = req.body.message || req.body.query;
      const language = req.body.language || 'fa';
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const reply = await generateGroundedChatResponse(
        query,
        latestLpResult,
        latestGaResult,
        language
      );

      res.json({ reply });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Chatbot execution failed' });
    }
  });

  // API Route: End-to-End Simulation Step Trigger
  app.post('/api/simulation/step', (req, res) => {
    try {
      const step = req.body.actionType || req.body.step;

      if (step === 'road_damaged' || step === 'road_blocked' || step === 'warehouse_damage') {
        const targetEdge = edges.find((e) => e.id === 'e_ksh_paveh' || e.id === 'e_eslamabad_sarpol');
        if (targetEdge) {
          targetEdge.status = 'blocked';
          targetEdge.riskScore = 9.8;
        }
        const wh = warehouses.find((w) => w.id === 'wh_kermanshah');
        if (wh && step === 'warehouse_damage') {
          wh.damageStatus = 'partially_damaged';
        }
        latestLpResult = solveLpAllocation(warehouses, areas, items, edges, nodes, lpParams);
        latestGaResult = solveGaLocationRouting(
          shelters,
          areas,
          trucks,
          helicopters,
          nodes,
          edges,
          gaParams
        );
      } else if (step === 'emergency_mode' || step === 'disaster_declared') {
        disaster.emergencyMode = true;
        gaParams.crisisModePreset = true;
        latestGaResult = solveGaLocationRouting(
          shelters,
          areas,
          trucks,
          helicopters,
          nodes,
          edges,
          gaParams
        );
      } else if (step === 're_optimize_all' || step === 'lp_optimization' || step === 'ga_routing') {
        latestLpResult = solveLpAllocation(warehouses, areas, items, edges, nodes, lpParams);
        latestGaResult = solveGaLocationRouting(
          shelters,
          areas,
          trucks,
          helicopters,
          nodes,
          edges,
          gaParams
        );
      }

      res.json({
        success: true,
        disaster,
        lpResult: latestLpResult,
        gaResult: latestGaResult,
        latestLpResult,
        latestGaResult,
        edges,
        emergencyRequests,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Simulation step failed' });
    }
  });

  // Vite Middleware in Development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Command Center Server running at http://localhost:${PORT}`);
  });
}

startServer();

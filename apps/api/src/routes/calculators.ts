import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const calculatorsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// 1. Rate Calculator
calculatorsRouter.post('/rate', async (c) => {
  const data = await c.req.json();
  const desiredIncome = Number(data.desiredMonthlyIncome) || 8000;
  const workingDays = Number(data.workingDaysPerMonth) || 20;
  const hoursPerDay = Number(data.workingHoursPerDay) || 7;
  const nonBillablePercent = Number(data.nonBillablePercent) || 30;
  const monthlyExpenses = Number(data.monthlyExpenses) || 1200;
  const taxRate = Number(data.taxRatePercent) || 20;

  const effectiveTaxFactor = Math.max(0.1, 1 - taxRate / 100);
  const totalMonthlyCost = (desiredIncome + monthlyExpenses) / effectiveTaxFactor;
  const totalWorkingHours = workingDays * hoursPerDay;
  const billableHours = Math.max(1, totalWorkingHours * (1 - nonBillablePercent / 100));

  const requiredHourlyRate = Math.round(totalMonthlyCost / billableHours);
  const requiredDailyRate = Math.round(requiredHourlyRate * (hoursPerDay * (1 - nonBillablePercent / 100)));
  const requiredMonthlyRevenue = Math.round(totalMonthlyCost);

  return c.json({
    requiredHourlyRate,
    requiredDailyRate,
    requiredMonthlyRevenue,
    totalMonthlyCost: Math.round(totalMonthlyCost),
    billableHoursPerMonth: Math.round(billableHours * 10) / 10,
  });
});

// 2. Runway Calculator
calculatorsRouter.post('/runway', async (c) => {
  const data = await c.req.json();
  const savings = Number(data.currentSavings) || 25000;
  const monthlyExpenses = Number(data.monthlyExpenses) || 3500;
  const expectedIncome = Number(data.expectedMonthlyIncome) || 1500;

  const netMonthlyBurn = Math.max(0, monthlyExpenses - expectedIncome);
  const runwayMonths = netMonthlyBurn > 0 ? Math.round((savings / netMonthlyBurn) * 10) / 10 : 999;
  const status = runwayMonths < 3 ? 'critical' : runwayMonths < 6 ? 'moderate' : 'healthy';

  return c.json({
    netMonthlyBurn,
    runwayMonths,
    status,
  });
});

// 3. Business Goals
calculatorsRouter.get('/goals', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const goals = await db.query.businessGoals.findMany({
    where: eq(schema.businessGoals.organizationId, orgId),
    orderBy: [desc(schema.businessGoals.period)],
  });

  return c.json(goals);
});

calculatorsRouter.post('/goals', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const id = crypto.randomUUID();

  await db.insert(schema.businessGoals).values({
    id,
    organizationId: orgId,
    period: data.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    monthlyRevenueTarget: Number(data.monthlyRevenueTarget) || 10000,
    targetClients: Number(data.targetClients) || 3,
    targetHours: Number(data.targetHours) || 120,
    createdAt: new Date().toISOString(),
  });

  const created = await db.query.businessGoals.findFirst({
    where: eq(schema.businessGoals.id, id),
  });

  return c.json(created, 201);
});

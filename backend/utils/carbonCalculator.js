const pool = require('../db/pool');

/**
 * Loads all active emission factors and returns them keyed as
 * { commute: { car: 0.192, ... }, electricity: { kwh: 0.716 }, water: { liter: 0.000344 }, waste: { segregated_bonus: -0.5 } }
 */
async function loadFactors() {
  const { rows } = await pool.query(
    'SELECT category, key, factor_value FROM emission_factors WHERE is_active = TRUE'
  );
  const map = {};
  for (const row of rows) {
    if (!map[row.category]) map[row.category] = {};
    map[row.category][row.key] = Number(row.factor_value);
  }
  return map;
}

/**
 * Computes the carbon footprint (kg CO2e) for one day's logged activity
 * using the current, admin-configurable emission factors.
 */
async function computeCarbonScore({ commute_mode, commute_distance_km, electricity_kwh, water_liters, waste_segregated }) {
  const factors = await loadFactors();

  const commuteFactor = (factors.commute && factors.commute[commute_mode]) || 0;
  const electricityFactor = (factors.electricity && factors.electricity.kwh) || 0;
  const waterFactor = (factors.water && factors.water.liter) || 0;
  const wasteBonus = waste_segregated
    ? ((factors.waste && factors.waste.segregated_bonus) || 0)
    : 0;

  const commuteImpact = commuteFactor * Number(commute_distance_km || 0);
  const electricityImpact = electricityFactor * Number(electricity_kwh || 0);
  const waterImpact = waterFactor * Number(water_liters || 0);

  let total = commuteImpact + electricityImpact + waterImpact + wasteBonus;
  if (total < 0) total = 0; // score floor: bonuses can't push it negative

  return Math.round(total * 100) / 100;
}

/**
 * Converts a verified activity's carbon performance into reward points.
 * Lower carbon score (relative to a baseline) => more points.
 * Simple, transparent rule: base points per verified activity, plus a
 * bonus for low-impact commute and for waste segregation.
 */
function computeRewardPoints({ carbon_score, commute_mode, waste_segregated }, multiplier = 1) {
  let points = 10; // base points for a verified, authentic submission
  if (['cycle', 'walk', 'wfh'].includes(commute_mode)) points += 10;
  if (waste_segregated) points += 5;
  if (carbon_score < 2) points += 5;
  return Math.round(points * Number(multiplier || 1));
}

module.exports = { loadFactors, computeCarbonScore, computeRewardPoints };

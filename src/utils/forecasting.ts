import { DataRow, ForecastResult, StudentProfile } from '../types';
import { getSeatTypesForCategory } from './categories';

export function buildForecast(
  data: DataRow[],
  profile: StudentProfile,
  category: string,
  inflationAdjustment: number = 0
): ForecastResult[] {
  const seatTypes = category === 'All' ? null : getSeatTypesForCategory(category as any);

  const grouped = new Map<string, DataRow[]>();
  for (const row of data) {
    if (seatTypes && !seatTypes.includes(row.seat_type)) continue;

    const key = `${row.college_code}|${row.branch}|${row.seat_type}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(row);
  }

  const results: ForecastResult[] = [];

  for (const [, rows] of grouped.entries()) {
    const byYear = new Map<number, number>();
    for (const r of rows) {
      byYear.set(r.year, r.cutoff_percentile);
    }

    const years = Array.from(byYear.keys()).sort();
    if (years.length < 2) continue;

    const historical: Record<number, number> = {};
    for (const [y, v] of byYear.entries()) historical[y] = v;

    const y25 = byYear.get(2025) ?? 0;
    const y24 = byYear.get(2024) ?? 0;
    const y23 = byYear.get(2023) ?? 0;

    let wma = 0;
    let weightSum = 0;
    if (y25 > 0) { wma += y25 * 0.50; weightSum += 0.50; }
    if (y24 > 0) { wma += y24 * 0.30; weightSum += 0.30; }
    if (y23 > 0) { wma += y23 * 0.20; weightSum += 0.20; }

    if (weightSum === 0) continue;
    wma /= weightSum;

    const trendSlope = years.length > 1
      ? (byYear.get(years[years.length - 1])! - byYear.get(years[0])!) / (years.length - 1)
      : 0;

    let trendPenalty = 0;
    if (trendSlope > 0.5) {
      trendPenalty = 0.25;
    }

    const forecast = wma + trendPenalty + inflationAdjustment;

    const values = Object.values(historical);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const isVolatile = stdDev > 1.0;

    const studentScore = rows[0].seat_type === 'AI' ? profile.jeePercentile : profile.mhtCetPercentile;

    let tier: 1 | 2 | 3;
    const diff = forecast - studentScore;
    if (diff > 0.4) {
      tier = 1;
    } else if (diff >= -1.2) {
      tier = 2;
    } else {
      tier = 3;
    }

    results.push({
      choice_code: rows[0].choice_code,
      college_code: rows[0].college_code,
      college_name: rows[0].college_name,
      city: rows[0].city,
      branch: rows[0].branch,
      seat_type: rows[0].seat_type,
      forecast: parseFloat(forecast.toFixed(2)),
      volatility: parseFloat(stdDev.toFixed(2)),
      isVolatile,
      trendPenalty: parseFloat(trendPenalty.toFixed(2)),
      historical,
      years,
      tier,
    });
  }

  return results.sort((a, b) => b.forecast - a.forecast);
}

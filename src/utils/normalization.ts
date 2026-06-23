export function normalizeCity(rawCity: string): string {
  const city = rawCity.trim();
  const lower = city.toLowerCase();

  const puneSuburbs = [
    'shivajinagar', 'dhankawadi', 'kondhwa', 'bibwewadi', 'akurdi', 'pimpri',
    'chinchwad', 'hadapsar', 'wagholi', 'alandi', 'tathawade', 'katraj',
    'hinjewadi', 'kothrud'
  ];
  if (puneSuburbs.some(s => lower.includes(s))) return 'Pune';

  const mumbaiSuburbs = [
    'matunga', 'bandra', 'vile parle', 'chembur', 'wadala', 'kandivali',
    'andheri', 'borivali', 'powai', 'sion'
  ];
  if (mumbaiSuburbs.some(s => lower.includes(s))) return 'Mumbai';

  const naviMumbaiSuburbs = ['kharghar', 'panvel', 'vashi', 'nerul', 'airoli'];
  if (naviMumbaiSuburbs.some(s => lower.includes(s))) return 'Navi Mumbai';

  const thaneSuburbs = ['dombivli', 'kalyan', 'mira road', 'vasai', 'virar'];
  if (thaneSuburbs.some(s => lower.includes(s))) return 'Thane';

  if (lower.includes('wanadongri')) return 'Nagpur';
  if (lower.includes('sinnar')) return 'Nashik';
  if (lower.includes('aurangabad')) return 'Chhatrapati Sambhajinagar';
  if (lower.includes('badnera')) return 'Amravati';
  if (lower.includes('miraj')) return 'Sangli';

  return toTitleCase(city.replace(/\d{5,6}/g, '').trim());
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

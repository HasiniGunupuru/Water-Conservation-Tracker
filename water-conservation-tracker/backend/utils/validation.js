const ACTIVITIES = ['Shower','Bath','Toilet','Laundry','Dishwashing','Cooking & drinking','Gardening','Cleaning','Other'];
function validateEntry(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Send a JSON object.';
  if (!ACTIVITIES.includes(body.activity)) return 'Choose a valid activity.';
  if (typeof body.litres !== 'number' || !Number.isFinite(body.litres) || body.litres < 0.1 || body.litres > 100000) return 'Water used must be a number between 0.1 and 100000 litres.';
  if (typeof body.entry_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.entry_date)) return 'Date must use YYYY-MM-DD format.';
  const parsed = new Date(`${body.entry_date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10) !== body.entry_date) return 'Enter a valid calendar date.';
  if (body.entry_date > new Date().toISOString().slice(0,10)) return 'Future dates are not allowed.';
  if (body.note !== undefined && (typeof body.note !== 'string' || body.note.length > 180)) return 'Note must be text with at most 180 characters.';
  return null;
}
module.exports = { ACTIVITIES, validateEntry };

function generateISRC(country = 'US', registrant = 'QZM') {
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `${country}-${registrant}-${year}-${rand}`;
}

function generateUPC() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}
module.exports = { generateISRC, generateUPC };

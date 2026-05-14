export const SIGNS = [
  { id: "aries", name: "Aries", symbol: "♈", date: "Mar 21 - Apr 19", element: "Fire" },
  { id: "taurus", name: "Taurus", symbol: "♉", date: "Apr 20 - May 20", element: "Earth" },
  { id: "gemini", name: "Gemini", symbol: "♊", date: "May 21 - Jun 20", element: "Air" },
  { id: "cancer", name: "Cancer", symbol: "♋", date: "Jun 21 - Jul 22", element: "Water" },
  { id: "leo", name: "Leo", symbol: "♌", date: "Jul 23 - Aug 22", element: "Fire" },
  { id: "virgo", name: "Virgo", symbol: "♍", date: "Aug 23 - Sep 22", element: "Earth" },
  { id: "libra", name: "Libra", symbol: "♎", date: "Sep 23 - Oct 22", element: "Air" },
  { id: "scorpio", name: "Scorpio", symbol: "♏", date: "Oct 23 - Nov 21", element: "Water" },
  { id: "sagittarius", name: "Sagittarius", symbol: "♐", date: "Nov 22 - Dec 21", element: "Fire" },
  { id: "capricorn", name: "Capricorn", symbol: "♑", date: "Dec 22 - Jan 19", element: "Earth" },
  { id: "aquarius", name: "Aquarius", symbol: "♒", date: "Jan 20 - Feb 18", element: "Air" },
  { id: "pisces", name: "Pisces", symbol: "♓", date: "Feb 19 - Mar 20", element: "Water" },
];

export function getSign(id: string) {
  return SIGNS.find(s => s.id === id);
}

// src/services/api.ts

// URL mise à jour avec un jeu de données actif de la RATP
const RATP_STATIONS_URL = "https://data.ratp.fr/api/explore/v2.1/catalog/datasets/trafic-annuel-entrant-par-station-du-reseau-ferre-2021/records?limit=20";

export const fetchStations = async () => {
  try {
    const response = await fetch(RATP_STATIONS_URL);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // 💡 L'astuce de débogage : cela va afficher la réponse brute de la RATP dans votre terminal VS Code !
    console.log("Données brutes reçues de la RATP :", JSON.stringify(data, null, 2));
    
    // Le format de ce jeu de données est légèrement différent, on adapte le nettoyage :
    const cleanedStations = data.results.map((item: any) => ({
      name: item.station,
      city: item.ville,
      network: item.reseau // Métro, RER, etc.
    }));

    return cleanedStations;

  } catch (error) {
    console.error("Erreur API RATP :", error);
    return [];
  }
};
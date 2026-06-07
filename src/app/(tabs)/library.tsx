import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchStations } from '../../services/api'; // On importe notre fonction

export default function ApiTestScreen() {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect se déclenche une seule fois au chargement de l'écran
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchStations();
      setStations(data);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00b0ba" />
        <Text style={styles.loadingText}>Connexion aux serveurs RATP...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BD des stations : {stations.length}</Text>
      
      {/* FlatList est parfait pour afficher des listes performantes en React Native */}
      <FlatList
        data={stations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.stationCard}>
            <Text style={styles.stationName}>{item.name}</Text>
            <Text style={styles.stationCoords}>
              Réseau : {item.network} | Ville : {item.city}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontFamily: 'SamsungSharpSans',
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    fontFamily: 'SamsungSharpSans',
    color: '#a0a0a0',
    marginTop: 15,
  },
  stationCard: {
    backgroundColor: '#353a40',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  stationName: {
    fontFamily: 'SamsungSharpSans',
    color: '#00b0ba',
    fontSize: 18,
    marginBottom: 5,
  },
  stationCoords: {
    color: '#a0a0a0',
    fontSize: 14,
  },
});
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Row, Rows, Table } from 'react-native-table-component';

// 1. La base de données brute (objets au lieu de tableaux)
const rawPlayers = [
  { id: '1', name: 'Ben Gaming', country: 'France', region: 'Île-de-France', dept: '75', city: 'Paris', points: 500 },
  { id: '2', name: 'Ricardo Ronaldo', country: 'Portugal', region: 'Norte', dept: '-', city: 'Porto', points: 400 },
  { id: '3', name: 'Naomi Minato', country: 'Japan', region: 'Kanto', dept: 'Minato', city: 'Tokyo', points: 380 },
  { id: '4', name: 'Natalia Morgado', country: 'Spain', region: 'Andalousia', dept: '-', city: 'Malaga', points: 300 },
  { id: '5', name: 'Henrique Santos', country: 'Brazil', region: 'SP', dept: '-', city: 'Sao Paulo', points: 290 },
  { id: '6', name: 'Léa', country: 'France', region: 'Île-de-France', dept: '93', city: 'Saint-Denis', points: 280 },
];

const tableHead = ['N°', 'Player', 'Country', 'Region', 'Dept', 'City', 'Points'];
const widthArr = [40, 140, 100, 120, 80, 100, 80];

export default function Rankings() {
  // 2. Les états de nos filtres (null = pas de filtre actif)
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  // 3. Logique de filtrage (se recalcule automatiquement si un filtre change)
  const filteredData = useMemo(() => {
    let result = rawPlayers;

    if (activeCountry) result = result.filter(p => p.country === activeCountry);
    if (activeRegion) result = result.filter(p => p.region === activeRegion);
    if (activeCity) result = result.filter(p => p.city === activeCity);

    // Transformation en tableau de tableaux pour react-native-table-component
    return result.map((p, index) => [
      (index + 1).toString(), // Recalcule le rang basé sur le filtre
      p.name, p.country, p.region, p.dept, p.city, p.points.toString()
    ]);
  }, [activeCountry, activeRegion, activeCity]);

  // 4. Fonction de cascade : si on change de pays, on réinitialise le reste
  const handleCountryFilter = (country: string | null) => {
    setActiveCountry(country);
    setActiveRegion(null); // On reset la région
    setActiveCity(null);   // On reset la ville
  };

  return (
    <View style={styles.container}>
      {/* LA BARRE DE FILTRES */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filtres :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          
          {/* Bouton pour tout afficher */}
          <TouchableOpacity 
            style={[styles.filterChip, !activeCountry && styles.activeChip]} 
            onPress={() => handleCountryFilter(null)}
          >
            <Text style={[styles.chipText, !activeCountry && styles.activeChipText]}>Monde</Text>
          </TouchableOpacity>

          {/* Bouton France */}
          <TouchableOpacity 
            style={[styles.filterChip, activeCountry === 'France' && styles.activeChip]} 
            onPress={() => handleCountryFilter('France')}
          >
            <Text style={[styles.chipText, activeCountry === 'France' && styles.activeChipText]}>France</Text>
          </TouchableOpacity>

          {/* Si la France est sélectionnée, on affiche les sous-filtres */}
          {activeCountry === 'France' && (
            <TouchableOpacity 
              style={[styles.filterChip, activeRegion === 'Île-de-France' && styles.activeChip]} 
              onPress={() => setActiveRegion(activeRegion === 'Île-de-France' ? null : 'Île-de-France')}
            >
              <Text style={[styles.chipText, activeRegion === 'Île-de-France' && styles.activeChipText]}>
                Île-de-France
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Bouton Japon */}
          <TouchableOpacity 
            style={[styles.filterChip, activeCountry === 'Japan' && styles.activeChip]} 
            onPress={() => handleCountryFilter('Japan')}
          >
            <Text style={[styles.chipText, activeCountry === 'Japan' && styles.activeChipText]}>Japon</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </View>

      {/* LE TABLEAU (identique à ton code précédent) */}
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
        <View>
          <Table borderStyle={{ borderWidth: 2, borderColor: '#003CA6' }}>
            <Row data={tableHead} widthArr={widthArr} style={styles.head} textStyle={styles.headText} />
            <Rows data={filteredData} widthArr={widthArr} textStyle={styles.text} />
          </Table>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, paddingTop: 50, backgroundColor: '#f4f6f8' },
  // Styles pour les filtres
  filterSection: { marginBottom: 15 },
  filterTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  filterScroll: { flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  activeChip: {
    backgroundColor: '#003CA6', // Bleu RATP
    borderColor: '#003CA6',
  },
  chipText: { color: '#333', fontWeight: '600' },
  activeChipText: { color: '#FFF' },
  // Styles pour le tableau
  head: { height: 50, backgroundColor: '#003CA6' },
  headText: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: 'white' },
  text: { margin: 6, fontSize: 14, textAlign: 'center' },
});
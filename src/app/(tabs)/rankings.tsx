import { Picker } from '@react-native-picker/picker';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Row, Rows, Table } from 'react-native-table-component';

// Base de données brute pour le classement fictif
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
  // États pour les filtres actifs
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');

  // Extraire dynamiquement les options uniques pour les Pickers
  const countryOptions = useMemo(() => {
    const countries = rawPlayers.map(p => p.country);
    return ['All', ...Array.from(new Set(countries))];
  }, []);

  const regionOptions = useMemo(() => {
    if (selectedCountry === 'All') return ['All'];
    const regions = rawPlayers
      .filter(p => p.country === selectedCountry)
      .map(p => p.region);
    return ['All', ...Array.from(new Set(regions))];
  }, [selectedCountry]);

  const cityOptions = useMemo(() => {
    if (selectedRegion === 'All') return ['All'];
    const cities = rawPlayers
      .filter(p => p.region === selectedRegion)
      .map(p => p.city);
    return ['All', ...Array.from(new Set(cities))];
  }, [selectedRegion]);

  // Filtrer des joueurs selon leur localité
  const filteredData = useMemo(() => {
    let result = rawPlayers;

    if (selectedCountry !== 'All') result = result.filter(p => p.country === selectedCountry);
    if (selectedRegion !== 'All') result = result.filter(p => p.region === selectedRegion);
    if (selectedCity !== 'All') result = result.filter(p => p.city === selectedCity);

    return result.map((p, index) => [
      (index + 1).toString(),
      p.name, p.country, p.region, p.dept, p.city, p.points.toString()
    ]);
  }, [selectedCountry, selectedRegion, selectedCity]);

  // Gérer des changements avec réinitialisation en cascade
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedRegion('All');
    setSelectedCity('All');
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity('All');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classement RATP Trips</Text>

      {/* ZONE DES PICKERS */}
      <View style={styles.pickerContainer}>
        
        {/* Picker Pays */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Pays</Text>
          <View style={styles.pickerBackground}>
            <Picker
              selectedValue={selectedCountry}
              onValueChange={(itemValue) => handleCountryChange(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {countryOptions.map(c => <Picker.Item key={c} label={c === 'All' ? 'Monde' : c} value={c} />)}
            </Picker>
          </View>
        </View>

        {/* Picker Région */}
        {selectedCountry !== 'All' && (
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Région</Text>
            <View style={styles.pickerBackground}>
              <Picker
                selectedValue={selectedRegion}
                onValueChange={(itemValue) => handleRegionChange(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {regionOptions.map(r => <Picker.Item key={r} label={r === 'All' ? 'Toutes' : r} value={r} />)}
              </Picker>
            </View>
          </View>
        )}

        {/* Picker Ville */}
        {selectedRegion !== 'All' && (
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Ville</Text>
            <View style={styles.pickerBackground}>
              <Picker
                selectedValue={selectedCity}
                onValueChange={(itemValue) => setSelectedCity(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {cityOptions.map(c => <Picker.Item key={c} label={c === 'All' ? 'Toutes' : c} value={c} />)}
              </Picker>
            </View>
          </View>
        )}
      </View>

      {/* LE TABLEAU (Scroll horizontal) */}
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
  container: { flex: 1, padding: 10, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#003CA6', marginBottom: 20, textAlign: 'center' },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f4f6f8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1, // Chaque filtre prend une part égale de l'écran (1/3 si les 3 sont affichés)
    marginHorizontal: 4, // Laisse un petit espace entre chaque menu déroulant
  },
  label: {
    fontSize: 12, // Police légèrement réduite pour bien s'intégrer en largeur
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    marginLeft: 2,
  },
  pickerBackground: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    // Sur Android, le Picker peut déborder de ses bords arrondis, overflow corrige ça
    overflow: 'hidden', 
    height: 45, // Fixe une hauteur pour un design plus compact
    justifyContent: 'center',
  },
  picker: {
    // Le style du composant Picker lui-même
    width: '100%',
  },
  pickerItem: {
    // Spécifique à iOS pour réduire la taille du texte dans le rouleau
    fontSize: 14, 
  },
  head: { height: 50, backgroundColor: '#003CA6' },
  headText: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: 'white' },
  text: { margin: 6, fontSize: 14, textAlign: 'center' },
});
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

// --- DONNÉES DU NIVEAU ---
const LEVEL_INFO = {
  departure: 'Nation',
  arrival: 'La Défense',
};

// Les lignes disponibles pour ce niveau
const AVAILABLE_LINES = [
  { id: 'RERA', name: 'RER A', color: '#E3051C', textColor: '#FFF' },
  { id: 'M1', name: 'Ligne 1', color: '#FFCE00', textColor: '#000' },
  { id: 'M2', name: 'Ligne 2', color: '#0064B0', textColor: '#FFF' },
  { id: 'M6', name: 'Ligne 6', color: '#79BB92', textColor: '#FFF' },
  { id: 'M9', name: 'Ligne 9', color: '#D5C900', textColor: '#000' },
];

// Le dictionnaire contient maintenant un "baseScore" (score maximum possible pour ce trajet)
const ROUTE_SOLUTIONS: Record<string, { time: number, baseScore: number, feedback: string }> = {
  'RERA': { 
    time: 15, baseScore: 1000, 
    feedback: "Excellent choix ! Le RER A est le moyen le plus direct et le plus rapide." 
  },
  'M1': { 
    time: 28, baseScore: 800, 
    feedback: "C'est direct, mais le métro s'arrête très souvent par rapport au RER." 
  },
  'M2,M1': { 
    time: 35, baseScore: 600, 
    feedback: "Itinéraire avec changement à Charles de Gaulle - Étoile. Ça fonctionne !" 
  },
  'M6,M1': { 
    time: 38, baseScore: 550, 
    feedback: "Changement à Étoile après avoir longé le sud de Paris. Un peu long !" 
  },
  'M9,M1': { 
    time: 33, baseScore: 600, 
    feedback: "Changement à Franklin D. Roosevelt. Bien pensé mais moins rapide que le RER." 
  }
};

const SUCCESS_GREEN = '#4CAF50';
const DANGER_RED = '#E53935';

export default function TripsGame() {
  const router = useRouter();
  
  // L'itinéraire construit par le joueur (ex: ['M2', 'M1'])
  const [currentRoute, setCurrentRoute] = useState<string[]>([]);

  // Ajouter une ligne à l'itinéraire
  const handleAddLine = (lineId: string) => {
    if (currentRoute.length < 4) {
      setCurrentRoute([...currentRoute, lineId]);
    } else {
      const msg = "Itinéraire trop long ! Trouve un chemin avec moins de changements.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Limite atteinte", msg);
    }
  };

  // Retirer la dernière ligne ajoutée
  const handleRemoveLastLine = () => {
    setCurrentRoute(currentRoute.slice(0, -1));
  };

  const handleReset = () => {
    setCurrentRoute([]);
  };

  const handleValidate = () => {
    if (currentRoute.length === 0) {
      const msg = "Tu dois choisir au moins une ligne pour voyager !";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Erreur", msg);
      return;
    }

    const routeKey = currentRoute.join(',');
    const solution = ROUTE_SOLUTIONS[routeKey];

    if (solution) {
      // --- CALCUL DYNAMIQUE DE LA PÉNALITÉ ---
      const connectionsCount = currentRoute.length - 1; // Nombre de correspondances
      const penalty = connectionsCount * 50; // 50 points de malus par correspondance
      const finalScore = Math.max(0, solution.baseScore - penalty); // Évite les scores négatifs

      // Construction du message de résultat
      let resultMessage = `Temps estimé : ${solution.time} min\n`;
      resultMessage += `Score de base du trajet : ${solution.baseScore} pts\n`;
      if (connectionsCount > 0) {
        resultMessage += `Malus correspondances (${connectionsCount}) : -${penalty} pts\n`;
      }
      resultMessage += `\nScore Final : ${finalScore} pts\n\n${solution.feedback}`;
      
      if (Platform.OS === 'web') {
        window.alert(`✅ Itinéraire Valide !\n\n${resultMessage}`);
        router.push('/');
      } else {
        Alert.alert(
          finalScore >= 1000 ? "🌟 Trajet Parfait ! 🌟" : "✅ Trajet Valide !",
          resultMessage,
          [{ text: "Retour au menu", onPress: () => router.push('/') }],
          { cancelable: false }
        );
      }
    } else {
      const errorMsg = "Ce trajet n'est pas valide ou n'est pas répertorié pour relier ces deux gares. Réessaye !";
      if (Platform.OS === 'web') {
        window.alert(`❌ Oups...\n\n${errorMsg}`);
        handleReset();
      } else {
        Alert.alert("❌ Oups...", errorMsg, [{ text: "Réessayer", onPress: handleReset }], { cancelable: false });
      }
    }
  };

  const getLineData = (id: string) => AVAILABLE_LINES.find(l => l.id === id);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mode Trips : Meilleur Itinéraire</Text>

      {/* ZONE DE L'ITINÉRAIRE (HAUT) */}
      <View style={styles.routeArea}>
        <View style={styles.stationsCard}>
          <View style={styles.pointRow}>
            <View style={[styles.dot, { backgroundColor: '#003CA6' }]} />
            <Text style={styles.stationText}>Départ : <Text style={styles.stationName}>{LEVEL_INFO.departure}</Text></Text>
          </View>
          
          <View style={styles.routePathContainer}>
            <View style={styles.verticalLine} />
            
            {currentRoute.length === 0 ? (
              <Text style={styles.emptyPathText}>Sélectionnez une ligne en bas...</Text>
            ) : (
              currentRoute.map((lineId, index) => {
                const line = getLineData(lineId);
                return (
                  <TouchableOpacity key={index} onPress={handleRemoveLastLine} activeOpacity={0.7}>
                    <View style={styles.selectedLineBadge}>
                      <View style={[styles.lineLogo, { backgroundColor: line?.color }]}>
                        <Text style={[styles.lineLogoText, { color: line?.textColor }]}>{line?.name.replace('Ligne ', '')}</Text>
                      </View>
                      <Text style={styles.selectedLineText}>Prendre {line?.name}</Text>
                      {index === currentRoute.length - 1 && (
                        <Text style={styles.deleteHint}> (Toucher pour retirer)</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={styles.pointRow}>
            <View style={[styles.dot, { backgroundColor: '#E53935' }]} />
            <Text style={styles.stationText}>Arrivée : <Text style={styles.stationName}>{LEVEL_INFO.arrival}</Text></Text>
          </View>
        </View>
      </View>

      {/* ZONE DE SÉLECTION (BAS) */}
      <View style={styles.bottomPanel}>
        <Text style={styles.instructionText}>Construis ton itinéraire :</Text>
        
        <View style={styles.scrollWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.linesContainer}
          >
            {AVAILABLE_LINES.map((line) => (
              <TouchableOpacity 
                key={line.id} 
                style={[styles.lineButton, { borderColor: line.color }]}
                onPress={() => handleAddLine(line.id)}
              >
                <View style={[styles.lineLogoLarge, { backgroundColor: line.color }]}>
                  <Text style={[styles.lineLogoTextLarge, { color: line.textColor }]}>
                    {line.name.replace('Ligne ', '')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={handleReset}>
            <Text style={styles.actionButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.validateButton]} onPress={handleValidate}>
            <Text style={styles.actionButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#003CA6', textAlign: 'center', marginTop: 20 },
  
  // --- ZONE ITINÉRAIRE ---
  routeArea: { flex: 2, padding: 20, justifyContent: 'center' },
  stationsCard: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, 
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
  },
  pointRow: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  dot: { width: 16, height: 16, borderRadius: 8, marginRight: 12, borderWidth: 3, borderColor: '#FFF', elevation: 2 },
  stationText: { fontSize: 16, color: '#666' },
  stationName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  routePathContainer: { marginLeft: 7, paddingVertical: 15, paddingLeft: 25, position: 'relative', minHeight: 80, justifyContent: 'center' },
  verticalLine: { position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, backgroundColor: '#E0E0E0', zIndex: 1 },
  emptyPathText: { color: '#AAA', fontStyle: 'italic', fontSize: 14 },
  
  selectedLineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F8', padding: 8, borderRadius: 12, marginBottom: 8, alignSelf: 'flex-start' },
  lineLogo: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  lineLogoText: { fontWeight: 'bold', fontSize: 12 },
  selectedLineText: { fontSize: 14, fontWeight: '600', color: '#333' },
  deleteHint: { fontSize: 10, color: '#999', marginLeft: 5 },

  // --- ZONE DU BAS ---
  bottomPanel: { 
    flex: 1.2, backgroundColor: '#F4F6F8', borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    padding: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, justifyContent: 'space-between'
  },
  instructionText: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 10, textAlign: 'center' },
  
  scrollWrapper: { height: 80, justifyContent: 'center' },
  linesContainer: { alignItems: 'center', paddingHorizontal: 10 },
  lineButton: { 
    width: 60, height: 60, borderRadius: 30, borderWidth: 3, justifyContent: 'center', alignItems: 'center', 
    marginHorizontal: 8, backgroundColor: '#FFF', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2
  },
  lineLogoLarge: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  lineLogoTextLarge: { fontWeight: 'bold', fontSize: 20 },

  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 },
  actionButton: { flex: 1, paddingVertical: 15, borderRadius: 12, marginHorizontal: 8, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  resetButton: { backgroundColor: DANGER_RED },
  validateButton: { backgroundColor: SUCCESS_GREEN },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
});
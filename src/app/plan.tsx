import { useRef, useState } from 'react';
import {
    Alert, Animated,
    Dimensions,
    PanResponder,
    SafeAreaView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

// Dimensions de l'écran pour calculer les zones de largage
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLUMN_WIDTH = SCREEN_WIDTH / 4; // Divise l'écran en 4 colonnes pour les 4 stations

// Les données de la ligne 3bis
const CORRECT_ORDER = ['Porte des Lilas', 'Saint-Fargeau', 'Pelleport', 'Gambetta'];
const INITIAL_AVAILABLE = ['Gambetta', 'Saint-Fargeau', 'Porte des Lilas', 'Pelleport'];

// Couleurs RATP
const LINE_COLOR = '#8ED7D8'; 
const TEXT_BLUE = '#003CA6';

// --- COMPOSANT DE LA STATION GLISSANTE (DRAG & DROP) ---
const DraggableStation = ({ stationName, onDrop }: { stationName: string, onDrop: (x: number, y: number, station: string) => boolean }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false } // Doit être false pour manipuler le Layout
      ),
      onPanResponderRelease: (e, gestureState) => {
        // gestureState.moveX/moveY donne la position finale du doigt sur l'écran
        const isDroppedInZone = onDrop(gestureState.moveX, gestureState.moveY, stationName);

        if (!isDroppedInZone) {
          // Si on rate la cible, la station revient à sa place (effet ressort)
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 5,
          }).start();
        } else {
          // Si placée, on réinitialise discrètement sa position pour le prochain essai
          pan.setValue({ x: 0, y: 0 }); 
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[pan.getLayout(), styles.draggableItem]}
    >
      <Text style={styles.draggableText}>{stationName}</Text>
    </Animated.View>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function PlansGame() {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [availableStations, setAvailableStations] = useState<string[]>(INITIAL_AVAILABLE);

  // Gère la logique quand une station est lâchée par le joueur
  const handleDrop = (moveX: number, moveY: number, station: string) => {
    // Si lâché dans la moitié supérieure de l'écran (Zone de la carte)
    if (moveY < SCREEN_HEIGHT * 0.6) {
      // Calcule l'index de la case en fonction de la position horizontale du doigt
      const dropIndex = Math.floor(moveX / COLUMN_WIDTH);
      const safeIndex = Math.max(0, Math.min(3, dropIndex)); // Sécurité entre 0 et 3

      // Si la case ciblée est vide
      if (slots[safeIndex] === null) {
        const newSlots = [...slots];
        newSlots[safeIndex] = station;
        setSlots(newSlots);
        setAvailableStations(prev => prev.filter(s => s !== station));

        // Vérification de la victoire
        if (newSlots.every(s => s !== null)) {
          const completedLine = newSlots.filter((s): s is string => s !== null);
          checkWinCondition(completedLine);
        }
        return true; // Confirme au composant Draggable qu'il a été placé
      }
    }
    return false; // Rejette le placement
  };

  // Permet de retirer une station déjà placée en tapant dessus
  const handleRemoveStation = (index: number) => {
    const station = slots[index];
    if (station) {
      const newSlots = [...slots];
      newSlots[index] = null;
      setSlots(newSlots);
      setAvailableStations([...availableStations, station]);
    }
  };

  const checkWinCondition = (currentPlacement: string[]) => {
    if (JSON.stringify(currentPlacement) === JSON.stringify(CORRECT_ORDER)) {
      Alert.alert("Bravo !", "La ligne 3 bis est parfaitement reconstruite ! 🎉");
    } else {
      Alert.alert("Oups...", "L'ordre n'est pas le bon. Touche une station pour la retirer de la ligne.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mode Plans : Ligne 3bis</Text>

      {/* ZONE DE JEU (Cibles) */}
      <View style={styles.gameArea}>
        <View style={styles.lineContainer}>
          
          {/* Ligne absolue de fond */}
          <View style={styles.trackLine} />

          {/* Les 4 emplacements */}
          {slots.map((stationName, index) => {
            const isTerminus = index === 0 || index === slots.length - 1;

            return (
              <View key={`slot-${index}`} style={styles.stationNodeContainer}>
                
                {/* Si vide : Cible pointillée. Si rempli : Texte incliné */}
                {!stationName ? (
                  <View style={styles.dropZoneTarget}>
                    <Text style={styles.dropZoneText}>Glisser ici</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.labelWrapper}
                    onPress={() => handleRemoveStation(index)}
                  >
                    <Text 
                      style={[
                        styles.stationLabel, 
                        isTerminus ? styles.terminusLabel : null
                      ]}
                      numberOfLines={1}
                    >
                      {stationName}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Le point sur la ligne */}
                <View 
                  style={[
                    styles.nodeCircle, 
                    stationName ? (isTerminus ? styles.nodeTerminus : styles.nodeFilled) : styles.nodeEmpty
                  ]}
                >
                  {isTerminus && stationName ? <View style={styles.nodeTerminusInner} /> : null}
                </View>

              </View>
            );
          })}
        </View>
      </View>

      {/* ZONE DES CHOIX (Draggable) */}
      <View style={styles.choicesArea}>
        <Text style={styles.instructionText}>Glissez les stations sur la ligne :</Text>
        <View style={styles.choicesContainer}>
          {availableStations.map((station) => (
            <DraggableStation 
              key={station} 
              stationName={station} 
              onDrop={handleDrop} 
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#8ED7D8', textAlign: 'center', marginTop: 20 },
  
  // -- ZONE DE JEU --
  gameArea: { flex: 2, justifyContent: 'center', paddingHorizontal: 10, zIndex: -1 },
  lineContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', position: 'relative', height: 180 },
  trackLine: { position: 'absolute', left: 20, right: 20, bottom: 20, height: 6, backgroundColor: LINE_COLOR, zIndex: 0 },
  stationNodeContainer: { alignItems: 'center', justifyContent: 'flex-end', height: '100%', flex: 1, zIndex: 1 },
  
  // Cible pointillée (quand vide)
  dropZoneTarget: {
    width: 60,
    height: 40,
    borderWidth: 2,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 45,
  },
  dropZoneText: { color: '#999', fontSize: 10, textAlign: 'center' },

  // Texte incliné (quand rempli)
  labelWrapper: { position: 'absolute', bottom: 45, width: 120, alignItems: 'flex-start', transform: [{ rotate: '-45deg' }, { translateX: 30 }, { translateY: 20 }] },
  stationLabel: { fontSize: 14, fontWeight: 'bold', color: TEXT_BLUE },
  terminusLabel: { backgroundColor: TEXT_BLUE, color: '#FFF', paddingHorizontal: 4, paddingVertical: 2 },
  
  // Nœuds
  nodeCircle: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 13 },
  nodeEmpty: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#CCC' },
  nodeFilled: { backgroundColor: LINE_COLOR },
  nodeTerminus: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#000' },
  nodeTerminusInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#000' },
  
  // -- ZONE DES CHOIX --
  choicesArea: { flex: 1, backgroundColor: '#F4F6F8', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, zIndex: 10 },
  instructionText: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 15, textAlign: 'center' },
  choicesContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  
  // Composant Draggable
  draggableItem: { backgroundColor: TEXT_BLUE, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, margin: 6, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3 },
  draggableText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});
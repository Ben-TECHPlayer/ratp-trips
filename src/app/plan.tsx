import { useRouter } from "expo-router";
// import { useNavigation } from "expo-router/react-navigation";
import React, { useRef, useState } from 'react';
import {
    Alert, Animated,
    Dimensions,
    PanResponder,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CORRECT_ORDER = ['Porte des Lilas', 'Saint-Fargeau', 'Pelleport', 'Gambetta'];
const INITIAL_AVAILABLE = ['Gambetta', 'Saint-Fargeau', 'Porte des Lilas', 'Pelleport'];

const LINE_COLOR = '#8ED7D8'; 
const TEXT_BLUE = '#003CA6';
const SUCCESS_GREEN = '#4CAF50';
const DANGER_RED = '#E53935';

// --- COMPOSANT DE LA STATION GLISSANTE ---
const DraggableStation = ({ stationName, onDrop, onDragStart, onDragEnd }: { 
  stationName: string, 
  onDrop: (x: number, y: number, station: string) => boolean,
  onDragStart: () => void,
  onDragEnd: () => void
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isVerticalMovement = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        return isVerticalMovement && Math.abs(gestureState.dy) > 5;
      },
      
      onPanResponderGrant: () => {
        onDragStart();
      },
      
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      
      onPanResponderRelease: (e, gestureState) => {
        onDragEnd();
        
        const isDroppedInZone = onDropRef.current(gestureState.moveX, gestureState.moveY, stationName);

        if (!isDroppedInZone) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 5,
          }).start();
        } else {
          pan.setValue({ x: 0, y: 0 }); 
        }
      },
      onPanResponderTerminate: () => {
        onDragEnd();
      }
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
  const router = useRouter();
//   const navigation = useNavigation();
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [availableStations, setAvailableStations] = useState<string[]>(INITIAL_AVAILABLE);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  const handleDrop = (moveX: number, moveY: number, station: string) => {
    if (moveY < SCREEN_HEIGHT * 0.65) { 
      const zoneCenters = [
        SCREEN_WIDTH * 0.125,
        SCREEN_WIDTH * 0.375,
        SCREEN_WIDTH * 0.625,
        SCREEN_WIDTH * 0.875,
      ];

      let closestIndex = -1;
      let minDistance = Infinity;

      zoneCenters.forEach((centerX, index) => {
        if (slots[index] === null) { 
          const distance = Math.abs(moveX - centerX);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        }
      });

      if (closestIndex !== -1 && minDistance < (SCREEN_WIDTH / 3)) {
        const newSlots = [...slots];
        newSlots[closestIndex] = station;
        setSlots(newSlots);
        setAvailableStations(prev => prev.filter(s => s !== station));
        return true; 
      }
    }
    return false;
  };

  const handleRemoveStation = (index: number) => {
    const station = slots[index];
    if (station) {
      const newSlots = [...slots];
      newSlots[index] = null;
      setSlots(newSlots);
      setAvailableStations([...availableStations, station]);
    }
  };

  const handleValidate = () => {
    if (slots.includes(null)) {
      if (Platform.OS === 'web') {
        window.alert("Ligne incomplète ! Place toutes les stations.");
      } else {
        Alert.alert("Ligne incomplète", "Place toutes les stations sur la ligne avant de valider !");
      }
      return;
    }

    if (JSON.stringify(slots) === JSON.stringify(CORRECT_ORDER)) {
      if (Platform.OS === 'web') {
        window.alert("C'est bon ! 🎉 Retour au menu.");
        router.push('/');
      } else {
        Alert.alert(
          "C'est bon ! 🎉", 
          "La ligne 3 bis est parfaitement reconstruite.",
          [{ text: "Retour au menu", onPress: () => router.push("/") }],
          { cancelable: false }
        );
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert("Mauvaise réponse... L'ordre n'est pas correct. On recommence !");
        handleReset();
      } else {
        Alert.alert(
          "Mauvaise réponse...", 
          "L'ordre n'est pas correct. On recommence !",
          [{ text: "Réessayer", onPress: () => handleReset() }],
          { cancelable: false }
        );
      }
    }
  };

  const handleReset = () => {
    setSlots([null, null, null, null]);
    setAvailableStations(INITIAL_AVAILABLE);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mode Plans : Ligne 3bis</Text>

      {/* ZONE DE JEU */}
      <View style={styles.gameArea}>
        <View style={styles.lineContainer}>
          <View style={styles.trackLine} />

          {slots.map((stationName, index) => {
            const isTerminus = index === 0 || index === slots.length - 1;

            return (
              <View key={`slot-${index}`} style={styles.stationNodeContainer}>
                {!stationName ? (
                  <View style={styles.dropZoneTarget}>
                    <Text style={styles.dropZoneText}>Glisser ici</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.labelWrapper}
                    onPress={() => handleRemoveStation(index)}
                  >
                    <Text style={[styles.stationLabel, isTerminus ? styles.terminusLabel : null]} numberOfLines={1}>
                      {stationName}
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={[styles.nodeCircle, stationName ? (isTerminus ? styles.nodeTerminus : styles.nodeFilled) : styles.nodeEmpty]}>
                  {isTerminus && stationName ? <View style={styles.nodeTerminusInner} /> : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ZONE DU BAS */}
      <View style={styles.bottomPanel}>
        
        <View style={styles.dragZoneWrapper}>
          <Text style={styles.instructionText}>Glissez les stations sur la ligne :</Text>
          
          <View style={styles.scrollBoundary}>
            <ScrollView 
              horizontal={true}
              scrollEnabled={isScrollEnabled}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.choicesContainer}
              style={{ overflow: 'hidden' }} 
            >
              {availableStations.map((station) => (
                <DraggableStation 
                  key={station} 
                  stationName={station} 
                  onDrop={handleDrop} 
                  onDragStart={() => setIsScrollEnabled(false)}
                  onDragEnd={() => setIsScrollEnabled(true)}
                />
              ))}
            </ScrollView>
          </View>
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#8ED7D8', textAlign: 'center', marginTop: 20 },
  
  gameArea: { flex: 2, justifyContent: 'center', paddingHorizontal: 10, zIndex: 1 },
  lineContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', position: 'relative', height: 180 },
  trackLine: { position: 'absolute', left: 20, right: 20, bottom: 20, height: 6, backgroundColor: LINE_COLOR, zIndex: 0 },
  stationNodeContainer: { alignItems: 'center', justifyContent: 'flex-end', height: '100%', flex: 1, zIndex: 2 },
  
  dropZoneTarget: { width: 60, height: 40, borderWidth: 2, borderColor: '#CCC', borderStyle: 'dashed', borderRadius: 8, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 45 },
  dropZoneText: { color: '#999', fontSize: 10, textAlign: 'center' },

  labelWrapper: { position: 'absolute', bottom: 45, width: 120, alignItems: 'flex-start', transform: [{ rotate: '-45deg' }, { translateX: 30 }, { translateY: 20 }] },
  stationLabel: { fontSize: 14, fontWeight: 'bold', color: TEXT_BLUE },
  terminusLabel: { backgroundColor: TEXT_BLUE, color: '#FFF', paddingHorizontal: 4, paddingVertical: 2 },
  
  nodeCircle: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 13 },
  nodeEmpty: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#CCC' },
  nodeFilled: { backgroundColor: LINE_COLOR },
  nodeTerminus: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#000' },
  nodeTerminusInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#000' },
  
  bottomPanel: { flex: 1.2, backgroundColor: '#F4F6F8', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, zIndex: 10, justifyContent: 'space-between' },
  
  dragZoneWrapper: { flex: 1, zIndex: 100 },
  instructionText: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 15, textAlign: 'center' },
  
  scrollBoundary: { overflow: 'hidden', marginHorizontal: -20 },
  choicesContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, minHeight: 60 },
  
  draggableItem: { backgroundColor: TEXT_BLUE, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginHorizontal: 8, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, height: 45, justifyContent: 'center', zIndex: 999 },
  draggableText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // LA SOLUTION EST LÀ : Ajout de zIndex et elevation pour repasser au-dessus de dragZoneWrapper
  actionButtonsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingBottom: 10,
    zIndex: 1000, 
    elevation: 20 
  },
  actionButton: { flex: 1, paddingVertical: 15, borderRadius: 12, marginHorizontal: 8, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  resetButton: { backgroundColor: DANGER_RED },
  validateButton: { backgroundColor: SUCCESS_GREEN },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
});
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    LayoutChangeEvent,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

// --- DONNÉES DU NIVEAU ---
const MISSION = {
  stationName: "George V",
  line: "Ligne 1",
  trueX: 38, // 38% en partant de la gauche
  trueY: 35, // 35% en partant du haut
};

// URL d'une carte vierge des arrondissements de Paris
const PARIS_MAP_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Paris_arrondissements_map_blank.svg/800px-Paris_arrondissements_map_blank.svg.png';

const SUCCESS_GREEN = '#4CAF50';
const DANGER_RED = '#E53935';
const TEXT_BLUE = '#003CA6';

export default function MapsGame() {
  const router = useRouter();
  
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [guess, setGuess] = useState<{ x: number, y: number } | null>(null);
  const [hasValidated, setHasValidated] = useState(false);

  const handleMapLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMapSize({ width, height });
  };

  // Gère le clic du joueur sur la carte (Adapté pour Web ET Mobile)
  const handleMapPress = (event: any) => {
    if (hasValidated) return;

    // LA CORRECTION EST ICI :
    // On récupère les coordonnées. Si on est sur Web, locationX est vide, donc on utilise offsetX.
    const { nativeEvent } = event;
    const x = nativeEvent.locationX ?? nativeEvent.offsetX;
    const y = nativeEvent.locationY ?? nativeEvent.offsetY;

    // Sécurité au cas où la taille de la carte ne soit pas encore calculée
    if (!mapSize.width || !mapSize.height || x === undefined || y === undefined) return;

    const xPercent = (x / mapSize.width) * 100;
    const yPercent = (y / mapSize.height) * 100;
    
    setGuess({ x: xPercent, y: yPercent });
  };

  const handleReset = () => {
    setGuess(null);
    setHasValidated(false);
  };

  const handleValidate = () => {
    if (!guess) {
      const msg = "Tu dois planter ta punaise sur la carte avant de valider !";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Erreur", msg);
      return;
    }

    setHasValidated(true);

    const diffX = guess.x - MISSION.trueX;
    const diffY = guess.y - MISSION.trueY;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    let score = 0;
    let feedback = "";

    if (distance <= 4) {
      score = 1000;
      feedback = "C'est un coup de maître ! Tu es exactement sur les Champs-Élysées.";
    } else if (distance <= 10) {
      score = 750;
      feedback = "Très proche ! C'est dans le bon quartier.";
    } else if (distance <= 20) {
      score = 300;
      feedback = "Pas mal, mais tu t'es trompé d'arrondissement.";
    } else {
      score = 0;
      feedback = "Aïe, tu es complètement à l'autre bout de Paris !";
    }

    setTimeout(() => {
      const resultMessage = `Ton score : ${score} pts\n\n${feedback}`;
      
      if (Platform.OS === 'web') {
        window.alert(`🎯 Résultat :\n\n${resultMessage}`);
      } else {
        Alert.alert(
          score >= 750 ? "🎯 Bien joué !" : "❌ Oups...",
          resultMessage,
          [
            { text: "Voir la carte", style: 'cancel' },
            { text: "Retour au menu", onPress: () => router.push('/') }
          ],
          { cancelable: false }
        );
      }
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mode Maps : GeoGuessr</Text>

      {/* ZONE DE MISSION */}
      <View style={styles.missionCard}>
        <Text style={styles.missionSub}>Plante ta punaise sur la station :</Text>
        <Text style={styles.missionStation}>{MISSION.stationName}</Text>
        <View style={styles.lineBadge}>
          <Text style={styles.lineText}>{MISSION.line}</Text>
        </View>
      </View>

      {/* ZONE DE LA CARTE */}
      <View style={styles.mapContainer} onLayout={handleMapLayout}>
        <Pressable style={styles.mapPressable} onPress={handleMapPress}>
          <Image 
            source={{ uri: PARIS_MAP_URL }} 
            style={styles.mapImage} 
            resizeMode="contain"
          />

          {/* LA PUNAISE DU JOUEUR (Bleue) */}
          {guess && (
            <View 
              style={[
                styles.pin, 
                styles.playerPin,
                { left: `${guess.x}%`, top: `${guess.y}%` }
              ]} 
            >
              <View style={styles.pinDot} />
            </View>
          )}

          {/* LA VRAIE STATION (Verte - Révélée uniquement à la validation) */}
          {hasValidated && (
            <View 
              style={[
                styles.pin, 
                styles.truePin,
                { left: `${MISSION.trueX}%`, top: `${MISSION.trueY}%` }
              ]} 
            >
              <View style={styles.truePinDot} />
              <Text style={styles.truePinLabel}>{MISSION.stationName}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ZONE DU BAS */}
      <View style={styles.bottomPanel}>
        <Text style={styles.instructionText}>
          {hasValidated 
            ? "La vraie station est en vert !" 
            : "Touche la carte pour placer ton repère"}
        </Text>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.resetButton]} 
            onPress={hasValidated ? () => router.push('/') : handleReset}
          >
            <Text style={styles.actionButtonText}>
              {hasValidated ? "Menu" : "Effacer"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.validateButton, 
              hasValidated && { backgroundColor: '#AAA' }
            ]} 
            onPress={handleValidate}
            disabled={hasValidated}
          >
            <Text style={styles.actionButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF' },
  title: { fontSize: 22, fontWeight: 'bold', color: TEXT_BLUE, textAlign: 'center', marginVertical: 15 },
  
  missionCard: { 
    backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 15, padding: 15, 
    borderRadius: 15, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  missionSub: { fontSize: 14, color: '#666', marginBottom: 5 },
  missionStation: { fontSize: 24, fontWeight: '900', color: '#333', marginBottom: 10 },
  lineBadge: { backgroundColor: '#FFCE00', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  lineText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

  mapContainer: { 
    flex: 1, marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 15, 
    overflow: 'hidden', borderWidth: 2, borderColor: '#DDD', elevation: 5 
  },
  mapPressable: { flex: 1, position: 'relative' },
  mapImage: { width: '100%', height: '100%', opacity: 0.8 },

  pin: { 
    position: 'absolute', width: 24, height: 24, marginLeft: -12, marginTop: -12, 
    justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 3, 
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3
  },
  playerPin: { backgroundColor: 'rgba(0, 60, 166, 0.3)', borderColor: TEXT_BLUE },
  pinDot: { width: 8, height: 8, backgroundColor: TEXT_BLUE, borderRadius: 4 },
  
  truePin: { backgroundColor: 'rgba(76, 175, 80, 0.3)', borderColor: SUCCESS_GREEN, zIndex: 10 },
  truePinDot: { width: 8, height: 8, backgroundColor: SUCCESS_GREEN, borderRadius: 4 },
  truePinLabel: { 
    position: 'absolute', top: -25, backgroundColor: SUCCESS_GREEN, color: '#FFF', 
    fontWeight: 'bold', fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, 
    borderRadius: 5, overflow: 'hidden', width: 80, textAlign: 'center'
  },

  bottomPanel: { 
    backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    padding: 20, paddingTop: 25, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, 
    marginTop: 15
  },
  instructionText: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 15, textAlign: 'center' },
  
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 },
  actionButton: { flex: 1, paddingVertical: 15, borderRadius: 12, marginHorizontal: 8, alignItems: 'center', elevation: 3 },
  resetButton: { backgroundColor: DANGER_RED },
  validateButton: { backgroundColor: SUCCESS_GREEN },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
});
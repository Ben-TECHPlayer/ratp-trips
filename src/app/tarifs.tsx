import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert, Platform,
    SafeAreaView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

// --- DONNÉES DU NIVEAU ---
const TICKET_MISSION = {
  destination: "Aéroport d'Orly",
  transport: "Métro Ligne 14",
  description: "Tarif spécial aéroportuaire (Aller simple)",
  exactPriceInCents: 1030, // Astuce de pro : on compte en centimes (1030 = 10,30€) pour éviter les bugs de virgule en JavaScript !
};

// Les valeurs d'argent disponibles (en centimes)
const MONEY_OPTIONS = [
  { value: 1000, label: '10 €', type: 'bill' },
  { value: 500, label: '5 €', type: 'bill' },
  { value: 200, label: '2 €', type: 'coin' },
  { value: 100, label: '1 €', type: 'coin' },
  { value: 50, label: '50 c', type: 'coin' },
  { value: 20, label: '20 c', type: 'coin' },
  { value: 10, label: '10 c', type: 'coin' },
];

const SUCCESS_GREEN = '#4CAF50';
const DANGER_RED = '#E53935';
const TEXT_BLUE = '#003CA6';

export default function TarifsGame() {
  const router = useRouter();
  
  // L'argent inséré par le joueur (en centimes)
  const [insertedAmount, setInsertedAmount] = useState<number>(0);

  // Ajoute de l'argent dans la machine
  const handleAddMoney = (amount: number) => {
    // On limite à 50€ max pour éviter que le joueur ne clique à l'infini
    if (insertedAmount + amount <= 5000) {
      setInsertedAmount(prev => prev + amount);
    }
  };

  // Retire la totalité de la monnaie
  const handleReset = () => {
    setInsertedAmount(0);
  };

  // Validation du ticket
  const handleValidate = () => {
    if (insertedAmount === 0) {
      const msg = "Veuillez insérer de la monnaie avant de valider.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Machine vide", msg);
      return;
    }

    if (insertedAmount === TICKET_MISSION.exactPriceInCents) {
      // VICTOIRE
      const winMsg = "Impression du billet en cours... Bon voyage vers Orly ! ✈️";
      if (Platform.OS === 'web') {
        window.alert(`✅ Le compte est bon !\n\n${winMsg}`);
        router.push('/');
      } else {
        Alert.alert(
          "✅ Le compte est bon !", 
          winMsg,
          [{ text: "Retour au menu", onPress: () => router.push('/') }],
          { cancelable: false }
        );
      }
    } else if (insertedAmount > TICKET_MISSION.exactPriceInCents) {
      // TROP CHER
      const diff = ((insertedAmount - TICKET_MISSION.exactPriceInCents) / 100).toFixed(2);
      const msg = `La machine indique que le tarif est plus bas. L'appoint est exigé ! (Tu as mis ${diff} € de trop).`;
      if (Platform.OS === 'web') {
        window.alert(`❌ Trop d'argent !\n\n${msg}`);
        handleReset();
      } else {
        Alert.alert("❌ Trop d'argent !", msg, [{ text: "Reprendre ma monnaie", onPress: handleReset }]);
      }
    } else {
      // PAS ASSEZ
      const diff = ((TICKET_MISSION.exactPriceInCents - insertedAmount) / 100).toFixed(2);
      const msg = `Il manque encore ${diff} € pour acheter ce ticket.`;
      if (Platform.OS === 'web') {
        window.alert(`❌ Montant insuffisant\n\n${msg}`);
      } else {
        Alert.alert("❌ Montant insuffisant", msg, [{ text: "Continuer à insérer", style: "cancel" }]);
      }
    }
  };

  // Formate les centimes en affichage Euro (ex: 1030 -> "10.30")
  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2) + ' €';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mode Tarifs : Le Juste Prix</Text>

      {/* ZONE DU TICKET À ACHETER */}
      <View style={styles.missionArea}>
        <View style={styles.ticketCard}>
          <Text style={styles.ticketHeader}>TICKET SÉLECTIONNÉ</Text>
          <Text style={styles.ticketDestination}>{TICKET_MISSION.destination}</Text>
          <View style={styles.transportBadge}>
            <Text style={styles.transportText}>{TICKET_MISSION.transport}</Text>
          </View>
          <Text style={styles.ticketDesc}>{TICKET_MISSION.description}</Text>
        </View>
      </View>

      {/* L'ÉCRAN DE LA MACHINE (Montant inséré) */}
      <View style={styles.machineScreenContainer}>
        <View style={styles.machineScreen}>
          <Text style={styles.machineLabel}>MONTANT INSÉRÉ :</Text>
          <Text style={styles.machineAmount}>{formatCurrency(insertedAmount)}</Text>
        </View>
      </View>

      {/* ZONE DE PAIEMENT (Pièces et Billets) */}
      <View style={styles.paymentPanel}>
        <Text style={styles.instructionText}>Insérez la somme exacte :</Text>
        
        <View style={styles.moneyGrid}>
          {MONEY_OPTIONS.map((money, index) => {
            const isCoin = money.type === 'coin';
            return (
              <TouchableOpacity 
                key={index} 
                style={[isCoin ? styles.coinItem : styles.billItem]}
                onPress={() => handleAddMoney(money.value)}
                activeOpacity={0.6}
              >
                <Text style={[isCoin ? styles.coinText : styles.billText]}>
                  {money.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={handleReset}>
            <Text style={styles.actionButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.validateButton]} onPress={handleValidate}>
            <Text style={styles.actionButtonText}>Payer</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF' },
  title: { fontSize: 22, fontWeight: 'bold', color: TEXT_BLUE, textAlign: 'center', marginVertical: 15 },
  
  // --- TICKET INFO ---
  missionArea: { paddingHorizontal: 20, marginBottom: 15 },
  ticketCard: { 
    backgroundColor: '#FFF', borderRadius: 15, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  ticketHeader: { fontSize: 12, fontWeight: 'bold', color: '#999', letterSpacing: 1, marginBottom: 5 },
  ticketDestination: { fontSize: 22, fontWeight: '900', color: '#333', marginBottom: 10, textAlign: 'center' },
  transportBadge: { backgroundColor: '#612A7B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 10 }, // Violet Ligne 14
  transportText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  ticketDesc: { fontSize: 14, color: '#666', textAlign: 'center', fontStyle: 'italic' },

  // --- ÉCRAN DISTRIBUTEUR ---
  machineScreenContainer: { paddingHorizontal: 20, marginBottom: 20 },
  machineScreen: { 
    backgroundColor: '#1A1A1A', borderRadius: 10, padding: 20, alignItems: 'center',
    borderWidth: 4, borderColor: '#333',
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10
  },
  machineLabel: { color: '#00FF00', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, opacity: 0.8 },
  machineAmount: { color: '#00FF00', fontSize: 40, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 5 },

  // --- PANNEAU DE PAIEMENT ---
  paymentPanel: { 
    flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    padding: 20, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, justifyContent: 'space-between'
  },
  instructionText: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 15, textAlign: 'center' },
  
  moneyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 },
  
  // Style Billets
  billItem: { 
    backgroundColor: '#E8F5E9', width: 90, height: 50, borderRadius: 5, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#4CAF50',
    margin: 5, elevation: 3
  },
  billText: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  
  // Style Pièces
  coinItem: { 
    backgroundColor: '#FFD700', width: 60, height: 60, borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#DAA520',
    margin: 5, elevation: 4
  },
  coinText: { fontSize: 16, fontWeight: 'bold', color: '#8B6508' },

  // Boutons d'action
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 },
  actionButton: { flex: 1, paddingVertical: 15, borderRadius: 12, marginHorizontal: 8, alignItems: 'center', elevation: 3 },
  resetButton: { backgroundColor: DANGER_RED },
  validateButton: { backgroundColor: SUCCESS_GREEN },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
});
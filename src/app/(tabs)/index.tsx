import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
// import "../assets/fonts/SamsungSharpSans-Bold.ttf";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RATP Trips</Text>
      <Text style={styles.subtitle}>Testez vos connaissances du réseau parisien</Text>

      <Link href="/plan" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Plan</Text>
        </Pressable>
      </Link>

      <Link href="/maps" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Maps</Text>
        </Pressable>
      </Link>

      <Link href="/trips" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Itinéraires</Text>
        </Pressable>
      </Link>

      <Link href="/tarifs" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Tarifs</Text>
        </Pressable>
      </Link>

      {/* Utilisation de asChild pour pouvoir styliser le bouton avec Pressable */}
      <Link href="/quiz" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Quiz</Text>
        </Pressable>
      </Link>
    </View>
  );
}

// SamsungSharpSans-Bold.ttf

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#a0a0a0',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    fontFamily: 'SamsungSharpSans-Bold',
    backgroundColor: '#00b0ba', // Bleu RATP/IDFM
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
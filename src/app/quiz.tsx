import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
// Assurez-vous que ce fichier JSON existe bien à cet emplacement
import questionsData from '../../assets/data/questions.json';

export default function QuizScreen() {
  // États pour gérer la logique du jeu
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Récupération de la question actuelle
  const currentQuestion = questionsData[currentIndex];

  // Gestion du clic sur une réponse
  const handleAnswerSelect = (option: string) => {
    // Si l'utilisateur a déjà répondu, on bloque les clics supplémentaires
    if (selectedOption !== null) return;

    setSelectedOption(option);

    // Vérification de la bonne réponse
    if (option === currentQuestion.correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
  };

  // Passage à la question suivante ou fin de partie
  const handleNext = () => {
    if (currentIndex + 1 < questionsData.length) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setSelectedOption(null); // Réinitialisation de la sélection pour la nouvelle question
    } else {
      setQuizFinished(true); // Fin du quiz
    }
  };

  // ----------------------------------------------------
  // RENDU 1 : Écran de fin de partie
  // ----------------------------------------------------
  if (quizFinished) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🏆</Text>
          <Text style={styles.title}>Quiz Terminé !</Text>
          <Text style={styles.resultText}>
            Votre score est de : <Text style={styles.scoreHighlight}>{score} / {questionsData.length}</Text>
          </Text>
          <Link href="/" asChild>
            <Pressable style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Retour au Menu</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  // ----------------------------------------------------
  // RENDU 2 : Écran de jeu actif
  // ----------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Barre supérieure : Progression & Score */}
      <View style={styles.header}>
        <Text style={styles.progress}>Question {currentIndex + 1} / {questionsData.length}</Text>
        <Text style={styles.score}>Score : {score}</Text>
      </View>

      {/* Carte de la Question */}
      <View style={styles.card}>
        <Text style={styles.badge}>{currentQuestion.category} • {currentQuestion.subCategory}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      {/* Liste des Propositions */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          // Logique TypeScript-friendly pour les couleurs
          const isAnswered = selectedOption !== null;
          const isTheCorrectAnswer = option === currentQuestion.correctAnswer;
          const isTheSelectedAnswer = option === selectedOption;

          return (
            <Pressable
              key={index}
              style={[
                styles.optionButton,
                isAnswered && isTheCorrectAnswer && styles.correctAnswer,
                isAnswered && isTheSelectedAnswer && !isTheCorrectAnswer && styles.wrongAnswer,
                isAnswered && !isTheCorrectAnswer && !isTheSelectedAnswer && styles.disabledAnswer,
              ]}
              onPress={() => handleAnswerSelect(option)}
              disabled={isAnswered}
            >
              <Text style={[
                styles.optionText,
                isAnswered && !isTheCorrectAnswer && !isTheSelectedAnswer && styles.disabledText
              ]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Explication et Bouton Suivant (visibles uniquement après une réponse) */}
      {selectedOption !== null && (
        <View style={styles.footer}>
          <Text style={styles.explanationText}>
            💡 <Text style={{ fontWeight: 'bold' }}>Le saviez-vous ?</Text> {currentQuestion.explanation}
          </Text>
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex + 1 < questionsData.length ? 'Suivant ➡️' : 'Voir les résultats 🏁'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ----------------------------------------------------
// FEUILLE DE STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontFamily: 'SamsungSharpSans-Bold',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  progress: {
    color: '#a0a0a0',
    fontSize: 16,
    fontWeight: '600',
  },
  score: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#00b0ba',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    fontFamily: 'SamsungSharpSans-Bold',
    backgroundColor: '#353a40',
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  badge: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#00b0ba',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  questionText: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#4a5568',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionText: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  correctAnswer: {
    backgroundColor: '#2e7d32', // Vert
  },
  wrongAnswer: {
    backgroundColor: '#c62828', // Rouge
  },
  disabledAnswer: {
    backgroundColor: '#2d3748', // Gris foncé
    opacity: 0.5,
  },
  disabledText: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#a0aec0',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 20,
  },
  explanationText: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  nextButton: {
    fontFamily: 'SamsungSharpSans-Bold',
    backgroundColor: '#00b0ba',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#00b0ba',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#cbd5e1',
    fontSize: 18,
    marginBottom: 20,
  },
  scoreHighlight: {
    fontFamily: 'SamsungSharpSans-Bold',
    color: '#00b0ba',
    fontWeight: 'bold',
    fontSize: 22,
  },
});
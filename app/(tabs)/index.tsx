import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Personal Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Focus</Text>
        <Text style={styles.cardSubtitle}>Check your planner for today's tasks</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Projects</Text>
        <Text style={styles.cardSubtitle}>Go to Projects tab to view all</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pending Actions</Text>
        <Text style={styles.cardSubtitle}>Go to Actions tab to view all</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1a1a1a' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  cardSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
});

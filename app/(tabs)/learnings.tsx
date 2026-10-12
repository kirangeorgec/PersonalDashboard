import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import type { Learning } from '../../src/types';

const LEARNINGS_KEY = 'learnings';

export default function LearningsScreen() {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newLearning, setNewLearning] = useState({ title: '', content: '', tags: '' });

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  async function load() {
    const data = await AsyncStorage.getItem(LEARNINGS_KEY);
    if (data) setLearnings(JSON.parse(data));
  }

  async function saveLearning() {
    if (!newLearning.title.trim()) return Alert.alert('Title required');
    const learning: Learning = {
      id: Date.now().toString(),
      title: newLearning.title,
      content: newLearning.content,
      tags: newLearning.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    const updated = [learning, ...learnings];
    setLearnings(updated);
    await AsyncStorage.setItem(LEARNINGS_KEY, JSON.stringify(updated));
    setNewLearning({ title: '', content: '', tags: '' });
    setModalVisible(false);
  }

  async function deleteLearning(id: string) {
    const updated = learnings.filter(l => l.id !== id);
    setLearnings(updated);
    await AsyncStorage.setItem(LEARNINGS_KEY, JSON.stringify(updated));
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {learnings.map(learning => (
          <TouchableOpacity
            key={learning.id}
            style={styles.card}
            onPress={() => setExpanded(expanded === learning.id ? null : learning.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.learningTitle}>{learning.title}</Text>
              <TouchableOpacity onPress={() => deleteLearning(learning.id)}>
                <Text style={styles.delete}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.date}>{new Date(learning.createdAt).toLocaleDateString()}</Text>
            {learning.tags.length > 0 && (
              <View style={styles.tags}>
                {learning.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            {expanded === learning.id && (
              <Text style={styles.content}>{learning.content}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ New Learning</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>New Learning</Text>
              <TextInput style={styles.input} placeholder="Title" value={newLearning.title} onChangeText={t => setNewLearning(p => ({ ...p, title: t }))} />
              <TextInput style={[styles.input, styles.contentInput]} placeholder="What did you learn?" multiline value={newLearning.content} onChangeText={t => setNewLearning(p => ({ ...p, content: t }))} />
              <TextInput style={styles.input} placeholder="Tags (comma separated)" value={newLearning.tags} onChangeText={t => setNewLearning(p => ({ ...p, tags: t }))} />
              <TouchableOpacity style={styles.saveBtn} onPress={saveLearning}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 8, borderRadius: 10, padding: 16, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  learningTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  date: { fontSize: 12, color: '#999', marginTop: 2, marginBottom: 6 },
  delete: { color: '#ff4444', fontSize: 16, paddingLeft: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#EBF3FD', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, color: '#4A90E2' },
  content: { fontSize: 14, color: '#444', marginTop: 12, lineHeight: 20 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#4A90E2', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12 },
  fabText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  contentInput: { minHeight: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancel: { textAlign: 'center', color: '#666', padding: 8 },
});

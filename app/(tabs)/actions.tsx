import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import type { ActionPoint } from '../../src/types';

const ACTIONS_KEY = 'action_points';

export default function ActionsScreen() {
  const [actions, setActions] = useState<ActionPoint[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAction, setNewAction] = useState({ title: '', dueDate: '' });

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  async function load() {
    const data = await AsyncStorage.getItem(ACTIONS_KEY);
    if (data) setActions(JSON.parse(data));
  }

  async function save(updated: ActionPoint[]) {
    setActions(updated);
    await AsyncStorage.setItem(ACTIONS_KEY, JSON.stringify(updated));
  }

  async function addAction() {
    if (!newAction.title.trim()) return Alert.alert('Title required');
    const action: ActionPoint = {
      id: Date.now().toString(),
      title: newAction.title,
      dueDate: newAction.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    await save([...actions, action]);
    setNewAction({ title: '', dueDate: '' });
    setModalVisible(false);
  }

  async function toggleComplete(id: string) {
    await save(actions.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  }

  async function deleteAction(id: string) {
    await save(actions.filter(a => a.id !== id));
  }

  const pending = actions.filter(a => !a.completed);
  const done = actions.filter(a => a.completed);

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.sectionLabel}>Pending ({pending.length})</Text>
        {pending.map(action => (
          <View key={action.id} style={styles.card}>
            <TouchableOpacity style={styles.checkbox} onPress={() => toggleComplete(action.id)}>
              <Text style={styles.checkboxIcon}>○</Text>
            </TouchableOpacity>
            <View style={styles.cardContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              {action.dueDate ? <Text style={styles.dueDate}>Due: {action.dueDate}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => deleteAction(action.id)}>
              <Text style={styles.delete}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {done.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Completed ({done.length})</Text>
            {done.map(action => (
              <View key={action.id} style={[styles.card, styles.cardDone]}>
                <TouchableOpacity style={styles.checkbox} onPress={() => toggleComplete(action.id)}>
                  <Text style={styles.checkboxIconDone}>✓</Text>
                </TouchableOpacity>
                <View style={styles.cardContent}>
                  <Text style={[styles.actionTitle, styles.actionDone]}>{action.title}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteAction(action.id)}>
                  <Text style={styles.delete}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ New Action</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Action Point</Text>
            <TextInput style={styles.input} placeholder="What needs to be done?" value={newAction.title} onChangeText={t => setNewAction(p => ({ ...p, title: t }))} />
            <TextInput style={styles.input} placeholder="Due date (e.g. 2026-10-20)" value={newAction.dueDate} onChangeText={t => setNewAction(p => ({ ...p, dueDate: t }))} />
            <TouchableOpacity style={styles.saveBtn} onPress={addAction}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#4A90E2', margin: 12, marginBottom: 4, textTransform: 'uppercase' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 12, elevation: 1 },
  cardDone: { opacity: 0.6 },
  checkbox: { marginRight: 12 },
  checkboxIcon: { fontSize: 20, color: '#4A90E2' },
  checkboxIconDone: { fontSize: 20, color: '#4A90E2' },
  cardContent: { flex: 1 },
  actionTitle: { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  actionDone: { textDecorationLine: 'line-through', color: '#999' },
  dueDate: { fontSize: 12, color: '#999', marginTop: 2 },
  delete: { color: '#ff4444', fontSize: 16, paddingLeft: 8 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#4A90E2', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12 },
  fabText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  saveBtn: { backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancel: { textAlign: 'center', color: '#666', padding: 8 },
});

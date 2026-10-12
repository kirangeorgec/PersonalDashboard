import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import type { PlannerEntry } from '../../src/types';

const PLANNER_KEY = 'planner';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function PlannerScreen() {
  const [entries, setEntries] = useState<PlannerEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [newTask, setNewTask] = useState('');
  const [notes, setNotes] = useState('');

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  async function load() {
    const data = await AsyncStorage.getItem(PLANNER_KEY);
    if (data) {
      const parsed: PlannerEntry[] = JSON.parse(data);
      setEntries(parsed);
      const today = parsed.find(e => e.date === todayStr());
      if (today) setNotes(today.notes || '');
    }
  }

  function getEntry(): PlannerEntry {
    return entries.find(e => e.date === selectedDate) || {
      id: selectedDate,
      date: selectedDate,
      tasks: [],
      notes: '',
    };
  }

  async function addTask() {
    if (!newTask.trim()) return;
    const entry = getEntry();
    const updated = { ...entry, tasks: [...entry.tasks, newTask.trim()] };
    await saveEntry(updated);
    setNewTask('');
  }

  async function removeTask(index: number) {
    const entry = getEntry();
    const tasks = entry.tasks.filter((_, i) => i !== index);
    await saveEntry({ ...entry, tasks });
  }

  async function saveNotes() {
    const entry = getEntry();
    await saveEntry({ ...entry, notes });
    Alert.alert('Saved');
  }

  async function saveEntry(entry: PlannerEntry) {
    const updated = [...entries.filter(e => e.date !== entry.date), entry];
    setEntries(updated);
    await AsyncStorage.setItem(PLANNER_KEY, JSON.stringify(updated));
  }

  const entry = getEntry();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Daily Planner</Text>
      <Text style={styles.date}>{selectedDate}</Text>

      <Text style={styles.sectionLabel}>Tasks</Text>
      {entry.tasks.map((task, i) => (
        <View key={i} style={styles.taskRow}>
          <Text style={styles.taskText}>{task}</Text>
          <TouchableOpacity onPress={() => removeTask(i)}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.taskInput}
          placeholder="Add a task..."
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Notes</Text>
      <TextInput
        style={styles.notesInput}
        multiline
        placeholder="Notes for the day..."
        value={notes}
        onChangeText={setNotes}
      />
      <TouchableOpacity style={styles.saveBtn} onPress={saveNotes}>
        <Text style={styles.saveBtnText}>Save Notes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  date: { fontSize: 14, color: '#666', marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#4A90E2', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 },
  taskText: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  remove: { color: '#ff4444', fontSize: 16, paddingLeft: 8 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  taskInput: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#ddd' },
  addBtn: { backgroundColor: '#4A90E2', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600' },
  notesInput: { backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 15, minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd' },
  saveBtn: { backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12, marginBottom: 32 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

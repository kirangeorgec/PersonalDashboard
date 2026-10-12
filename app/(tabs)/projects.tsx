import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import type { Project, Contact } from '../../src/types';

const PROJECTS_KEY = 'projects';
const CONTACTS_KEY = 'contacts';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', role: '' });

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  async function load() {
    const p = await AsyncStorage.getItem(PROJECTS_KEY);
    const c = await AsyncStorage.getItem(CONTACTS_KEY);
    if (p) setProjects(JSON.parse(p));
    if (c) setContacts(JSON.parse(c));
  }

  async function saveProject() {
    if (!newProject.name.trim()) return Alert.alert('Name required');
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: 'active',
      contactIds: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...projects, project];
    setProjects(updated);
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
    setNewProject({ name: '', description: '' });
    setModalVisible(false);
  }

  async function saveContact() {
    if (!newContact.name.trim() || !selectedProject) return Alert.alert('Name required');
    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      role: newContact.role,
      projectId: selectedProject.id,
    };
    const updatedContacts = [...contacts, contact];
    const updatedProjects = projects.map(p =>
      p.id === selectedProject.id
        ? { ...p, contactIds: [...p.contactIds, contact.id] }
        : p
    );
    setContacts(updatedContacts);
    setProjects(updatedProjects);
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updatedContacts));
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    setNewContact({ name: '', email: '', phone: '', role: '' });
    setContactModalVisible(false);
  }

  const projectContacts = (project: Project) =>
    contacts.filter(c => project.contactIds.includes(c.id));

  return (
    <View style={styles.container}>
      <ScrollView>
        {projects.map(project => (
          <View key={project.id} style={styles.card}>
            <Text style={styles.projectName}>{project.name}</Text>
            {project.description ? <Text style={styles.desc}>{project.description}</Text> : null}
            <Text style={styles.sectionLabel}>Contacts</Text>
            {projectContacts(project).map(c => (
              <Text key={c.id} style={styles.contact}>
                {c.name}{c.role ? ` — ${c.role}` : ''}{c.email ? `\n${c.email}` : ''}{c.phone ? `  ${c.phone}` : ''}
              </Text>
            ))}
            <TouchableOpacity onPress={() => { setSelectedProject(project); setContactModalVisible(true); }}>
              <Text style={styles.addContact}>+ Add Contact</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ New Project</Text>
      </TouchableOpacity>

      {/* New Project Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Project</Text>
            <TextInput style={styles.input} placeholder="Project name" value={newProject.name} onChangeText={t => setNewProject(p => ({ ...p, name: t }))} />
            <TextInput style={styles.input} placeholder="Description (optional)" value={newProject.description} onChangeText={t => setNewProject(p => ({ ...p, description: t }))} />
            <TouchableOpacity style={styles.saveBtn} onPress={saveProject}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* New Contact Modal */}
      <Modal visible={contactModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Contact to {selectedProject?.name}</Text>
            <TextInput style={styles.input} placeholder="Name" value={newContact.name} onChangeText={t => setNewContact(p => ({ ...p, name: t }))} />
            <TextInput style={styles.input} placeholder="Role" value={newContact.role} onChangeText={t => setNewContact(p => ({ ...p, role: t }))} />
            <TextInput style={styles.input} placeholder="Email" value={newContact.email} onChangeText={t => setNewContact(p => ({ ...p, email: t }))} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Phone" value={newContact.phone} onChangeText={t => setNewContact(p => ({ ...p, phone: t }))} keyboardType="phone-pad" />
            <TouchableOpacity style={styles.saveBtn} onPress={saveContact}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setContactModalVisible(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16, elevation: 2 },
  projectName: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  desc: { fontSize: 14, color: '#666', marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#4A90E2', marginTop: 12, marginBottom: 4, textTransform: 'uppercase' },
  contact: { fontSize: 14, color: '#333', marginBottom: 6, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#4A90E2' },
  addContact: { fontSize: 14, color: '#4A90E2', marginTop: 8 },
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

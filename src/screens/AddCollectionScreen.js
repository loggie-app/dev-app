import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { layout, typography, colors, common } from '../components/common/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddCollectionScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [customFields, setCustomFields] = useState(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const collectionTypes = [
    { id: 'custom', label: 'Custom Collection', description: 'Create your own tracking template' },
    { id: 'expenses', label: 'Expense Tracking', description: 'Track your spending and budgets' },
    { id: 'fitness', label: 'Fitness Journey', description: 'Monitor your workouts and progress' },
    { id: 'habits', label: 'Habit Building', description: 'Build and maintain good habits' },
    { id: 'savings', label: 'Savings Goals', description: 'Track your savings progress' },
  ];

  useEffect(() => {
    if (route.params?.collectionName) {
      setName(route.params.collectionName);
      setType('custom');
    }

    if (route.params?.customFields) {
      setCustomFields(route.params.customFields);
    }
  }, [route.params]);

  const handleSelectType = (selectedType) => {
    setType(selectedType);
    setShowTypeSelector(false);

    if (selectedType === 'custom' && !customFields) {
      navigation.navigate('CustomCollectionFields', { collectionName: name });
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });

      if (result.type === 'cancel') {
        Alert.alert('Canceled', 'No file selected.');
        return;
      }

      const { uri, name } = result;
      const fileContent = await FileSystem.readAsStringAsync(uri);

      const rows = fileContent.split('\n');
      const headers = rows[0]?.split(',') || [];

      const existingCollectionsJSON = await AsyncStorage.getItem('collections');
      const existingCollections = existingCollectionsJSON ? JSON.parse(existingCollectionsJSON) : [];

      const newCollection = {
        id: Date.now().toString(),
        name: name.replace('.csv', ''),
        type: 'custom',
        createdAt: new Date().toISOString(),
        customFields: headers,
      };

      const updatedCollections = [...existingCollections, newCollection];
      await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));

      Alert.alert('Success', 'CSV data imported successfully.');
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error importing CSV:', error);
      Alert.alert('Error', 'Failed to import the CSV file.');
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !type) return;

    setIsCreating(true);
    try {
      const existingCollectionsJSON = await AsyncStorage.getItem('collections');
      const existingCollections = existingCollectionsJSON ? JSON.parse(existingCollectionsJSON) : [];

      const newCollection = {
        id: Date.now().toString(),
        name: name.trim(),
        type,
        createdAt: new Date().toISOString(),
        description: description.trim(),
        customFields: type === 'custom' ? customFields : null,
      };

      const csvPath = `${FileSystem.documentDirectory}${newCollection.name.replace(/\s+/g, '_')}.csv`;
      await FileSystem.writeAsStringAsync(csvPath, 'id,date\nnumber,date\n'); // Create default CSV headers

      const metadataPath = `${FileSystem.documentDirectory}${newCollection.name.replace(/\s+/g, '_')}_metadata.txt`;
      const metadataContent = `Name: ${newCollection.name}\nCreated On: ${newCollection.createdAt}\nType: ${newCollection.type}\nDescription: ${newCollection.description || 'None'}`;
      await FileSystem.writeAsStringAsync(metadataPath, metadataContent);

      newCollection.csvPath = csvPath;
      newCollection.metadataPath = metadataPath;

      const updatedCollections = [...existingCollections, newCollection];
      await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));

      navigation.navigate('HomeScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={layout.safeArea}>
      <ScrollView contentContainerStyle={layout.screen}>
        <View style={[common.row, { justifyContent: 'space-between', marginBottom: 20 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={typography.header}>New Collection</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={common.card}>
          <Text style={typography.body}>Name</Text>
          <TextInput
            style={{
              backgroundColor: '#1C1C1E',
              padding: 16,
              borderRadius: 8,
              color: colors.text.primary,
              marginTop: 8,
              fontSize: 16,
            }}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.text.secondary}
            placeholder="Collection name"
          />

          <Text style={[typography.body, { marginTop: 20 }]}>Description</Text>
          <TextInput
            style={{
              backgroundColor: '#1C1C1E',
              padding: 16,
              borderRadius: 8,
              color: colors.text.primary,
              marginTop: 8,
              fontSize: 16,
            }}
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={colors.text.secondary}
            placeholder="Add a description (optional)"
          />

          <Text style={[typography.body, { marginTop: 20 }]}>Collection Type</Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#1C1C1E',
              padding: 16,
              borderRadius: 8,
              marginTop: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            onPress={() => setShowTypeSelector(true)}
          >
            <Text style={[typography.body, { color: type ? colors.text.primary : colors.text.secondary }]}>
              {type ? collectionTypes.find((t) => t.id === type)?.label : 'Select type'}
            </Text>
            <ChevronRight color={colors.text.secondary} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 20,
            }}
            disabled={!name.trim() || !type || isCreating}
            onPress={handleCreate}
          >
            <Text style={[typography.body, { color: '#FFF', fontWeight: '600' }]}>
              {isCreating ? 'Creating...' : 'Create Collection'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={{ marginTop: 'auto', padding: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={handleImport}
        >
          <Text style={[typography.body, { color: '#FFF', fontWeight: '600' }]}>Import CSV</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTypeSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTypeSelector(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: '70%',
            }}
          >
            <Text style={[typography.subheader, { marginBottom: 20 }]}>Select Collection Type</Text>
            <ScrollView>
              {collectionTypes.map((typeOption) => (
                <TouchableOpacity
                  key={typeOption.id}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 8,
                    backgroundColor: type === typeOption.id ? colors.primary : '#1C1C1E',
                  }}
                  onPress={() => handleSelectType(typeOption.id)}
                >
                  <Text style={typography.body}>{typeOption.label}</Text>
                  <Text style={typography.caption}>{typeOption.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

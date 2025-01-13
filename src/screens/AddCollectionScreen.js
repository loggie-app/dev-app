import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { layout, typography, colors, common } from '../components/common/styles';
import * as collectionService from '../services/collectionService';
import CollectionForm from '../components/collection/CollectionForm';
import TypeSelector from '../components/collection/TypeSelector';
import { DEFAULT_COLLECTION } from '../constants/collectionTypes';

export default function AddCollectionScreen({ navigation, route }) {
  const [formData, setFormData] = useState(DEFAULT_COLLECTION);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (route.params?.collectionName) {
      setFormData(prev => ({
        ...prev,
        name: route.params.collectionName,
        type: 'custom'
      }));
    }

    if (route.params?.customFields) {
      setFormData(prev => ({
        ...prev,
        customFields: route.params.customFields
      }));
    }
  }, [route.params]);

  const handleSelectType = (selectedType) => {
    setFormData(prev => ({ ...prev, type: selectedType }));
    setShowTypeSelector(false);

    if (selectedType === 'custom' && !formData.customFields) {
      navigation.navigate('CustomCollectionFields', { 
        collectionName: formData.name 
      });
    }
  };

  const handleCreate = async () => {
    try {
      collectionService.validateCollection(formData.name, formData.type);
      setIsCreating(true);
      
      await collectionService.saveCollection(formData, true);
      navigation.navigate('HomeScreen');
    } catch (error) {
      Alert.alert('Error', error.message);
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

        <CollectionForm
          name={formData.name}
          description={formData.description}
          type={formData.type}
          isCreating={isCreating}
          onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
          onDescriptionChange={(description) => setFormData(prev => ({ ...prev, description }))}
          onTypePress={() => setShowTypeSelector(true)}
          onSubmit={handleCreate}
        />
      </ScrollView>

      <TypeSelector
        visible={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        selectedType={formData.type}
        onSelectType={handleSelectType}
      />
    </SafeAreaView>
  );
}
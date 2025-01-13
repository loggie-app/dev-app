import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { typography, colors, common } from '../../components/common/styles';
import { TypeSelectorButton } from './TypeSelector';

const CollectionForm = ({
  name,
  description,
  type,
  isCreating,
  onNameChange,
  onDescriptionChange,
  onTypePress,
  onSubmit,
}) => {
  return (
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
        onChangeText={onNameChange}
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
        onChangeText={onDescriptionChange}
        placeholderTextColor={colors.text.secondary}
        placeholder="Add a description (optional)"
      />

      <Text style={[typography.body, { marginTop: 20 }]}>Collection Type</Text>
      <TypeSelectorButton 
        type={type} 
        onPress={onTypePress}
      />

      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 20,
          opacity: (!name.trim() || !type || isCreating) ? 0.5 : 1,
        }}
        disabled={!name.trim() || !type || isCreating}
        onPress={onSubmit}
      >
        <Text style={[typography.body, { color: '#FFF', fontWeight: '600' }]}>
          {isCreating ? 'Creating...' : 'Create Collection'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CollectionForm;
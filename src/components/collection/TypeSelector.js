import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { typography, colors } from '../../components/common/styles';
import { COLLECTION_TYPES } from '../../constants/collectionTypes';

export const TypeSelectorButton = ({ type, onPress }) => (
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
    onPress={onPress}
  >
    <Text style={[typography.body, { color: type ? colors.text.primary : colors.text.secondary }]}>
      {type ? COLLECTION_TYPES.find((t) => t.id === type)?.label : 'Select type'}
    </Text>
    <ChevronRight color={colors.text.secondary} size={20} />
  </TouchableOpacity>
);

const TypeSelector = ({ visible, onClose, selectedType, onSelectType }) => {
  const handleSelect = (type) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
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
            {COLLECTION_TYPES.map((typeOption) => (
              <TouchableOpacity
                key={typeOption.id}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: selectedType === typeOption.id ? colors.primary : '#1C1C1E',
                }}
                onPress={() => handleSelect(typeOption.id)}
              >
                <Text style={typography.body}>{typeOption.label}</Text>
                <Text style={typography.caption}>{typeOption.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TypeSelector;
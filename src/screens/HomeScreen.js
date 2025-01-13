import { ScrollView, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { layout, typography, colors, common } from '../components/common/styles';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import HomeCollectionCard from '../components/collection/HomeCollectionCard';
import * as collectionService from '../services/collectionService';

export default function HomeScreen({ navigation }) {
  const [collections, setCollections] = useState([]);

  const loadCollections = async () => {
    try {
      const updatedCollections = await collectionService.loadCollections();
      setCollections(updatedCollections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCollections);
    loadCollections();
    return unsubscribe;
  }, [navigation]);

  const handleCollectionPress = (collection) => {
    navigation.navigate('CollectionDetail', { collection });
  };

  return (
    <SafeAreaView style={layout.safeArea}>
      <ScrollView contentContainerStyle={layout.screen}>
        {collections.length === 0 ? (
          <View style={[common.card, { alignItems: 'center', padding: 20 }]}>
            <Text style={typography.body}>No collections yet</Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
              }}
              onPress={() => navigation.navigate('AddCollection')}
            >
              <Text style={[typography.body, { color: '#FFF' }]}>Add Your First Collection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          collections.map((collection) => (
            <HomeCollectionCard
              key={collection.id}
              collection={collection}
              onPress={() => handleCollectionPress(collection)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
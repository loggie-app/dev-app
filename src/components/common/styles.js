import { StyleSheet } from 'react-native';

export const colors = {
  background: '#000000',
  primary: '#007AFF',     // iOS blue
  text: {
    primary: '#FFFFFF',
    secondary: '#666666',
  },
  statusBar: {
    background: '#000000'
  },
  tabBar: {
    active: '#007AFF',
    inactive: '#666666',
    background: '#000000'
  }
};

export const typography = {
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary
  },
  subheader: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary
  },
  body: {
    fontSize: 16,
    color: colors.text.primary
  },
  caption: {
    fontSize: 14,
    color: colors.text.secondary
  }
};

export const layout = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    padding: 16,
    backgroundColor: colors.background
  },
  container: {
    flex: 1
  }
});

export const navigation = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar.background,
    borderTopWidth: 0,
    elevation: 0,
    height: 60
  }
});

export const common = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  }
});
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '@/context/AlertContext';

export default function AlertModal() {
  const { alertState, hideAlert } = useAlert();

  const iconMap = {
    success: { name: 'checkmark-circle', color: '#34c759' },
    error: { name: 'close-circle', color: '#D92D20' },
    warning: { name: 'alert-circle', color: '#FF9500' },
    info: { name: 'information-circle', color: '#0066FF' },
  };

  const icon = iconMap[alertState.type];
  const bgColor = {
    success: '#E8F8F0',
    error: '#FDECEC',
    warning: '#FFF7E8',
    info: '#E8F2FF',
  }[alertState.type];

  return (
    <Modal
      visible={alertState.visible}
      transparent={true}
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: bgColor }]}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon.name as any} size={56} color={icon.color} />
          </View>

          <Text style={styles.title}>{alertState.title}</Text>
          <Text style={styles.message}>{alertState.message}</Text>

          <View style={styles.buttonsContainer}>
            {alertState.buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'destructive' && styles.buttonDestructive,
                  button.style === 'cancel' && styles.buttonCancel,
                ]}
                onPress={() => {
                  button.onPress?.();
                  hideAlert();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'destructive' && styles.buttonTextDestructive,
                    button.style === 'cancel' && styles.buttonTextCancel,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0066FF',
    alignItems: 'center',
  },
  buttonDestructive: {
    backgroundColor: '#D92D20',
  },
  buttonCancel: {
    backgroundColor: '#F2F2F2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextDestructive: {
    color: '#fff',
  },
  buttonTextCancel: {
    color: '#222',
  },
});

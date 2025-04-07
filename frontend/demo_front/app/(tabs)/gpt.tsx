import { StyleSheet, TextInput, View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useState, useRef } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface Message {
  content: string;
  isUser: boolean;
}

export default function GPTScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { content: "Hello! I'm your AI assistant. Ask me anything!", isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    // Add user message
    const userMessage: Message = { content: input, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    
    try {
      // Send message to backend
      const response = await fetch('http://127.0.0.1:8000/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }
      
      const data = await response.json();
      
      // Add AI response
      const aiResponse: Message = { 
        content: data.message, 
        isUser: false 
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message if API call fails
      const errorMessage: Message = {
        content: "Sorry, I couldn't process your request. Please try again.",
        isUser: false
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
      // Scroll to bottom after a small delay to ensure new messages are rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.chatContainer}>
        <ThemedText style={styles.header}>What can I help with?</ThemedText>
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <View 
              key={index} 
              style={[
                styles.messageBubble, 
                message.isUser ? styles.userBubble : styles.aiBubble
              ]}
            >
              <ThemedText style={styles.messageText}>{message.content}</ThemedText>
            </View>
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#0a7ea4" size="small" />
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything"
            placeholderTextColor="#888"
            multiline
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!isLoading}
          />
          <Pressable 
            style={[
              styles.sendButton, 
              (input.trim() === '' || isLoading) && styles.disabledButton
            ]} 
            onPress={input.trim() !== '' && !isLoading ? handleSend : undefined}
            disabled={input.trim() === '' || isLoading}
          >
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70, // For the fixed header
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    width: '80%',
    maxWidth: 800,
    height: 500,
    backgroundColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#2a2a2a',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#333',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    padding: 12,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#333',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
}); 
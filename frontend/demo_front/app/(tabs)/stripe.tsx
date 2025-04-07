import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Pressable, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe (use your publishable key)
const stripePromise = loadStripe('pk_test_6...');

// The checkout form component
const CheckoutForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetchPaymentIntent();
  }, []);

  const fetchPaymentIntent = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/create-payment-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 3000 }), // $30.00 in cents
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error fetching payment intent:', error);
      setPaymentStatus('Error: Could not connect to payment service');
    }
  };

  const handlePayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setPaymentStatus('Processing payment...');

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setPaymentStatus(`Error: ${error.message}`);
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('Payment successful!');
        Alert.alert('Success', 'Your payment was processed successfully!');
      } else {
        setPaymentStatus(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('Error: Payment processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <ThemedText style={styles.title}>Complete Your Purchase</ThemedText>
      <ThemedText style={styles.subtitle}>$30.00</ThemedText>
      
      <View style={styles.cardContainer}>
        <CardElement options={{
          style: {
            base: {
              color: '#ffffff',
              fontFamily: 'Arial, sans-serif',
              fontSize: '16px',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a',
            },
          },
        }} />
      </View>
      
      <Pressable
        style={[styles.payButton, (!stripe || !clientSecret || isLoading) && styles.disabledButton]}
        onPress={handlePayment}
        disabled={!stripe || !clientSecret || isLoading}
      >
        <ThemedText style={styles.payButtonText}>
          {isLoading ? 'Processing...' : 'Pay $30.00'}
        </ThemedText>
        {isLoading && <ActivityIndicator color="#ffffff" style={styles.spinner} />}
      </Pressable>
      
      {paymentStatus ? <ThemedText style={styles.status}>{paymentStatus}</ThemedText> : null}
    </View>
  );
};

export default function StripeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.paymentContainer}>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70, // Add padding for the header
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentContainer: {
    width: '80%',
    maxWidth: 800,
    backgroundColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#ccc',
  },
  cardContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    height: 50,
    justifyContent: 'center',
  },
  payButton: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#444',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  spinner: {
    marginLeft: 10,
  },
  status: {
    marginTop: 15,
    textAlign: 'center',
    color: '#fff',
  }
}); 
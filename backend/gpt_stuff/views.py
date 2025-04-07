from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import openai
from dotenv import load_dotenv
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import stripe
import logging
from rest_framework.decorators import api_view

# Load environment variables
load_dotenv()

# Get OpenAI API key from environment variables
openai.api_key = os.getenv('OPENAI_API_KEY')

# Set up Stripe API key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Configure logging
logger = logging.getLogger('stripe')

@csrf_exempt
def chat_endpoint(request):
    """
    Endpoint to handle chat requests to OpenAI API
    """
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request
            data = json.loads(request.body)
            user_message = data.get('message', '')
            
            if not user_message:
                return JsonResponse({'error': 'No message provided'}, status=400)
            
            # Call OpenAI API
            response = openai.chat.completions.create(
                model="gpt-4o-mini",  # You can change this to a different model
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=1000
            )
            
            # Extract the assistant's response
            assistant_message = response.choices[0].message.content
            
            return JsonResponse({
                'message': assistant_message
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

class CreatePaymentIntentView(APIView):
    def post(self, request):
        try:
            # Get amount from request, default to $30.00 if not provided
            amount = request.data.get('amount', 3000)  # Amount in cents
            
            # Create a PaymentIntent with the order amount and currency
            intent = stripe.PaymentIntent.create(
                amount=amount,  # Amount in cents
                currency='usd',
                automatic_payment_methods={
                    'enabled': True,
                }
            )
            
            return Response({
                'clientSecret': intent.client_secret
            })
        except Exception as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    if not sig_header:
        return Response({'error': 'No Stripe signature header'}, status=400)

    try:
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )

        # Handle the event
        if event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            logger.info(f"Payment succeeded: {payment_intent.id}")
            
            # You can add custom logic here to track successful payments
            
        return Response({'status': 'success'})

    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return Response({'error': str(e)}, status=400)

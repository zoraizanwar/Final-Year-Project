import os

import openai
from django.conf import settings
from accounts.api_config_utils import get_active_api_key


def _get_openai_api_key():
    """
    Get OpenAI API key with the following priority:
    1. Database configuration (if active)
    2. Environment variable
    3. Django settings
    """
    # Try to get from database first
    api_key = get_active_api_key('openai')
    
    if api_key:
        return api_key
    
    # Fallback to environment variable or settings
    api_key = os.environ.get('OPENAI_API_KEY', '') or getattr(settings, 'OPENAI_API_KEY', '')
    
    if not api_key:
        raise RuntimeError(
            'OpenAI API key is not configured. '
            'Please add it through the Admin Panel (Settings > API Configuration) '
            'or set OPENAI_API_KEY environment variable.'
        )
    return api_key


def _get_openai_model():
    return os.environ.get('OPENAI_MODEL', getattr(settings, 'OPENAI_MODEL', 'gpt-3.5-turbo'))


def build_chat_messages(user_message, history=None):
    messages = [
        {
            'role': 'system',
            'content': (
                'You are an AI customer support assistant for a business management system. '
                'Provide clear, polite, and concise answers to customer questions while staying on topic.'
            ),
        }
    ]

    if history:
        messages.extend(history)

    messages.append({'role': 'user', 'content': user_message})
    return messages


def generate_chatbot_response(message, history=None):
    api_key = _get_openai_api_key()
    openai.api_key = api_key

    response = openai.ChatCompletion.create(
        model=_get_openai_model(),
        messages=build_chat_messages(message, history),
        temperature=0.4,
        max_tokens=500,
    )

    return response.choices[0].message.content.strip()

import type { ModalFuncProps } from 'antd'

type ApiError = {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

export function mapErrorToModalProps(error: unknown): ModalFuncProps {
  const safeError = error as ApiError
  const rawMessage = safeError?.response?.data?.message || safeError?.message || 'Unexpected error occurred'

  console.log('rawMessage', rawMessage)
  let code = ''
  let message = rawMessage

  // Handle Cognito PreSignUp custom error JSON
  if (rawMessage.startsWith('PreSignUp failed with error')) {
    const json = JSON.parse(rawMessage.replace(/^PreSignUp failed with error\s*/, '').replace(/\.$/, ''))
    code = json.code
    message = json.message
  }

  const mappings: Record<string, ModalFuncProps> = {
    EMAIL_ALREADY_GOOGLE: {
      title: 'Email Linked to Google',
      content: 'This email is already registered via Google. Please sign in with Google.',
    },
    EMAIL_ALREADY_EXISTS: {
      title: 'Email Already Registered',
      content: 'This email is already in use. Try signing in instead.',
    },
    WEAK_PASSWORD: {
      title: 'Weak Password',
      content: 'Please use a stronger password with at least one number, symbol, and uppercase letter.',
    },
    INVALID_INPUT: {
      title: 'Invalid Input',
      content: 'One or more fields have invalid data. Please check your input.',
    },
    NETWORK_ERROR: {
      title: 'Network Issue',
      content: 'Please check your connection and try again.',
    },
  }

  const fallback: ModalFuncProps = {
    title: 'Error',
    content: message,
  }

  return mappings[code || message] || fallback
}

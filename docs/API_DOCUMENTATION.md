# Rebloom API Documentation

## Overview

The Rebloom API provides secure, HIPAA-compliant endpoints for the mental health AI companion app. This RESTful API handles user authentication, chat interactions, mood tracking, crisis detection, and therapeutic features.

**Base URL**: `https://api.rebloom.app/v1`

**Authentication**: Bearer token (JWT)

**Content Type**: `application/json`

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Chat & Conversations](#chat--conversations)
4. [Mood Tracking](#mood-tracking)
5. [Crisis Detection & Safety](#crisis-detection--safety)
6. [Voice Messages](#voice-messages)
7. [Settings & Preferences](#settings--preferences)
8. [Analytics & Insights](#analytics--insights)
9. [Health & Status](#health--status)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [HIPAA Compliance](#hipaa-compliance)

---

## Authentication

All API endpoints require authentication using JWT tokens in the Authorization header.

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "consentGiven": true,
  "termsAccepted": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "uuid",
    "expiresIn": 604800
  }
}
```

### POST /auth/login

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "deviceId": "device-uuid",
  "biometricAuth": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "preferences": {
        "language": "en",
        "timezone": "UTC",
        "notifications": true
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "uuid",
    "expiresIn": 604800
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

### POST /auth/logout

Invalidate current session and refresh token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Management

### GET /users/profile

Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "preferences": {
      "language": "en",
      "timezone": "UTC",
      "notifications": true,
      "voiceEnabled": true,
      "biometricAuth": false
    },
    "therapeuticSettings": {
      "primaryGoals": ["anxiety", "depression"],
      "preferredApproaches": ["CBT", "mindfulness"],
      "crisisContacts": [
        {
          "name": "Emergency Contact",
          "phone": "+1234567890",
          "relationship": "family"
        }
      ]
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-01-15T12:00:00Z"
  }
}
```

### PUT /users/profile

Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "preferences": {
    "language": "en",
    "timezone": "America/New_York",
    "notifications": true
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "preferences": {
      "language": "en",
      "timezone": "America/New_York",
      "notifications": true
    },
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### DELETE /users/account

Permanently delete user account and all associated data.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "SecurePassword123!",
  "confirmDeletion": "DELETE MY ACCOUNT"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account deletion initiated. All data will be permanently deleted within 24 hours."
}
```

---

## Chat & Conversations

### GET /conversations

Retrieve user's conversation history with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `startDate` (optional): Filter conversations from date (ISO 8601)
- `endDate` (optional): Filter conversations to date (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "title": "Morning Check-in",
        "lastMessage": {
          "id": "uuid",
          "content": "How are you feeling today?",
          "role": "assistant",
          "timestamp": "2024-01-15T09:00:00Z"
        },
        "messageCount": 15,
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### POST /conversations

Create a new conversation.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Evening Reflection",
  "initialMessage": "I'm feeling anxious about tomorrow's presentation"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Evening Reflection",
    "messages": [
      {
        "id": "uuid",
        "content": "I'm feeling anxious about tomorrow's presentation",
        "role": "user",
        "timestamp": "2024-01-15T20:00:00Z"
      },
      {
        "id": "uuid",
        "content": "I understand you're feeling anxious about your presentation. That's a very normal response to an important event. Let's explore what specifically is making you feel anxious about it.",
        "role": "assistant",
        "timestamp": "2024-01-15T20:00:05Z",
        "metadata": {
          "technique": "CBT",
          "emotionalState": "anxious",
          "confidenceScore": 0.92
        }
      }
    ],
    "createdAt": "2024-01-15T20:00:00Z"
  }
}
```

### GET /conversations/{conversationId}

Get specific conversation with all messages.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Morning Check-in",
    "messages": [
      {
        "id": "uuid",
        "content": "Good morning! How are you feeling today?",
        "role": "assistant",
        "timestamp": "2024-01-15T09:00:00Z",
        "metadata": {
          "technique": "general",
          "confidenceScore": 0.95
        }
      },
      {
        "id": "uuid",
        "content": "I'm feeling a bit overwhelmed with work lately",
        "role": "user",
        "timestamp": "2024-01-15T09:01:00Z",
        "sentiment": {
          "score": -0.3,
          "label": "negative",
          "emotions": ["stress", "overwhelm"]
        }
      }
    ],
    "summary": {
      "overallSentiment": "mixed",
      "keyTopics": ["work stress", "overwhelm"],
      "suggestedActions": ["stress management", "time management"]
    },
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### POST /conversations/{conversationId}/messages

Send a new message in a conversation.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "I tried the breathing exercise you suggested, and it helped a little",
  "type": "text",
  "metadata": {
    "moodBefore": 3,
    "moodAfter": 5
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "uuid",
      "content": "I tried the breathing exercise you suggested, and it helped a little",
      "role": "user",
      "timestamp": "2024-01-15T20:05:00Z",
      "sentiment": {
        "score": 0.2,
        "label": "slightly_positive",
        "emotions": ["relief", "hope"]
      }
    },
    "assistantMessage": {
      "id": "uuid",
      "content": "That's wonderful to hear! It's great that you tried the breathing exercise and found some relief. Even small improvements are significant steps forward. What did you notice during the exercise that helped you feel better?",
      "role": "assistant",
      "timestamp": "2024-01-15T20:05:03Z",
      "metadata": {
        "technique": "validation_and_inquiry",
        "emotionalState": "improving",
        "confidenceScore": 0.89,
        "suggestedFollowUp": "explore_positive_experience"
      }
    },
    "crisisAssessment": {
      "riskLevel": "low",
      "flagged": false
    }
  }
}
```

---

## Mood Tracking

### POST /mood/entries

Record a new mood entry.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "mood": 6,
  "energy": 4,
  "anxiety": 3,
  "emotions": ["hopeful", "tired", "grateful"],
  "triggers": ["work presentation", "lack of sleep"],
  "notes": "Feeling better after talking to my friend",
  "activities": ["exercise", "meditation"],
  "timestamp": "2024-01-15T18:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "mood": 6,
    "energy": 4,
    "anxiety": 3,
    "emotions": ["hopeful", "tired", "grateful"],
    "triggers": ["work presentation", "lack of sleep"],
    "notes": "Feeling better after talking to my friend",
    "activities": ["exercise", "meditation"],
    "timestamp": "2024-01-15T18:00:00Z",
    "insights": {
      "comparedToAverage": "+0.5",
      "trend": "improving",
      "suggestions": ["Continue regular exercise", "Maintain sleep schedule"]
    }
  }
}
```

### GET /mood/entries

Retrieve mood entries with filtering and pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `limit` (optional): Number of entries (default: 30, max: 100)
- `page` (optional): Page number for pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid",
        "mood": 6,
        "energy": 4,
        "anxiety": 3,
        "emotions": ["hopeful", "tired", "grateful"],
        "timestamp": "2024-01-15T18:00:00Z"
      }
    ],
    "statistics": {
      "averageMood": 5.8,
      "averageEnergy": 4.2,
      "averageAnxiety": 4.1,
      "mostCommonEmotions": ["grateful", "tired", "hopeful"],
      "trend": "stable"
    },
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 150,
      "pages": 5
    }
  }
}
```

### GET /mood/analytics

Get detailed mood analytics and insights.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (optional): `week`, `month`, `quarter`, `year` (default: month)
- `includePatterns` (optional): Include pattern analysis (default: true)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "summary": {
      "totalEntries": 28,
      "averageMood": 5.8,
      "moodRange": { "min": 2, "max": 9 },
      "improvementScore": 0.3
    },
    "trends": {
      "mood": "improving",
      "energy": "stable",
      "anxiety": "decreasing"
    },
    "patterns": {
      "bestDays": ["Friday", "Saturday"],
      "challengingTimes": ["Monday morning", "Sunday evening"],
      "correlations": {
        "exercise": 0.7,
        "sleep": 0.6,
        "social_interaction": 0.5
      }
    },
    "recommendations": [
      "Continue regular exercise routine - strong positive correlation with mood",
      "Consider scheduling relaxing activities on Sunday evenings",
      "Maintain consistent sleep schedule"
    ]
  }
}
```

---

## Crisis Detection & Safety

### GET /safety/resources

Get crisis resources and emergency contacts.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `location` (optional): User location for local resources
- `language` (optional): Language preference (default: user's setting)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "emergencyContacts": {
      "crisis": {
        "us": {
          "name": "988 Suicide & Crisis Lifeline",
          "phone": "988",
          "text": "Text HOME to 741741",
          "available": "24/7"
        },
        "international": {
          "name": "International Association for Suicide Prevention",
          "website": "https://www.iasp.info/resources/Crisis_Centres/"
        }
      },
      "emergency": {
        "us": "911",
        "general": "Contact your local emergency services"
      }
    },
    "personalContacts": [
      {
        "id": "uuid",
        "name": "Sarah (Sister)",
        "phone": "+1234567890",
        "relationship": "family",
        "priority": 1
      }
    ],
    "resources": [
      {
        "name": "Mental Health America",
        "type": "organization",
        "website": "https://www.mhanational.org/",
        "description": "Mental health resources and support"
      }
    ]
  }
}
```

### POST /safety/alert

Trigger a safety alert or request immediate help.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "crisis",
  "severity": "high",
  "message": "I'm having thoughts of self-harm",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "contactPreferences": ["emergency_contact", "crisis_line"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "alertId": "uuid",
    "status": "active",
    "resources": {
      "immediate": {
        "crisisLine": "988",
        "textLine": "Text HOME to 741741",
        "emergency": "911"
      }
    },
    "actions": [
      "Crisis team notified",
      "Emergency contact alerted",
      "Safety plan activated"
    ],
    "followUp": {
      "scheduledCheck": "2024-01-15T21:00:00Z",
      "counselorAssigned": true
    }
  }
}
```

### POST /safety/plan

Create or update personal safety plan.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "warningSigns": [
    "Feeling overwhelmed",
    "Isolating from friends",
    "Trouble sleeping"
  ],
  "copingStrategies": [
    "Deep breathing exercises",
    "Call a friend",
    "Go for a walk"
  ],
  "safeEnvironment": {
    "removeHarmfulItems": true,
    "safeSpaces": ["Living room", "Local library"]
  },
  "supportContacts": [
    {
      "name": "Best friend",
      "phone": "+1234567890",
      "availability": "24/7"
    }
  ],
  "professionalContacts": [
    {
      "name": "Dr. Smith",
      "phone": "+1234567891",
      "type": "therapist"
    }
  ],
  "reasonsToLive": [
    "My family needs me",
    "I want to see my goals achieved",
    "There are experiences I haven't had yet"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "version": 2,
    "lastUpdated": "2024-01-15T20:00:00Z",
    "status": "active",
    "accessibility": {
      "quickAccess": true,
      "offlineAvailable": true,
      "voiceActivated": true
    }
  }
}
```

---

## Voice Messages

### POST /voice/upload

Upload voice message for processing.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `audio`: Audio file (WAV, MP3, or WebM)
- `conversationId`: Associated conversation ID
- `duration`: Audio duration in seconds

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "processing",
    "transcription": {
      "text": "I've been feeling really anxious lately about work",
      "confidence": 0.95,
      "language": "en"
    },
    "analysis": {
      "sentiment": {
        "score": -0.4,
        "label": "negative",
        "emotions": ["anxiety", "stress"]
      },
      "voiceMetrics": {
        "tone": "concerned",
        "pace": "fast",
        "volume": "normal"
      }
    },
    "aiResponse": {
      "text": "I can hear the anxiety in your voice, and I want you to know that what you're feeling is valid. Work-related anxiety is very common. Can you tell me what specific aspects of work are making you feel this way?",
      "audioUrl": "https://api.rebloom.app/v1/voice/synthesize/uuid",
      "technique": "validation_and_exploration"
    }
  }
}
```

### GET /voice/synthesize/{messageId}

Get synthesized voice response.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
- Content-Type: `audio/mpeg`
- Binary audio data

### GET /voice/history

Get voice message history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of messages (default: 20)
- `conversationId` (optional): Filter by conversation

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "conversationId": "uuid",
        "transcription": "I've been feeling really anxious lately",
        "duration": 15.3,
        "sentiment": "negative",
        "timestamp": "2024-01-15T18:30:00Z"
      }
    ],
    "statistics": {
      "totalMessages": 45,
      "averageDuration": 22.1,
      "commonEmotions": ["anxiety", "hope", "gratitude"]
    }
  }
}
```

---

## Settings & Preferences

### GET /settings/therapeutic

Get therapeutic settings and preferences.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "goals": {
      "primary": ["anxiety_management", "depression_support"],
      "secondary": ["sleep_improvement", "stress_reduction"]
    },
    "approaches": {
      "preferred": ["CBT", "mindfulness", "DBT"],
      "avoided": ["exposure_therapy"]
    },
    "communication": {
      "style": "supportive",
      "formality": "casual",
      "responseLength": "medium",
      "useHumor": false
    },
    "triggers": {
      "avoidTopics": ["specific_trauma_topic"],
      "sensitiveTimes": ["anniversary_dates"]
    },
    "privacy": {
      "dataSharing": false,
      "anonymousAnalytics": true,
      "research": false
    }
  }
}
```

### PUT /settings/therapeutic

Update therapeutic settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "goals": {
    "primary": ["anxiety_management", "relationship_improvement"]
  },
  "approaches": {
    "preferred": ["CBT", "mindfulness", "ACT"]
  },
  "communication": {
    "style": "gentle",
    "responseLength": "detailed"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "updated": true,
    "timestamp": "2024-01-15T20:00:00Z",
    "changes": [
      "Primary goals updated",
      "Added ACT to preferred approaches",
      "Changed communication style to gentle"
    ]
  }
}
```

### GET /settings/privacy

Get privacy and data handling settings.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dataRetention": {
      "conversations": "indefinite",
      "voiceMessages": "1_year",
      "moodData": "indefinite",
      "analytics": "anonymized"
    },
    "sharing": {
      "anonymousResearch": false,
      "productImprovement": true,
      "marketingCommunications": false
    },
    "security": {
      "twoFactorAuth": true,
      "biometricAuth": true,
      "sessionTimeout": 30
    },
    "compliance": {
      "hipaa": true,
      "gdpr": true,
      "lastUpdated": "2024-01-15T20:00:00Z"
    }
  }
}
```

---

## Analytics & Insights

### GET /insights/weekly

Get weekly insights and progress summary.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `week` (optional): Specific week (YYYY-WW format, default: current week)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "week": "2024-W03",
    "period": {
      "start": "2024-01-15T00:00:00Z",
      "end": "2024-01-21T23:59:59Z"
    },
    "engagement": {
      "conversationCount": 8,
      "messageCount": 127,
      "voiceMessageCount": 12,
      "moodEntries": 6,
      "dailyStreakCount": 5
    },
    "progress": {
      "moodImprovement": 0.8,
      "anxietyReduction": 0.6,
      "goalProgress": {
        "anxiety_management": 0.7,
        "sleep_improvement": 0.4
      }
    },
    "insights": [
      {
        "type": "positive_trend",
        "title": "Mood Stability Improving",
        "description": "Your mood has been more stable this week, with fewer extreme lows.",
        "confidence": 0.85
      },
      {
        "type": "pattern_detected",
        "title": "Exercise Correlation",
        "description": "Days when you exercise show 40% better mood scores.",
        "confidence": 0.92,
        "actionable": true,
        "suggestion": "Try to maintain regular exercise routine"
      }
    ],
    "achievements": [
      {
        "id": "consistent_logging",
        "title": "Consistent Logger",
        "description": "Logged mood for 5 consecutive days",
        "earnedAt": "2024-01-19T18:00:00Z"
      }
    ]
  }
}
```

### GET /insights/goals

Get goal progress and recommendations.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "anxiety_management",
        "title": "Anxiety Management",
        "description": "Learn and practice techniques to manage anxiety",
        "progress": 0.68,
        "milestones": [
          {
            "title": "Learn breathing techniques",
            "completed": true,
            "completedAt": "2024-01-10T15:00:00Z"
          },
          {
            "title": "Practice daily mindfulness",
            "completed": false,
            "progress": 0.4
          }
        ],
        "recommendations": [
          "Continue using breathing exercises when feeling anxious",
          "Try the 5-4-3-2-1 grounding technique during high anxiety"
        ]
      }
    ],
    "overallProgress": 0.55,
    "insights": {
      "topPerformingGoal": "anxiety_management",
      "needsAttention": ["sleep_improvement"],
      "suggestedNewGoals": ["relationship_communication"]
    }
  }
}
```

---

## Health & Status

### GET /health

System health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T20:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai_service": "healthy",
    "voice_service": "healthy"
  },
  "uptime": 86400
}
```

### GET /status

Detailed system status and metrics.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "system": {
      "version": "1.0.0",
      "environment": "production",
      "uptime": 86400,
      "lastDeployment": "2024-01-14T10:00:00Z"
    },
    "metrics": {
      "activeUsers": 1250,
      "totalUsers": 15000,
      "conversationsToday": 3200,
      "averageResponseTime": 180,
      "systemLoad": 0.65
    },
    "services": {
      "api": {
        "status": "healthy",
        "responseTime": 95,
        "errorRate": 0.02
      },
      "database": {
        "status": "healthy",
        "connections": 45,
        "queryTime": 12
      }
    }
  }
}
```

---

## Error Handling

The API uses standard HTTP status codes and returns error information in JSON format.

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2024-01-15T20:00:00Z",
    "requestId": "req-uuid"
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Access denied |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 502 | `SERVICE_UNAVAILABLE` | External service error |
| 503 | `MAINTENANCE` | Service under maintenance |

### Crisis-Specific Errors

| Error Code | Description | Action Required |
|------------|-------------|----------------|
| `CRISIS_DETECTED` | Crisis indicators found in message | Immediate safety resources provided |
| `SAFETY_PROTOCOL_ACTIVATED` | High-risk situation detected | Emergency protocols initiated |
| `PROFESSIONAL_REFERRAL_REQUIRED` | Situation beyond AI capability | Human intervention recommended |

---

## Rate Limiting

API endpoints are rate limited to ensure fair usage and system stability.

### Limits by Endpoint Category

| Category | Requests per Minute | Burst Limit |
|----------|-------------------|-------------|
| Authentication | 5 | 10 |
| Conversations | 30 | 60 |
| Mood Tracking | 10 | 20 |
| Voice Messages | 5 | 10 |
| Settings | 10 | 20 |
| Analytics | 15 | 30 |
| Crisis/Safety | No limit | - |

### Rate Limit Headers

Responses include rate limiting information:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1642284000
X-RateLimit-Retry-After: 60
```

---

## HIPAA Compliance

The Rebloom API is designed to be HIPAA compliant:

### Security Measures

- **Encryption**: All data encrypted at rest and in transit (AES-256)
- **Authentication**: Multi-factor authentication support
- **Access Control**: Role-based access with audit logging
- **Data Minimization**: Only necessary data is collected and stored
- **Audit Logging**: Comprehensive logging of all data access

### Data Handling

- **PHI Identification**: All mental health data treated as PHI
- **Data Retention**: Configurable retention policies
- **Data Portability**: Users can export their data
- **Right to Deletion**: Users can request data deletion

### Business Associate Agreements

Organizations using the API for healthcare purposes must have a signed Business Associate Agreement (BAA) with Rebloom.

### Compliance Endpoints

```
GET /compliance/audit-log    # Access audit logs (admin only)
GET /compliance/data-export  # Export user data
POST /compliance/data-delete # Request data deletion
GET /compliance/baa-status   # Check BAA status
```

---

## Support & Resources

### API Support
- **Documentation**: [https://docs.rebloom.app](https://docs.rebloom.app)
- **Status Page**: [https://status.rebloom.app](https://status.rebloom.app)
- **Developer Support**: [api-support@rebloom.app](mailto:api-support@rebloom.app)

### Mental Health Resources
- **Crisis Line**: 988 (US)
- **Crisis Text**: Text HOME to 741741
- **International**: [findahelpline.com](https://findahelpline.com)

### Legal & Compliance
- **Privacy Policy**: [https://rebloom.app/privacy](https://rebloom.app/privacy)
- **Terms of Service**: [https://rebloom.app/terms](https://rebloom.app/terms)
- **HIPAA Information**: [https://rebloom.app/hipaa](https://rebloom.app/hipaa)

---

*This documentation is for Rebloom API v1.0.0. Last updated: January 2024*
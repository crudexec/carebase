# Voice-to-Text Visit Notes Feature Plan

## Overview

Enable caregivers to submit visit notes by speaking into their phone's microphone, with automatic transcription via OpenAI Whisper and AI-powered clinical note formatting via GPT-4o.

## User Choices

- **Platform**: Both web and mobile
- **Transcription Service**: OpenAI Whisper
- **AI Formatting**: OpenAI GPT-4o
- **Audio Storage**: Yes - keep recordings for reference

---

## Implementation Steps

### 1. OpenAI SDK Integration

**File**: `src/lib/openai.ts` (new file)

Create OpenAI client configuration:

```typescript
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

**Dependencies**: Add `openai` package to package.json

---

### 2. Database Schema Changes

**File**: `prisma/schema.prisma`

Extend the `FileSourceType` enum:

```prisma
enum FileSourceType {
  UPLOAD
  CAMERA
  VOICE_RECORDING  // Add this
}
```

Add transcription fields to File model:

```prisma
model File {
  // existing fields...
  transcription     String?   // Raw transcription from Whisper
  transcribedAt     DateTime? // When transcription completed
}
```

Run migration after schema changes.

---

### 3. Voice Transcription API Endpoint

**File**: `src/app/api/voice-transcription/upload/route.ts` (new file)

POST endpoint that:

1. Receives audio file (webm/mp4 format from MediaRecorder)
2. Uploads audio to storage (S3/similar)
3. Creates File record with `sourceType: VOICE_RECORDING`
4. Sends audio to OpenAI Whisper for transcription
5. Updates File record with transcription
6. Returns transcription text and file ID

```typescript
// Key implementation:
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-1",
  language: "en",
});
```

---

### 4. AI Note Enhancement API Endpoint

**File**: `src/app/api/voice-transcription/enhance/route.ts` (new file)

POST endpoint that:

1. Receives raw transcription text and field context (field name, description)
2. Uses GPT-4o to format into professional clinical note
3. Returns enhanced text

System prompt will instruct GPT-4o to:

- Format as professional clinical documentation
- Maintain factual accuracy (no adding information)
- Use appropriate medical terminology
- Structure content clearly
- Keep appropriate length for the field type

---

### 5. Voice Recording React Hook

**File**: `src/hooks/use-voice-recorder.ts` (new file)

Custom hook using MediaRecorder API:

```typescript
export function useVoiceRecorder() {
  // States: isRecording, isProcessing, error
  // Methods: startRecording, stopRecording, cancelRecording
  // Returns: { isRecording, isProcessing, audioBlob, transcription, error, ... }
}
```

Features:

- Request microphone permission
- Record audio using MediaRecorder
- Convert to appropriate format (webm with opus codec)
- Handle browser compatibility
- Provide recording duration feedback
- Auto-stop after configurable max duration (e.g., 5 minutes)

---

### 6. Voice Input Button Component

**File**: `src/components/visit-notes/voice-input-button.tsx` (new file)

UI component that:

- Shows microphone icon button
- Displays recording state (pulsing indicator, duration)
- Shows processing state (transcribing, enhancing)
- Provides cancel option during recording
- Calls the voice recording hook
- Uploads to transcription API when recording stops
- Optionally calls enhance API
- Returns final text to parent component

Props:

```typescript
interface VoiceInputButtonProps {
  onTranscriptionComplete: (text: string, fileId: string) => void;
  fieldName?: string; // For AI context
  fieldDescription?: string; // For AI context
  enableEnhancement?: boolean; // Whether to use GPT-4o formatting
}
```

---

### 7. Integrate into Visit Note Form

**File**: `src/components/visit-notes/field-renderer.tsx`

Modify the field renderer to add voice input button alongside TEXT_LONG fields:

```typescript
// For TEXT_LONG fields, add voice input option
{field.type === "TEXT_LONG" && (
  <VoiceInputButton
    onTranscriptionComplete={(text, fileId) => {
      // Append or replace field value
      onChange(fieldId, currentValue ? `${currentValue}\n\n${text}` : text);
      // Optionally track the audio file ID for the field
    }}
    fieldName={field.label}
    fieldDescription={field.description}
    enableEnhancement={true}
  />
)}
```

---

### 8. Environment Variables

Add to `.env`:

```
OPENAI_API_KEY=sk-...
```

---

## File Summary

| File                                                | Action | Purpose                                        |
| --------------------------------------------------- | ------ | ---------------------------------------------- |
| `package.json`                                      | Modify | Add `openai` dependency                        |
| `prisma/schema.prisma`                              | Modify | Add VOICE_RECORDING enum, transcription fields |
| `src/lib/openai.ts`                                 | Create | OpenAI client configuration                    |
| `src/app/api/voice-transcription/upload/route.ts`   | Create | Audio upload & Whisper transcription           |
| `src/app/api/voice-transcription/enhance/route.ts`  | Create | GPT-4o note enhancement                        |
| `src/hooks/use-voice-recorder.ts`                   | Create | MediaRecorder hook                             |
| `src/components/visit-notes/voice-input-button.tsx` | Create | Voice recording UI component                   |
| `src/components/visit-notes/field-renderer.tsx`     | Modify | Add voice input to text fields                 |

---

## User Experience Flow

1. Caregiver opens visit note form on mobile/web
2. Sees microphone icon next to each text field
3. Taps microphone, grants permission if needed
4. Speaks their note naturally
5. Taps stop (or auto-stops after max duration)
6. System shows "Transcribing..." then "Enhancing..."
7. Formatted clinical text appears in the field
8. Caregiver can edit if needed, then submit
9. Audio recording is saved and linked to the visit note

---

## Technical Considerations

- **Audio Format**: Use webm with opus codec (best browser support)
- **File Size**: Limit recording to 5 minutes (~5MB) to keep API costs reasonable
- **Error Handling**: Graceful fallback if transcription fails
- **Permissions**: Handle microphone permission denial gracefully
- **Mobile**: MediaRecorder API works on iOS Safari 14.3+ and Android Chrome
- **Cost**: Whisper is $0.006/minute, GPT-4o is ~$0.01 per note enhancement

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

const DEFAULT_VOICE_ID = 'ZT9u07TYPVl83ejeLakq'; // Ricardo (your custom / Spanish voice)
const FALLBACK_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
const MODEL_ID = 'eleven_multilingual_v2'; // Supports Spanish + English

export const getElevenLabsKey = () => {
    return import.meta.env.VITE_ELEVENLABS_API_KEY || '';
};

export async function generateSpeech(text: string): Promise<ArrayBuffer> {
    const apiKey = getElevenLabsKey();
    console.log(
        '🎤 [ElevenLabs] Attempting TTS for text:',
        text.substring(0, 50) + '...'
    );
    console.log('🔑 [ElevenLabs] API Key present:', !!apiKey);

    if (!apiKey) {
        console.error('❌ [ElevenLabs] MISSING API KEY');
        throw new Error('MISSING_KEY');
    }

    const fetchVoice = async (voiceId: string) => {
        const url = `${ELEVENLABS_API_URL}/${voiceId}`;
        console.log(`📡 [ElevenLabs] Requesting: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: MODEL_ID,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        console.log(
            `📥 [ElevenLabs] Response status: ${response.status} ${response.statusText}`
        );

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorData: any = {};

            if (contentType?.includes('application/json')) {
                errorData = await response.json().catch(() => ({}));
            } else {
                const textError = await response.text();
                console.error('❌ [ElevenLabs] Non-JSON error response:', textError);
            }

            console.error('❌ [ElevenLabs] Error details:', errorData);

            if (response.status === 401) throw new Error('INVALID_KEY');
            if (
                response.status === 429 ||
                errorData.detail?.status === 'quota_exceeded'
            )
                throw new Error('QUOTA_EXCEEDED');
            if (response.status === 404)
                throw new Error(`VOICE_NOT_FOUND: ${voiceId}`);

            throw new Error(
                errorData.detail?.message ||
                `API Error ${response.status}: ${response.statusText}`
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log(
            `✅ [ElevenLabs] Received audio: ${arrayBuffer.byteLength} bytes`
        );
        return arrayBuffer;
    };

    try {
        console.log(`🎯 [ElevenLabs] Trying primary voice: ${DEFAULT_VOICE_ID}`);
        return await fetchVoice(DEFAULT_VOICE_ID);
    } catch (error: any) {
        console.warn(
            `⚠️ [ElevenLabs] Primary voice (${DEFAULT_VOICE_ID}) failed:`,
            error.message
        );

        if (
            ['INVALID_KEY', 'QUOTA_EXCEEDED', 'MISSING_KEY'].includes(error.message)
        ) {
            console.error('🚫 [ElevenLabs] Critical error, not attempting fallback');
            throw error;
        }

        console.warn(
            `🔄 [ElevenLabs] Attempting fallback voice: ${FALLBACK_VOICE_ID}`
        );

        try {
            const audio = await fetchVoice(FALLBACK_VOICE_ID);
            console.info('✅ [ElevenLabs] Successfully used fallback voice (Rachel).');
            return audio;
        } catch (fallbackError: any) {
            console.error(
                '❌ [ElevenLabs] Both primary and fallback voices failed.',
                fallbackError
            );
            throw fallbackError;
        }
    }
}
/*API Keys removed for confidentiality*/

function buildSystemPrompt(tone)
{
    switch(tone)
    {
        case 'roast':
            return  `You are an AI narrator. Read the user’s memory and craft a monologue not more than 100 words in a roastful, witty tone.
                 Focus strictly on the content of the memory provided. Do not introduce unrelated topics.
                 Make the narration vivid, engaging, and sound like it’s being spoken aloud.`;

        case 'passive-aggressive':
            return `You are an AI narrator. Read the user’s memory and craft a monologue not more than 100 words in a passive-aggressive tone.
                    Stay strictly on the content of the memory. Avoid unrelated tangents.
                    Use subtle sarcasm and dry humor, and make it sound natural and spoken aloud.`;

        case 'life-coach':
            default:
                return `You are an AI narrator. Read the user’s memory and craft a monologue not more than 100 words in a supportive, life-coach tone.
                        Focus only on the memory content. Do not stray from the topic.
                        Make the narration encouraging, vivid, and sound like an inspiring speech.`; 
    }
}
//Call OpenRouter API to get a narrated AI response

/**
 * Sends the user's memory content to OpenRouter GPT API
 * to get a narrated, engaging, approx. 3-minute AI narration.
 * 
 * @param {string} memoryText - The user’s memory or transcript
 * @param {string} tone - Desired tone: 'roast', 'life-coach', 'passive-aggressive'
 * @returns {Promise<string>} - AI-generated narration
 */

async function getAINarration(memoryText, tone) 
{
    if (!OPENROUTER_API_KEY)
    {
        console.error('❌ OpenRouter API key is missing!');
        return 'Narration failed: missing API key.';
    }

    const allowedTones = ['roast', 'passive-aggressive', 'life-coach'];
    if(!allowedTones.includes(tone))
    {
        throw new Error(`Invalid tone: "${tone}". Use one of: ${allowedTones.join(', ')}`);
    }

    const systemPrompt = buildSystemPrompt(tone);

    const userPrompt = `Narrate the following memory:\n\n"${memoryText}"`;

    const body = {
        model: OPENROUTER_MODEL,
        messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: userPrompt}
        ],
    };

    try
    {
        const response = await fetch(OPENROUTER_ENDPOINT, {
            method: 'POST',
            headers: 
            {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!response.ok)
        {
            throw new Error(result?.error?.message || 'Failed to get narration.');
        }

        const narration = result.choices?.[0]?.message?.content;
        return narration || 'No narration returned.';
    } catch(error){
        console.error('AI Narration Error:', error);
        return 'An error occurred while generating the narration.';
    }
}

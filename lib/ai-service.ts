export async function enhanceTaskWithAI(title: string, description?: string) {
  try {
    console.log('🤖 Calling OpenAI for:', title);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that enhances todo items. Provide a clear, actionable description (50-100 words) and 3-5 specific steps. Respond in JSON format with keys: enhancedDescription (string) and steps (array of {step: number, description: string}).'
          },
          {
            role: 'user',
            content: `Enhance this task: "${title}"${description ? `. Additional context: ${description}` : ''}. Make it actionable and specific.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);
    
    console.log('✅ OpenAI enhancement successful');
    
    return {
      enhancedDescription: result.enhancedDescription,
      steps: result.steps
    };
  } catch (error) {
    console.error('❌ OpenAI error:', error);
    // Fallback to basic enhancement
    return {
      enhancedDescription: `${title}. ${description || ''} This task needs to be completed with attention to detail.`,
      steps: [
        { step: 1, description: `Plan and prepare for ${title}` },
        { step: 2, description: `Execute the main task` },
        { step: 3, description: `Review and confirm completion` }
      ]
    };
  }
}
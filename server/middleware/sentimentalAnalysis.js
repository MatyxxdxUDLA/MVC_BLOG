import sentiment from 'sentiment-spanish';

export const analyzeSentiment = (req, res, next) => {
  try {
    const { content } = req.body;
    
    // Analyze sentiment in Spanish
    const analysis = sentiment(content);
    
    // Add sentiment analysis results to the request
    req.sentiment = {
      score: analysis.score,
      comparative: analysis.comparative,
      tokens: analysis.tokens,
      words: analysis.words,
      positive: analysis.positive,
      negative: analysis.negative
    };

    next();
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    // Continue with the request even if sentiment analysis fails
    next();
  }
};
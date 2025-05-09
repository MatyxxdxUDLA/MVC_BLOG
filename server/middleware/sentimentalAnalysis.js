import sentiment from 'sentiment-spanish';

export const analyzeSentiment = (req, res, next) => {
  try {
    const { content } = req.body;
    
    const analysis = sentiment(content);
    
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
    next();
  }
};
import OpenAI from 'openai';
import scandata from './ex3.json';

const openai = new OpenAI();

const system = `\
Clean up this OCR newspaper article from the year 1900 for common errors such as missing, added, or wrong characters, formatting issues, and line breaks in the middle of words and sentences. \
Look out for inconsistencies in punctuation, capitalization, and spacing. \
As you correct the errors, strive to preserve the original language and meaning of the article while at the same time making it coherent. \
If the article begins or ends in the middle of a sentence, add a couple words to fix it.

Output a JSON object with a property "headline" with the cleaned headline and a property "article" with the cleaned article.\
`;

async function process() {
  const legibility = {};
  for (const bbox of scandata.bboxes) {
    legibility[bbox.id] = bbox.legibility === 'Legible';
  }

  function isLegible(ids) {
    let legible = true;
    for (const id of ids) {
      legible = legible && legibility[id];
    }
    return legible;
  }
  const articles = {};
  for (const fullArticle of scandata['full articles']) {
    articles[fullArticle.full_article_id] = {
      headline: fullArticle.headline,
      article: fullArticle.article,
      legible: isLegible(fullArticle.object_ids),
    };
  }
  const toClean = Object.values(articles).filter(a => a.legible && a.headline.length > 0);
  console.log(toClean[8]);
  const cleaned = await cleanArticle(toClean[8]);
  console.log(cleaned);
}

async function cleanArticle(article) {
  const formatted = `Headline: ${article.headline}

Article: ${article.article}`;
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: formatted },
    ],
    model: 'gpt-3.5-turbo-1106',
    response_format: {
      type: 'json_object',
    },
  });
  return JSON.parse(chatCompletion.choices[0].message.content);
}

await process();

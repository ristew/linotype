import scandata from './ex3.json';


async function process() {
  const legibility = {};
  for (const bbox of scandata.bboxes) {
    legibility[bbox.id] = bbox.legibility;
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
    articles[fullArticle.id] = {
      headline: fullArticle.headline,
      article: fullArticle.article,
      legible: isLegible(fullArticle.object_ids),
    };
  }
}

await process();

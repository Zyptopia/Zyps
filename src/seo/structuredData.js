// src/seo/structuredData.js

export const siteOrg = ({ name = 'Zyptopia', url = 'https://www.zyptopia.org', logo } = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name, url,
  ...(logo ? { logo } : {})
});

export const webSite = ({ url = 'https://www.zyptopia.org' } = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${url}/historical?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
});

export const breadCrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: it.item
  }))
});

export const faqPage = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a }
  }))
});

export const howTo = ({ name, steps }) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name,
  step: steps.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text
  }))
});

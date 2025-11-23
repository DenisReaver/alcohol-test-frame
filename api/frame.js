// api/frame.js
const questions = [
  "Бывает ли, что вы выпиваете в одиночку?",
  "Случалось ли забыть, что было вчера из-за алкоголя?",
  "Прячете ли вы алкоголь от близких?",
  "Бывает ли утром похмелье и «опохмел»?",
  "Пытались ли вы бросать пить и срывались?",
  "Друзья или родные говорят, что вы слишком много пьёте?",
  "Пропускали ли работу/учёбу из-за похмелья?",
  "Нужна ли вам всё большая доза для того же эффекта?",
  "Чувствуете вину или стыд после пьянки?",
  "Готовы ли вы сейчас полностью отказаться от алкоголя на год?"
];

const resultData = [
  { min: 0, max: 2, title: "Трезвенник",          desc: "Вы почти не пьёте",                tokenId: 0 },
  { min: 3, max: 5, title: "Социальный любитель", desc: "Есть риски, но пока ок",           tokenId: 1 },
  { min: 6, max: 8, title: "На грани",            desc: "Срочно снижайте потребление!",     tokenId: 2 },
  { min: 9, max: 10,title: "Красный уровень",      desc: "Серьёзные признаки алкоголизма",   tokenId: 3 }
];

// ТВОЙ адрес контракта сюда ↓↓↓
const CONTRACT_ADDRESS = "0xD41a8860F97C246b1E33CA3Ee101Ac92AEA24E8c";

export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  
  const buttonIndex = req.body?.untrustedData?.buttonIndex;
  const params = new URLSearchParams(req.url.split("?")[1] || "");
  let score = parseInt(params.get("s") || "0");
  let q = parseInt(params.get("q") || "0");

  if (buttonIndex === 1) score += 1; // нажали «Да»
  q += 1;

  let html = "";

  if (q <= 10) {
    // Ещё вопрос
    html = `
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://i.imgur.com/8yX3vOa.png" />
      <meta property="fc:frame:image:aspect_ratio" content="1:1" />
      <meta property="fc:frame:button:1" content="Да" />
      <meta property="fc:frame:button:2" content="Нет" />
      <meta property="fc:frame:post_url" content="/api/frame?q=${q}&s=${score}" />
    `;
  } else {
    // Результат
    const result = resultData.find(r => score >= r.min && score <= r.max);
    const mintUrl = `https://nfts2me.com/api/mint/${CONTRACT_ADDRESS}?tokenId=${result.tokenId}&recipient=${req.body.untrustedData?.address}`;

    html = `
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://i.imgur.com/8yX3vOa.png" />
      <meta property="fc:frame:image:aspect_ratio" content="1:1" />
      <meta property="og:title" content="Алкоголик ли вы? Ваш результат: ${result.title}" />
      <meta property="og:description" content="${result.desc} (счёт ${score}/10)" />

      <meta property="fc:frame:button:1" content="Минт NFT «${result.title}»" />
      <meta property="fc:frame:button:1:action" content="tx" />
      <meta property="fc:frame:button:1:target" content="${mintUrl}" />

      <meta property="fc:frame:button:2" content="Поделиться" />
    `;
  }

  res.send(`<!DOCTYPE html><html><head>${html}</head><body></body></html>`);
}
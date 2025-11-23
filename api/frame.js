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
  { min: 0, max: 2, title: "Трезвенник", desc: "Вы почти не пьёте", tokenId: 0 },
  { min: 3, max: 5, title: "Социальный любитель", desc: "Есть риски, но пока ок", tokenId: 1 },
  { min: 6, max: 8, title: "На грани", desc: "Срочно снижайте потребление!", tokenId: 2 },
  { min: 9, max: 10, title: "Красный уровень", desc: "Серьёзные признаки алкоголизма", tokenId: 3 }
];

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Замени на свой

export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  // Парсим query params (для GET)
  const urlParams = new URLSearchParams(req.url.split("?")[1] || "");
  let score = parseInt(urlParams.get("s") || "0");
  let q = parseInt(urlParams.get("q") || "0"); // По умолчанию 0 для первого вопроса

  // Парсим POST body от Farcaster
  let body = {};
  if (req.body) {
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {}
  }
  const buttonIndex = body.untrustedData?.buttonIndex;

  if (buttonIndex === "1") score += 1; // "Да" — +1
  q += 1; // Переходим к следующему вопросу

  const baseUrl = `https://${req.headers.host}`;
  let metaTags = "";

  if (q <= 10) {
    // Вопрос — генерируем кнопки
    metaTags = `
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://via.placeholder.com/1200x1200/FF6B6B/FFFFFF?text=Вопрос+${q}+из+10" />
      <meta property="fc:frame:image:aspect_ratio" content="1:1" />
      <meta property="fc:frame:button:1" content="Да (+1 балл)" />
      <meta property="fc:frame:button:2" content="Нет (0 баллов)" />
      <meta property="fc:frame:post_url" content="${baseUrl}/api/frame?q=${q}&s=${score}" />
      <title>Вопрос ${q}/10: ${questions[q-1]}</title>
    `;
  } else {
    // Результат — кнопка минта
    const result = resultData.find(r => score >= r.min && score <= r.max) || resultData[0];
    const userAddress = body.untrustedData?.address || "0xTest";
    const mintUrl = `https://thirdweb.com/base/${CONTRACT_ADDRESS}/transactions/mintTo?recipient=${userAddress}&tokenId=${result.tokenId}`;

    metaTags = `
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://via.placeholder.com/1200x1200/00FF00/000000?text=${result.title}+(${score}%2F10)" />
      <meta property="fc:frame:image:aspect_ratio" content="1:1" />
      <meta property="og:title" content="Результат: ${result.title} (счёт ${score}/10)" />
      <meta property="og:description" content="${result.desc}" />
      <meta property="fc:frame:button:1" content="Минт NFT: ${result.title}" />
      <meta property="fc:frame:button:1:action" content="tx" />
      <meta property="fc:frame:button:1:target" content="${mintUrl}" />
      <meta property="fc:frame:button:2" content="Поделиться результатом" />
      <title>Результат: ${result.title}</title>
    `;
  }

  // Полный HTML с head и meta
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      ${metaTags}
    </head>
    <body style="font-family: Arial; text-align: center; padding: 20px; background: #f0f0f0;">
      <h1>Тест "Алкоголик ли вы?"</h1>
      ${q <= 10 ? `<p><strong>Вопрос ${q}/10:</strong><br>${questions[q-1]}</p><p>Текущий счёт: ${score}</p>` : `<p><strong>${result.title}</strong><br>${result.desc}<br>Счёт: ${score}/10</p>`}
      <p style="font-size: 12px; color: gray;">В Farcaster: кнопки появятся ниже превью. Если нет — проверь мета-теги.</p>
    </body>
    </html>
  `);
}

module.exports = handler;

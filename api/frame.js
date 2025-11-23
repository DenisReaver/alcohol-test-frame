// api/frame.js — исправленная версия для Vercel
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

// ТВОЙ адрес контракта (пока оставь заглушку, если не создал)
const CONTRACT_ADDRESS = "0xD41a8860F97C246b1E33CA3Ee101Ac92AEA24E8c"; // или "0x0000..." для теста

export default function handler(req, res) {
  // Устанавливаем тип ответа
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  // Парсим параметры (для GET/POST в Frame)
  const urlParams = new URLSearchParams(req.url.split("?")[1] || "");
  let score = parseInt(urlParams.get("s") || "0");
  let q = parseInt(urlParams.get("q") || "0");

  // Обрабатываем кнопку (из untrustedData в POST от Farcaster)
  const buttonIndex = req.body?.untrustedData?.buttonIndex;
  if (buttonIndex === "1") { // "Да" — +1 балл
    score += 1;
  }
  // Для кнопки 2 ("Нет") ничего не добавляем

  q += 1; // Следующий вопрос

  let metaTags = "";

  if (q <= 10) {
    // Ещё вопрос — показываем текст для отладки в body (но в Frame это скрыто)
    metaTags = `
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="	https://imgur.com/OsiSnAQ.png" />
      <meta property="fc:frame:image:aspect_ratio" content="1:1" />
      <meta property="fc:frame:button:1" content="Да (+1 балл)" />
      <meta property="fc:frame:button:2" content="Нет (0 баллов)" />
      <meta property="fc:frame:post_url" content="/api/frame?q=${q}&s=${score}" />
      <title>Вопрос ${q}/10: ${questions[q-1]}</title>
    `;
  } else {
    // Результат
    const result = resultData.find(r => score >= r.min && score <= r.max) || resultData[0];
    const userAddress = req.body?.untrustedData?.address || "0xTest";
    const mintUrl = `https://nfts2me.com/api/mint/${CONTRACT_ADDRESS}?tokenId=${result.tokenId}&recipient=${req.body.untrustedData?.address}`;

    metaTags = `
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="	https://imgur.com/OsiSnAQ.png" />
      <meta property="fc:frame:image:aspect_ratio" content="1:1" />
      <meta property="og:title" content="Результат: ${result.title} (счёт ${score}/10)" />
      <meta property="og:description" content="${result.desc}" />

      <meta property="fc:frame:button:1" content="Минт NFT: ${result.title}" />
      <meta property="fc:frame:button:1:action" content="tx" />
      <meta property="fc:frame:button:1:target" content="${mintUrl}" />

      <meta property="fc:frame:button:2" content="Поделиться результатом" />
      <title>Результат теста: ${result.title}</title>
    `;
  }

  // Возвращаем полный HTML
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      ${metaTags}
    </head>
    <body style="font-family: Arial; text-align: center; padding: 20px;">
      <h1>Тест "Алкоголик ли вы?"</h1>
      ${q <= 10 ? `<p><strong>Вопрос ${q}/10:</strong> ${questions[q-1]}</p><p>Текущий счёт: ${score}</p>` : `<p><strong>${result.title}</strong><br>${result.desc}<br>Счёт: ${score}/10</p>`}
      <p style="font-size: 12px; color: gray;">Это отладочный вид. В Farcaster Frame всё красиво!</p>
    </body>
    </html>
  `);
}

// Для Vercel — альтернативный экспорт (если первый не сработает)
module.exports = handler;

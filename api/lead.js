// Приём заявки с формы контактов.
//
// Живёт на сервере (Vercel Functions), а не в браузере, по одной причине:
// токен Telegram-бота нельзя показывать посетителям. В коде страницы его
// увидел бы любой, кто откроет исходник, и смог бы писать от имени бота.
// Здесь ключи берутся из переменных окружения и наружу не попадают.
//
// Переменные (Vercel → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN — токен от @BotFather
//   TELEGRAM_CHAT_ID   — id чата, куда слать (узнаётся через @userinfobot)
//   WEB3FORMS_KEY      — access key с web3forms.com
// Любой канал можно не настраивать: заявка уйдёт по тому, что задан.

const LIMITS = { contact: 200, msg: 2000 };

// Телеграм ломается на «<» и «&», если слать с parse_mode=HTML.
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function sendTelegram({ contact, msg, page, lang }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  // Получателей может быть несколько — заявка приходит каждому сотруднику в личку.
  // В переменной TELEGRAM_CHAT_ID перечисляем id через запятую: "123,456,789".
  const chatIds = String(process.env.TELEGRAM_CHAT_ID || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (!token || !chatIds.length) return { ok: false, skipped: true };

  const text =
    `<b>Заявка с сайта</b>\n\n` +
    `<b>Контакт:</b> ${esc(contact)}\n` +
    (msg ? `<b>Сообщение:</b> ${esc(msg)}\n` : '') +
    `\n<i>${esc(lang)} · ${esc(page)}</i>`;

  // Шлём каждому независимо: если один сотрудник не нажал Start в боте и
  // доставка ему падает, остальные всё равно получают заявку.
  const results = await Promise.allSettled(
    chatIds.map((chat_id) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' }),
      })
    )
  );

  // Успех канала = дошло хотя бы одному получателю.
  const ok = results.some((r) => r.status === 'fulfilled' && r.value.ok);
  return { ok, delivered: results.filter((r) => r.status === 'fulfilled' && r.value.ok).length, total: chatIds.length };
}

async function sendEmail({ contact, msg, page, lang }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: true };

  // Отправитель — на поддомене send.cues.com.ua, который верифицирован в Resend.
  // Основной домен и его почта (@cues.com.ua) при этом не затрагиваются.
  const from = process.env.RESEND_FROM || 'AS Cues <zayavka@send.cues.com.ua>';
  const to = process.env.RESEND_TO || 'ascuesdnepr@gmail.com';

  const html =
    `<h2>Заявка с сайта</h2>` +
    `<p><b>Контакт:</b> ${esc(contact)}</p>` +
    (msg ? `<p><b>Сообщение:</b> ${esc(msg)}</p>` : '') +
    `<p style="color:#888">${esc(lang)} · ${esc(page)}</p>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from,
      to,
      // reply_to = контакт клиента: можно ответить на письмо прямо из почты,
      // если это email. Для телефона/юзернейма поле просто игнорируется.
      reply_to: /@/.test(contact) ? contact : undefined,
      subject: `Заявка с сайта AS Cues — ${contact}`,
      html,
    }),
  });
  return { ok: r.ok, status: r.status };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const contact = String(body.contact || '').trim();
  const msg = String(body.msg || '').trim();

  // Ловушка для ботов: поле скрыто от людей, его заполняют только автоматы.
  // Отвечаем «успех», чтобы бот не пробовал снова, но никуда не шлём.
  if (body.company) return res.status(200).json({ ok: true });

  if (!contact) return res.status(400).json({ ok: false, error: 'contact_required' });
  if (contact.length > LIMITS.contact || msg.length > LIMITS.msg) {
    return res.status(400).json({ ok: false, error: 'too_long' });
  }

  const meta = {
    contact,
    msg,
    page: String(body.page || '').slice(0, 200) || '—',
    lang: String(body.lang || 'ru').slice(0, 5),
  };

  // Каналы независимы: падение одного не должно отменять доставку другим.
  const [tg, mail] = await Promise.allSettled([sendTelegram(meta), sendEmail(meta)]);
  const okTg = tg.status === 'fulfilled' && tg.value.ok;
  const okMail = mail.status === 'fulfilled' && mail.value.ok;

  if (okTg || okMail) return res.status(200).json({ ok: true });

  // Ни один канал не сработал — заявка потеряна, и посетителю надо об этом
  // сказать, иначе он уйдёт в уверенности, что с ним свяжутся.
  console.error('lead failed', {
    tg: tg.status === 'fulfilled' ? tg.value : String(tg.reason),
    mail: mail.status === 'fulfilled' ? mail.value : String(mail.reason),
  });
  return res.status(502).json({ ok: false, error: 'delivery_failed' });
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}

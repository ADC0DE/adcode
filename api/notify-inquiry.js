const nodemailer = require('nodemailer');

const SMTP = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'min1512@genaidev.io',
  pass: 'tlusdeaoectefhvm',
};

const ADMIN_TO = [
  'usarmy0220@naver.com',
  'thegoingsolution@gmail.com',
];

const BROCHURE_FILENAME = '애드코드_회사소개서_2026.pdf';
const BROCHURE_URL = `https://adcode.co.kr/public/${encodeURIComponent(BROCHURE_FILENAME)}`;

async function loadBrochureAttachment() {
  try {
    const res = await fetch(BROCHURE_URL);
    if (!res.ok) {
      console.warn('[notify-inquiry] brochure fetch failed', res.status);
      return null;
    }
    const content = Buffer.from(await res.arrayBuffer());
    return {
      filename: BROCHURE_FILENAME,
      content,
      contentType: 'application/pdf',
    };
  } catch (err) {
    console.warn('[notify-inquiry] brochure fetch error', err);
    return null;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildMail(inquiry) {
  const subject = `[ADCODE 문의] ${inquiry.company_name || ''} - ${inquiry.name || ''}`;
  const rows = [
    ['접수일시', inquiry.created_at || new Date().toISOString()],
    ['상호명', inquiry.company_name],
    ['성함', inquiry.name],
    ['연락처', inquiry.phone],
    ['이메일', inquiry.email],
    ['희망서비스', inquiry.services],
    ['연락방법', inquiry.contact_method],
    ['문의내용', inquiry.message],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v ?? ''}`).join('\n');
  const html = `
    <div style="font-family:Apple SD Gothic Neo,Malgun Gothic,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 16px">ADCODE 웹사이트 문의</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        ${rows.map(([k, v]) => `
          <tr>
            <th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f7f7f7;width:140px">${escapeHtml(k)}</th>
            <td style="padding:10px;border:1px solid #ddd;white-space:pre-wrap">${escapeHtml(v)}</td>
          </tr>
        `).join('')}
      </table>
      <p style="margin-top:16px;color:#666;font-size:13px">관리자 페이지에서 상태를 확인할 수 있습니다.</p>
    </div>
  `;

  return { subject, text, html };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const inquiry = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!inquiry.company_name || !inquiry.name || !inquiry.phone || !inquiry.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP.host,
      port: SMTP.port,
      secure: SMTP.secure,
      auth: {
        user: SMTP.user,
        pass: SMTP.pass,
      },
    });

    const mail = buildMail(inquiry);
    const brochure = await loadBrochureAttachment();
    await transporter.sendMail({
      from: `"ADCODE 문의" <${SMTP.user}>`,
      to: ADMIN_TO.join(', '),
      replyTo: inquiry.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      attachments: brochure ? [brochure] : [],
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[notify-inquiry]', err);
    return res.status(500).json({ error: 'Failed to send email', detail: String(err && err.message ? err.message : err) });
  }
};
